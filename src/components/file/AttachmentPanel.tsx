import React, {FC, useState} from "react";
import {UsedAttachments} from "~/hooks/useAttachments";
import useEndpoint from "~/hooks/useEndpoint";
import FileToUpload, {UploadedFileType} from "~/model/usergeneratedcontent/FileToUpload";
import FileUploaderDialog from "~/components/file/FileUploaderDialog";
import FileInfoModal from "~/components/file/FileInfoModal";

interface AttachmentInfo {
    fileId: number;
    fileName: string;
}

interface Props {
    usedAttachments: UsedAttachments;
    isEdited: boolean;
    /**
     * Set this if you want to limit allowed file types
     */
    onlyAllowUploadedFileType?: UploadedFileType;
}

const AttachmentPanel: FC<Props> = (props) => {
    const [isFileUploaderShown, setIsFileUploaderShown] = useState<boolean>(false);
    const [fileIdToShowInInfoModal, setFileIdToShowInInfoModal] = useState<number>(null);

    const usedEndpoint = useEndpoint<AttachmentInfo[]>({
        conf: {
            url: '/api/up/server/api/file/readBulkAttachmentInfo',
            method: 'post',
            data: {
                fileIds: props.usedAttachments.firmAttachmentIds
            }
        },
        deps: [props.usedAttachments.firmAttachmentIds],
        keepOldDataWhileFetchingNew: true,
    })

    function removeAttachment(id: number) {
        const confirmationResult
            = confirm("Sure? If you remove the attachment, it will be deleted. " +
            "People won't see the file even if you link it into the post as an image.");

        if (confirmationResult) {
            props.usedAttachments.removeAttachment(id);
        }
    }

    function cancelAttachmentUpload(attachmentUnderUpload: FileToUpload) {
        const confirmationResult
            = confirm("Sure? If you cancel the upload, the attachment, it will be deleted. " +
            "People won't see the file even if you link it into the post as an image.");

        if (confirmationResult) {
            props.usedAttachments.cancelAttachmentUpload(attachmentUnderUpload);
        }
    }

    function handleUploadInitiation(toUpload: FileToUpload) {
        props.usedAttachments.addAttachment(toUpload);
        setIsFileUploaderShown(false);
    }

    return (
        <div style={{borderStyle: 'dashed', borderColor: 'red', borderWidth: 1}}>
            <h3>Attachments</h3>
            <table>
                <tbody>
                {(!usedEndpoint.data) && usedEndpoint.pending && (
                    <tr>
                        <td>
                            <p>Pending...</p>
                        </td>
                    </tr>
                )}
                {usedEndpoint.failed && (
                    <tr>
                        <td>
                            <p>Couldn't fetch attachments :'(</p>
                            <button onClick={() => usedEndpoint.reloadEndpoint()}>Retry</button>
                        </td>
                    </tr>
                )}
                {(!usedEndpoint.failed) && usedEndpoint.data && (
                    <>
                        {
                            usedEndpoint.data.map(attachmentInfo => {
                                return (
                                    <tr key={attachmentInfo.fileId}>
                                        <td>
                                            <p>{attachmentInfo.fileName}</p>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => setFileIdToShowInInfoModal(attachmentInfo.fileId)}>More
                                            </button>
                                        </td>
                                        {props.isEdited && (
                                            <td>
                                                <button onClick={() => removeAttachment(attachmentInfo.fileId)}>Remove
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        }
                    </>
                )}

                {props.usedAttachments.attachmentsUnderUpload.map(fileUnderUpload => {
                    return (
                        <tr key={fileUnderUpload.key}>
                            <td>
                                <p>{fileUnderUpload.getFileName()}</p>
                            </td>
                            <td>
                                Uploading...
                            </td>
                            <td>
                                <button onClick={() => cancelAttachmentUpload(fileUnderUpload)}>Cancel</button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
            {fileIdToShowInInfoModal && (
                <FileInfoModal fileId={fileIdToShowInInfoModal}/>
            )}
            {props.isEdited && (
                <>
                    <button onClick={() => setIsFileUploaderShown(true)}>Add attachment</button>
                    <FileUploaderDialog uploadedFileType={props.onlyAllowUploadedFileType ?? UploadedFileType.ANY}
                                        onUploadInitiation={handleUploadInitiation}
                                        isOpen={isFileUploaderShown}
                                        onClose={() => setIsFileUploaderShown(false)}
                    />
                </>
            )}
        </div>
    )
};

export default AttachmentPanel;
