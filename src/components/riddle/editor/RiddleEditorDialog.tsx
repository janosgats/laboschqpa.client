import React, {FC, useEffect, useState} from "react";
import {Button, Dialog, DialogActions, DialogContent} from "@material-ui/core";
import {Riddle} from "~/model/usergeneratedcontent/Riddle";
import CreatedEntityResponse from "~/model/CreatedEntityResponse";
import useEndpoint, {UsedEndpoint} from "~/hooks/useEndpoint";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import {isValidNonEmptyString} from "~/utils/CommonValidators";
import useAttachments, {UsedAttachments} from "~/hooks/useAttachments";
import {AxiosRequestConfig} from "axios";
import AttachmentPanel from "~/components/file/AttachmentPanel";
import ApiErrorDescriptorException from "~/exception/ApiErrorDescriptorException";
import {riddle_A_RIDDLE_HAS_TO_HAVE_EXACTLY_ONE_ATTACHMENT} from "~/enums/ApiErrors";
import {NOTIFICATION_TIMEOUT_LONG} from "~/components/eventDisplay/AppNotificationEventDisplay";
import {UploadedFileType} from "~/model/usergeneratedcontent/FileToUpload";
import {RiddleCategory} from "~/enums/RiddleCategory";
import RiddleCategorySelector from "~/components/selector/RiddleCategorySelector";

interface Props {
    onClose: (didEntityChangeHappen: boolean) => void;
    isOpen: boolean;

    isCreatingNew: boolean;
    idToEdit?: number;

    defaultCategory?: RiddleCategory;
}

const RiddleEditorDialog: FC<Props> = (props) => {
    const [title, setTitle] = useState<string>('');
    const [category, setCategory] = useState<RiddleCategory>(props.defaultCategory ?? RiddleCategory.EVEN_BETTER);
    const [solution, setSolution] = useState<string>('');
    const [hint, setHint] = useState<string>('');
    const usedAttachments: UsedAttachments = useAttachments([]);

    const usedEndpoint: UsedEndpoint<Riddle> = useEndpoint<Riddle>({
        conf: {
            url: '/api/up/server/api/riddleEditor/riddle',
            params: {
                id: props.idToEdit
            }
        },
        deps: [props.idToEdit],
        enableRequest: !props.isCreatingNew && props.isOpen,
        customSuccessProcessor: axiosResponse => {
            const data = axiosResponse.data;

            setTitle(data.title);
            setCategory(data.category);
            setSolution(data.solution);
            setHint(data.hint);
            usedAttachments.reset(data.attachments);

            return data;
        }
    });

    useEffect(() => {
        if (!props.isOpen) {
            setTitle('');
            setSolution('');
            setHint('');
            usedAttachments.reset([]);
        } else {
            setCategory(props.defaultCategory ?? RiddleCategory.EVEN_BETTER);
        }
    }, [props.isOpen])

    function handleSaveButtonClicked() {
        const requestConfig: AxiosRequestConfig = {
            method: 'POST',
            data: {
                title: title,
                hint: hint,
                category: category,
                solution: solution,
                attachments: usedAttachments.firmAttachmentIds,
            }
        }

        if (props.isCreatingNew) {
            requestConfig.url = '/api/up/server/api/riddleEditor/createNew';
        } else {
            requestConfig.url = '/api/up/server/api/riddleEditor/edit';
            requestConfig.data.id = props.idToEdit;
        }

        callJsonEndpoint<CreatedEntityResponse>({
            conf: requestConfig
        }).then(() => {
            props.onClose(true);
        }).catch((reason) => {
            if (reason instanceof ApiErrorDescriptorException) {
                if (riddle_A_RIDDLE_HAS_TO_HAVE_EXACTLY_ONE_ATTACHMENT.is(reason.apiErrorDescriptor)) {
                    EventBus.notifyWarning('Make sure your riddle has exactly one attachment',
                        'Wrong number of attachments', NOTIFICATION_TIMEOUT_LONG);
                    return;
                }
            }
            EventBus.notifyError('Error while saving changes :/')
        });
    }

    function handleDeleteButtonClicked() {
        if (!confirm('Deleting this riddle? Are you sure? ')) {
            return;
        }

        callJsonEndpoint<CreatedEntityResponse>({
            conf: {
                url: '/api/up/server/api/riddleEditor/delete',
                method: 'DELETE',
                params: {
                    id: props.idToEdit,
                }
            }
        }).then(() => {
            props.onClose(true);
        }).catch(() => {
            EventBus.notifyError('Error while deleting riddle :/')
        });
    }

    const isSaveButtonEnabled: boolean = isValidNonEmptyString(title)
        && isValidNonEmptyString(solution)
        && usedAttachments.firmAttachmentIds.length === 1
        && (props.isCreatingNew || usedEndpoint.succeeded);

    return (
        <Dialog open={props.isOpen} onClose={() => props.onClose(false)}>
            <DialogContent>
                {!props.isCreatingNew && (
                    <>
                        {usedEndpoint.pending && (
                            <p>Fetching requested riddle...</p>
                        )}
                        {usedEndpoint.failed && (
                            <>
                                <p>Error while fetching existing riddle :'(</p>
                                <button onClick={() => usedEndpoint.reloadEndpoint()}>Retry</button>
                            </>
                        )}
                    </>
                )}

                {(props.isCreatingNew || usedEndpoint.succeeded) && (
                    <>
                        <label>Title: </label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)}/>
                        <br/>
                        <RiddleCategorySelector value={category} onChange={setCategory}/>
                        <br/>
                        <label>Solution: </label>
                        <input type="text" value={solution} onChange={e => setSolution(e.target.value)}/>
                        <br/>
                        <label>Hint: </label>
                        <input type="text" value={hint} onChange={e => setHint(e.target.value)}/>
                        <br/>
                        <AttachmentPanel usedAttachments={usedAttachments}
                                         isEdited={true}
                                         onlyAllowUploadedFileType={UploadedFileType.IMAGE}/>
                    </>
                )}

            </DialogContent>
            <DialogActions>
                {!props.isCreatingNew && (
                    <Button onClick={handleDeleteButtonClicked} color="secondary">
                        Delete riddle
                    </Button>
                )}
                <Button onClick={handleSaveButtonClicked} color="primary" disabled={!isSaveButtonEnabled}>
                    {props.isCreatingNew ? 'Create riddle' : 'Modify riddle'}
                </Button>
                <Button onClick={() => props.onClose(false)} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RiddleEditorDialog;