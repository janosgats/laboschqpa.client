import React, {FC, useContext, useRef, useState} from 'react'
import BackupIcon from '@material-ui/icons/Backup'
import MUIRichTextEditor, {TAsyncAtomicBlockResponse, TMUIRichTextEditorRef} from "mui-rte";
import EventBus from "~/utils/EventBus";
import {convertToRaw} from "draft-js";
import {UsedAttachments} from "~/hooks/useAttachments";
import FileUploaderDialog from "~/components/file/FileUploaderDialog";
import {NOTIFICATION_TIMEOUT_LONG} from "~/components/eventDisplay/AppNotificationEventDisplay";
import FileToUpload, {UploadedFileType} from "~/model/usergeneratedcontent/FileToUpload";
import {ImageBlock} from "~/components/textEditor/imageBlock/ImageBlock";
import EditorContextProvider, {EditorContext} from "~/context/EditorContextProvider";
import {ImageAlignment, ImageBlockSpec} from "~/components/textEditor/imageBlock/ImageBlockTypes";
import LinkDecorator, {LinkMatcherRegex} from "~/components/textEditor/LinkDecorator";
import {createStyles, makeStyles, Paper, Theme} from '@material-ui/core';
import {getStyles} from './styles/style';


const useStyles = makeStyles((theme: Theme) => createStyles(getStyles(theme)))

interface Props {
    isEdited: boolean;
    readOnlyControls: boolean;
    defaultValue?: string;
    resetTrigger: number;
    onChange?: (data: string) => void;
    usedAttachments?: UsedAttachments;
}

interface ImageUploadAsyncAtomicBlockResponse extends TAsyncAtomicBlockResponse {
    data: ImageBlockSpec;
}

function uploadImage(fileToUpload: FileToUpload, usedAttachments: UsedAttachments): Promise<ImageUploadAsyncAtomicBlockResponse> {
    return usedAttachments.addAttachment(fileToUpload)
        .then(createdFileResponse => {
            if (typeof createdFileResponse.mimeType === 'string'
                && createdFileResponse.mimeType.startsWith('image')) {
                return {
                    data: {
                        isExternalImage: false,
                        indexedFileId: createdFileResponse.createdFileId,
                        size: 300,
                        alignment: ImageAlignment.center,
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

const RichTextEditor: FC<Props> = (props) => {
    const classes = useStyles();

    const editorContext = useContext(EditorContext);

    const ref = useRef<TMUIRichTextEditorRef>(null);

    const [isUploadImageModalOpen, setIsUploadImageModalOpen] = useState<boolean>(false);

    const enableImageUpload = !!props.usedAttachments;

    function handleFileUpload(fileToUpload: FileToUpload) {
        if (enableImageUpload && fileToUpload) {
            ref.current?.insertAtomicBlockAsync(
                "image-block",
                uploadImage(fileToUpload, props.usedAttachments),
                "...image...");
        }
    }

    return (
        <>
            <FileUploaderDialog uploadedFileType={UploadedFileType.IMAGE}
                onUploadInitiation={fileToUpload => {
                    handleFileUpload(fileToUpload);
                    setIsUploadImageModalOpen(false);
                }}
                isOpen={isUploadImageModalOpen}
                onClose={() => setIsUploadImageModalOpen(false)}
            />
            <Paper variant="outlined" elevation={3} className={classes.richTextEditorPaper}>
                <MUIRichTextEditor
                    key={props.resetTrigger}
                    readOnly={editorContext.isMuiRteReadonly}
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
                            regex: LinkMatcherRegex
                        }
                    ]}
                    controls={[
                        "title", "bold", "italic", "underline", "strikethrough",
                        "bulletList", "numberList",
                        "quote", "code", "highlight", "clear",
                        "link", ...(enableImageUpload ? ["upload-image"] : []),
                    ]}
                    customControls={[
                        {
                            name: "upload-image",
                            icon: <BackupIcon />,
                            type: "callback",
                            onClick: (_editorState, _name, anchor) => {
                                setIsUploadImageModalOpen(true);
                            }
                        },
                        {
                            name: "image-block",
                            type: "atomic",
                            atomicComponent: ImageBlock
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
            </Paper>
        </>
    )
};

const ContextWrappedRichTextEditor: FC<Props> = (props) => {
    return (
        <EditorContextProvider areSubcomponentsEditable={props.isEdited && !props.readOnlyControls}>
            <RichTextEditor {...props} />
        </EditorContextProvider>
    )
}

export default ContextWrappedRichTextEditor;