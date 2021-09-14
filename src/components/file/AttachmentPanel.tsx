import {
    Box,
    Button,
    CircularProgress,
    Collapse,
    createStyles,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    makeStyles,
    Theme,
    Tooltip,
    Typography,
} from '@material-ui/core';
import {ExpandLess, ExpandMore} from '@material-ui/icons';
import AttachFileOutlinedIcon from '@material-ui/icons/AttachFileOutlined';
import AttachmentIcon from '@material-ui/icons/Attachment';
import BackupIcon from '@material-ui/icons/Backup';
import ClearIcon from '@material-ui/icons/Clear';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import React, {FC, useState} from 'react';
import FileInfoModal from '~/components/file/FileInfoModal';
import FileUploaderDialog from '~/components/file/FileUploaderDialog';
import {UsedAttachments} from '~/hooks/useAttachments';
import useEndpoint from '~/hooks/useEndpoint';
import FileToUpload, {UploadedFileType} from '~/model/usergeneratedcontent/FileToUpload';
import Spinner from '../Spinner';
import styles from './styles/attachmentPanelStyle';
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

const useStyles = makeStyles((theme: Theme) => createStyles(styles));

const AttachmentPanel: FC<Props> = (props) => {
    const classes = useStyles();
    const [isFileUploaderShown, setIsFileUploaderShown] = useState<boolean>(false);
    const [fileIdToShowInInfoModal, setFileIdToShowInInfoModal] = useState<number>(null);

    const usedEndpoint = useEndpoint<AttachmentInfo[]>({
        conf: {
            url: '/api/up/server/api/file/readBulkAttachmentInfo',
            method: 'post',
            data: {
                fileIds: props.usedAttachments.firmAttachmentIds,
            },
        },
        deps: [props.usedAttachments.firmAttachmentIds],
        keepOldDataWhileFetchingNew: true,
    });

    function removeAttachment(id: number) {
        const confirmationResult = confirm(
            'Sure? If you remove the attachment, it will be deleted. ' +
                "People won't see the file even if you link it into the post as an image."
        );

        if (confirmationResult) {
            props.usedAttachments.removeAttachment(id);
        }
    }

    function cancelAttachmentUpload(attachmentUnderUpload: FileToUpload) {
        const confirmationResult = confirm(
            'Sure? If you cancel the upload, the attachment, it will be deleted. ' +
                "People won't see the file even if you link it into the post as an image."
        );

        if (confirmationResult) {
            props.usedAttachments.cancelAttachmentUpload(attachmentUnderUpload);
        }
    }

    function handleUploadInitiation(toUpload: FileToUpload) {
        props.usedAttachments.addAttachment(toUpload);
        setIsFileUploaderShown(false);
    }

    const [isAttachmentsDisplayed, setIsAttachmentsDisplayed] = useState(false);
    return (
        <Box className={classes.attachmentPanelContainer}>
            {!usedEndpoint.data && usedEndpoint.pending && <Spinner />}
            {usedEndpoint.failed && (
                <>
                    <p>Couldn't fetch attachments :'(</p>
                    <button onClick={() => usedEndpoint.reloadEndpoint()}>Retry</button>
                </>
            )}
            {!usedEndpoint.failed && usedEndpoint.data && (
                <>
                    {usedEndpoint.data.length > 0 ? (
                        <>
                            <List>
                                <ListItem
                                    button
                                    onClick={() => {
                                        setIsAttachmentsDisplayed(!isAttachmentsDisplayed);
                                    }}
                                >
                                    <ListItemIcon>
                                        <AttachmentIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Csatolt fájlok" />
                                    {isAttachmentsDisplayed ? <ExpandLess /> : <ExpandMore />}
                                </ListItem>
                            </List>
                            <Collapse in={isAttachmentsDisplayed} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {usedEndpoint.data.map((attachmentInfo) => {
                                        return (
                                            <ListItem>
                                                <ListItemAvatar>
                                                    <AttachFileOutlinedIcon />
                                                </ListItemAvatar>
                                                <ListItemText primary={attachmentInfo.fileName} />
                                                <ListItemSecondaryAction>
                                                    <IconButton onClick={() => setFileIdToShowInInfoModal(attachmentInfo.fileId)}>
                                                        <MoreHorizIcon />
                                                    </IconButton>
                                                    {props.isEdited && (
                                                        <IconButton onClick={() => removeAttachment(attachmentInfo.fileId)}>
                                                            <RemoveCircleOutlineIcon />
                                                        </IconButton>
                                                    )}
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </Collapse>
                            <Divider variant="middle" />
                        </>
                    ) : null}
                </>
            )}

            {props.isEdited && (
                <>
                    <Grid container justify="center" className={classes.buttonGrid}>
                        <Button
                            variant="text"
                            endIcon={<BackupIcon />}
                            onClick={() => setIsFileUploaderShown(true)}
                            color="secondary"
                            fullWidth
                            size="medium"
                        >
                            Fájl feltöltés
                        </Button>
                    </Grid>

                    <FileUploaderDialog
                        uploadedFileType={props.onlyAllowUploadedFileType ?? UploadedFileType.ANY}
                        onUploadInitiation={handleUploadInitiation}
                        isOpen={isFileUploaderShown}
                        onClose={() => setIsFileUploaderShown(false)}
                    />
                </>
            )}

            {props.usedAttachments.attachmentsUnderUpload.map((fileUnderUpload) => {
                return (
                    <Grid container alignItems="center" spacing={1}>
                        <Typography variant="body1">{fileUnderUpload.getFileName()}</Typography>
                        <CircularProgress />
                        <Tooltip title="Cancel upload">
                            <IconButton onClick={() => cancelAttachmentUpload(fileUnderUpload)}>
                                <ClearIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                );
            })}

            {fileIdToShowInInfoModal && <FileInfoModal fileId={fileIdToShowInInfoModal} onClose={() => setFileIdToShowInInfoModal(null)} />}
        </Box>
    );
};

export default AttachmentPanel;
