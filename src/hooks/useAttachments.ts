import {useState} from "react";
import EventBus from "~/utils/EventBus";
import FileUploadCancelledByUserException from "~/exception/FileUploadCancelledByUserException";
import FileToUpload, {CreatedFileResponse} from "~/model/usergeneratedcontent/FileToUpload";

export interface UsedAttachments {
    firmAttachmentIds: number[];
    attachmentsUnderUpload: FileToUpload[];
    removeAttachment: (id: number) => void;
    cancelAttachmentUpload: (attachmentUnderUpload: FileToUpload) => void;
    addAttachment: (toUpload: FileToUpload) => Promise<CreatedFileResponse>;
    /**
     * Sets firm attachment IDs and removes attachments under upload
     */
    reset: (attachmentIdsToResetTo: number[]) => void;
}

const useAttachments = (defaultAttachmentIds: number[]): UsedAttachments => {
    const [attachmentIds, setAttachmentIds] = useState<number[]>(defaultAttachmentIds);
    const [attachmentsUnderUpload, setAttachmentsUnderUpload] = useState<FileToUpload[]>([]);

    function reset(attachmentIdsToResetTo: number[]) {
        setAttachmentIds(attachmentIdsToResetTo);
        setAttachmentsUnderUpload([]);
    }

    function removeAttachment(id: number) {
        setAttachmentIds(
            attachmentIds.filter(value => value !== id)
        );
    }

    function cancelAttachmentUpload(attachmentUnderUpload: FileToUpload) {
        attachmentUnderUpload.cancelUpload();
        setAttachmentsUnderUpload(
            attachmentsUnderUpload.filter(value => value.key !== attachmentUnderUpload.key)
        );
    }

    function addAttachment(toUpload: FileToUpload): Promise<CreatedFileResponse> {
        setAttachmentsUnderUpload([...attachmentsUnderUpload, toUpload]);

        return toUpload.upload()
            .then(resp => {
                setAttachmentIds([...attachmentIds, resp.data.createdFileId]);
                return resp.data;
            })
            .catch(e => {
                if (!(e instanceof FileUploadCancelledByUserException)) {
                    EventBus.notifyError(`Attachment: ${toUpload.getFileName()}`, 'Error while uploading');
                }
                throw e;
            })
            .finally(() => {
                setAttachmentsUnderUpload(
                    attachmentsUnderUpload.filter(value => value.key !== toUpload.key)
                );
            });
    }

    return {
        firmAttachmentIds: attachmentIds,
        attachmentsUnderUpload: attachmentsUnderUpload,
        removeAttachment: removeAttachment,
        cancelAttachmentUpload: cancelAttachmentUpload,
        addAttachment: addAttachment,
        reset: reset,
    };
};

export default useAttachments;
