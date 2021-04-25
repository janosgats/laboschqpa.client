import React, {FC, useState} from "react";
import {UsedAttachments} from "~/hooks/useAttachments";
import useEndpoint from "~/hooks/useEndpoint";
import FileToUpload, {UploadedFileType} from "~/model/usergeneratedcontent/FileToUpload";
import FileUploader from "~/components/file/FileUploader";

interface AttachmentInfo {
    fileId: number;
    fileName: string;
}

interface Props {
    usedAttachments: UsedAttachments;
    isEdited: boolean;
}

const AttachmentPanel: FC<Props> = (props) => {
    const [isFileUploaderShown, setIsFileUploaderShown] = useState<boolean>(false);

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
        <div style={{borderStyle:'dashed', borderColor:'red', borderWidth:1}}>
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
                {usedEndpoint.error && (
                    <tr>
                        <td>
                            <p>Couldn't fetch attachments :'(</p>
                            <button onClick={() => usedEndpoint.reloadEndpoint()}>Retry</button>
                        </td>
                    </tr>
                )}
                {(!usedEndpoint.error) && usedEndpoint.data && (
                    <>
                        {
                            usedEndpoint.data.map(attachmentInfo => {
                                return (
                                    <tr key={attachmentInfo.fileId}>
                                        <td>
                                            <p>{attachmentInfo.fileName}</p>
                                        </td>
                                        <td>
                                            <button onClick={() => alert('TODO: Show FileDisplay')}>More</button>
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
            {props.isEdited && (
                <>
                    <button onClick={() => setIsFileUploaderShown(true)}>Add attachment</button>
                    {isFileUploaderShown && (
                        <FileUploader uploadedFileType={UploadedFileType.ANY}
                                      onUploadInitiation={handleUploadInitiation}/>
                    )}
                </>
            )}
        </div>
    )
};

export default AttachmentPanel;
