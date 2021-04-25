import {getUniqueIndex} from "~/utils/UniqueGenerator";
import {AxiosResponse} from "axios";
import callJsonEndpoint, {CSRF_TOKEN_HEADER_NAME} from "~/utils/api/callJsonEndpoint";
import * as CsrfService from "~/service/CsrfService";
import UnauthorizedApiCallException from "~/exception/UnauthorizedApiCallException";
import EventBus from "~/utils/EventBus";
import ApiErrorDescriptorException from "~/exception/ApiErrorDescriptorException";
import {upload_MIME_TYPE_IS_NOT_IMAGE} from "~/enums/ApiErrors";
import FileUploadCancelledByUserException from "~/exception/FileUploadCancelledByUserException";

export interface CreatedFileResponse {
    createdFileId: number;
    mimeType: string;
}

export enum UploadedFileType {
    ANY = 'any',
    IMAGE = 'image',
}

export default class FileToUpload {
    public readonly key: number;
    private readonly file: File;
    private readonly uploadedFileType: UploadedFileType;
    private cancelled: boolean = false;

    public constructor(file: File, uploadedFileType: UploadedFileType) {
        this.key = getUniqueIndex();
        this.file = file;
        this.uploadedFileType = uploadedFileType;
    }

    public getFileName(): string {
        return this.file.name;
    }

    public getFile(): File {
        return this.file;
    }

    /**
     * TODO: This function should stop the actual upload request (with multipart?)
     */
    public cancelUpload() {
        this.cancelled = true;
    }

    public isCancelled(): boolean {
        return this.cancelled;
    }

    public async upload(): Promise<AxiosResponse<CreatedFileResponse>> {
        const formData = new FormData();
        formData.append("approximateFileSize", this.file.size && this.file.size.toString());
        formData.append("fileToUpload", this.file, this.file.name);

        return callJsonEndpoint<CreatedFileResponse>({
            conf: {
                url: `/filehost/file/${this.uploadedFileType}`,
                method: 'post',
                data: formData,
                headers: {
                    [CSRF_TOKEN_HEADER_NAME]: await CsrfService.getCsrfToken()
                }
            }, insertJsonContentType: false
        }).catch(e => {
            if (e instanceof UnauthorizedApiCallException) {
                EventBus.notifyWarning('Make sure you are logged in and part of a team!',
                    'Unauthorized to upload file')
            }
            if (e instanceof ApiErrorDescriptorException) {
                if (upload_MIME_TYPE_IS_NOT_IMAGE.is(e.apiErrorDescriptor)) {
                    EventBus.notifyWarning('The file is not an image', 'Wrong MIME Type')
                }
                //TODO: Display more messages based on ApiErrorDescriptor
            }
            throw e;
        }).then(res => {
            if (this.isCancelled()) {
                throw new FileUploadCancelledByUserException();
            }
            return res;
        });
    }

}