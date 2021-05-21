import React, {FC, FunctionComponent, useEffect, useRef, useState} from 'react'
import BackupIcon from '@material-ui/icons/Backup'
import MUIRichTextEditor, {TAsyncAtomicBlockResponse, TMUIRichTextEditorRef} from "mui-rte";
import EventBus from "~/utils/EventBus";
import {convertToRaw} from "draft-js";
import {UsedAttachments} from "~/hooks/useAttachments";
import FileUploader from "~/components/file/FileUploader";
import {ClickAwayListener, Popover} from "@material-ui/core";
import FileHostUtils from "~/utils/FileHostUtils";
import {NOTIFICATION_TIMEOUT_LONG} from "~/components/eventDisplay/AppNotificationEventDisplay";
import FileToUpload, {UploadedFileType} from "~/model/usergeneratedcontent/FileToUpload";

type TUploadImagePopoverState = {
    anchor: TAnchor
    isCancelled: boolean
}

type TAnchor = HTMLElement | null

interface IUploadImagePopoverProps {
    anchor: TAnchor
    onUploadInitiation: (fileToUpload: FileToUpload) => void
    onCancel: () => void
}

const UploadImagePopover: FunctionComponent<IUploadImagePopoverProps> = (props) => {
    const [state, setState] = useState<TUploadImagePopoverState>({
        anchor: null,
        isCancelled: false
    })

    useEffect(() => {
        setState({
            anchor: props.anchor,
            isCancelled: false
        })
    }, [props.anchor])

    return (
        <ClickAwayListener onClickAway={props.onCancel}>
            <Popover
                anchorEl={state.anchor}
                open={state.anchor !== null}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right"
                }}
            >
                <FileUploader uploadedFileType={UploadedFileType.IMAGE} onUploadInitiation={props.onUploadInitiation}/>
                <button onClick={props.onCancel}>Cancel</button>
            </Popover>
        </ClickAwayListener>
    )
}

const LinkDecorator: FunctionComponent<{ decoratedText: string }> = (props) => {
    let targetUrl = '';
    if (!props.decoratedText.startsWith('http://') && !props.decoratedText.startsWith('https://')) {
        targetUrl = 'http://';
    }
    targetUrl += props.decoratedText;

    return (
        <a
            href={targetUrl}
            target={"_blank"}
            onClick={(e) => {
                try {
                    if (e.ctrlKey) {
                        window.open(targetUrl, '_blank').focus();
                    }
                } catch (e) {
                    console.error("Cannot open link", [e]);
                    EventBus.notifyWarning(e.message, "Cannot open link");
                }
            }}
            style={{
                color: "blue",
                cursor: "pointer",
                textDecoration: "underline",
            }}
        >
            {props.children}
        </a>
    )
}

interface Props {
    isEdited: boolean;
    readOnlyControls: boolean;
    defaultValue?: string;
    onChange?: (data: string) => void;
    usedAttachments?: UsedAttachments;
}

const RichTextEditor: FC<Props> = (props) => {
    const ref = useRef<TMUIRichTextEditorRef>(null);
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);

    const enableImageUpload = !!props.usedAttachments;

    function handleFileUpload(fileToUpload: FileToUpload) {
        if (enableImageUpload && fileToUpload) {
            //TODO: replace "IMAGE" with an atomicComponent (customControl) that magnifies the images when clicked, and requests appropriate image sizes
            ref.current?.insertAtomicBlockAsync("IMAGE", uploadImage(fileToUpload), "...image...")
        }
    }

    function uploadImage(fileToUpload: FileToUpload): Promise<TAsyncAtomicBlockResponse> {
        return props.usedAttachments.addAttachment(fileToUpload)
            .then(createdFileResponse => {
                if (typeof createdFileResponse.mimeType === 'string'
                    && createdFileResponse.mimeType.startsWith('image')) {
                    return {
                        data: {
                            url: FileHostUtils.getUrlOfFile(createdFileResponse.createdFileId),
                            width: 300,
                            alignment: "center",
                            type: "image",
                        }
                    };
                }
                EventBus.notifyWarning(
                    'The uploaded file is not an image',
                    'Added as attachment',
                    NOTIFICATION_TIMEOUT_LONG
                );
                throw 'The uploaded file is not an image!';
            });
    }

    return (
        <>
            <UploadImagePopover
                anchor={anchor}
                onUploadInitiation={(fileToUpload) => {
                    handleFileUpload(fileToUpload)
                    setAnchor(null)
                }}
                onCancel={() => {
                    setAnchor(null)
                }}
            />
            <MUIRichTextEditor
                readOnly={!props.isEdited || props.readOnlyControls}
                toolbar={props.isEdited}
                defaultValue={props.defaultValue}
                onChange={(state) => {
                    if (props.onChange) {
                        props.onChange(JSON.stringify(convertToRaw(state.getCurrentContent())));
                    }
                }}

                label="Start typing or drop a file inside the editor..."
                ref={ref}
                decorators={[
                    {
                        component: LinkDecorator,
                        regex: /((https?:\/\/)|(www\.))[^\s]+/gi
                    }
                ]}
                controls={[
                    "title", "bold", "italic", "underline", "strikethrough",
                    "bulletList", "numberList",
                    "quote", "code", "highlight", "clear",
                    "link", "media", ...(enableImageUpload ? ["upload-image"] : []),
                ]}
                customControls={[
                    {
                        name: "upload-image",
                        icon: <BackupIcon/>,
                        type: "callback",
                        onClick: (_editorState, _name, anchor) => {
                            setAnchor(anchor)
                        }
                    },
                ]}
                draftEditorProps={{
                    handleDroppedFiles: (_selectionState, files) => {
                        if (files.length && (files[0] as File).name !== undefined) {
                            handleFileUpload(new FileToUpload(files[0] as File, UploadedFileType.ANY))
                            return "handled"
                        }
                        return "not-handled"
                    }
                }}
            />
        </>
    )
}

export default RichTextEditor