import React, {useContext, useEffect, useState} from 'react'
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Authority} from "~/enums/Authority";
import {NewsPost} from "~/model/usergeneratedcontent/NewsPost";
import RichTextEditor from "~/components/textEditor/RichTextEditor";
import MuiRteUtils from "~/utils/MuiRteUtils";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import {FetchableDisplay, FetchingTools} from "~/model/FetchableDisplay";
import CreatedEntityResponse from "~/model/CreatedEntityResponse";
import UserInfoService, {Author} from "~/service/UserInfoService";
import UserNameFormatter from "~/utils/UserNameFormatter";
import EventBus from "~/utils/EventBus";
import DateTimeFormatter from "~/utils/DateTimeFormatter";
import useAttachments, {UsedAttachments} from "~/hooks/useAttachments";
import AttachmentPanel from "~/components/file/AttachmentPanel";
import {
    Avatar,
    Card,
    CardContent,
    CardHeader,
    Collapse,
    createStyles,
    Grid,
    IconButton,
    makeStyles,
    Theme,
    Tooltip,
    Typography
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import DescriptionIcon from '@material-ui/icons/Description';
import {styles} from './styles/NewsPostDisplayStyle';

export interface SaveNewsPostCommand {
    content: string;
    attachments: number[];
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles(styles)
)

const NewsPostDisplay: FetchableDisplay<NewsPost, SaveNewsPostCommand> = (props) => {

    const classes = useStyles();

    const defaultContent = props.isCreatingNew ? MuiRteUtils.emptyEditorContent : props.existingEntity.content;
    const defaultAttachments = props.isCreatingNew ? [] : props.existingEntity.attachments;

    const currentUser = useContext(CurrentUserContext);
    const [isEdited, setIsEdited] = useState<boolean>(props.isCreatingNew);
    const [resetTrigger, setResetTrigger] = useState<number>(1);

    const [content, setContent] = useState<string>(defaultContent);
    const usedAttachments: UsedAttachments = useAttachments(defaultAttachments);

    const [author, setAuthor] = useState<Author>();
    const [isAuthorFetchingPending, setIsAuthorFetchingPending] = useState<boolean>(false);
    const [showAuthor, setShowAuthor] = useState<boolean>(false);

    useEffect(() => {
        setContent(defaultContent);
        usedAttachments.reset(defaultAttachments);
    }, [props.existingEntity]);

    function composeSaveNewsPostCommand(): SaveNewsPostCommand {
        return {
            content: content,
            attachments: usedAttachments.firmAttachmentIds
        };
    }

    function doSave() {
        if (usedAttachments.attachmentsUnderUpload.length > 0) {
            EventBus.notifyWarning("Please wait until all the attachments are uploaded!", "You really shouldn't save yet");
            return;
        }

        props.onSave(composeSaveNewsPostCommand());
    }

    function doCancelEdit() {
        const confirmResult = confirm('Do you want to discard your changes?');
        if (confirmResult) {
            setIsEdited(false);
            setResetTrigger(resetTrigger + 1)
            setContent(defaultContent);
            usedAttachments.reset(defaultAttachments);
            props.onCancelEditing();
        }
    }

    function doDelete() {
        const surelyDelete: boolean = confirm("Do you want to delete this NewsPost?");
        if (surelyDelete) {
            props.onDelete();
        }
    }

    function fetchAuthor() {
        if (showAuthor) {
            return setShowAuthor(false);
        }

        setShowAuthor(true);

        if (author) return;
        UserInfoService.getAuthor(props.existingEntity.creatorUserId, props.existingEntity.editorUserId, false)
            .then((value) => {
                setAuthor(value)
            })
            .catch(() => EventBus.notifyError("Error while loading Author"))
            .finally(() => setIsAuthorFetchingPending(false));
    }


    return (
        <Card className={classes.cardRoot} >
            {!currentUser.hasAuthority(Authority.NewsPostEditor) && (
                <CardHeader
                    className={classes.cardHeader}
                    avatar={
                        <Avatar>
                            <DescriptionIcon />
                        </Avatar>
                    }
                />
            )}
            {(!isEdited)
                && currentUser.hasAuthority(Authority.NewsPostEditor) && (
                    <CardHeader
                        className={classes.cardHeader}
                        avatar={
                            <Avatar>
                                <DescriptionIcon />
                            </Avatar>
                        }
                        action={
                            <IconButton
                                onClick={() => setIsEdited(true)}
                            >
                                <EditIcon />
                            </IconButton>
                        }
                    />
                )
            }
            {(isEdited)
                && currentUser.hasAuthority(Authority.NewsPostEditor) && (
                    <CardHeader
                        className={classes.cardHeader}
                        avatar={
                            <Avatar>
                                <DescriptionIcon />
                            </Avatar>
                        }
                    />
                )
            }

            <CardContent>
                <RichTextEditor isEdited={isEdited} readOnlyControls={props.isApiCallPending}
                    defaultValue={defaultContent}
                    resetTrigger={resetTrigger}
                    onChange={(data) => setContent(data)}
                    usedAttachments={usedAttachments}
                />
            </CardContent>

            <AttachmentPanel usedAttachments={usedAttachments} isEdited={isEdited} />

            {(!isEdited) && (
                <CardContent className={classes.cardFooter}>

                    {props.existingEntity.creationTime === props.existingEntity.editTime ? (
                        <Typography variant="caption">
                            Created: {DateTimeFormatter.toFullBasic(props.existingEntity.creationTime)}
                        </Typography>
                    ) : (
                        <Typography variant="caption">
                            Edited: {DateTimeFormatter.toFullBasic(props.existingEntity.editTime)}
                        </Typography>
                    )}
                        <Tooltip title="Show Author" leaveDelay={300}>
                            <IconButton
                                aria-label="Show Author"
                                onClick={() => fetchAuthor()}
                                disabled={isAuthorFetchingPending}
                            >
                                <InfoOutlinedIcon />
                            </IconButton>
                        </Tooltip>


                    {author && (
                        <Collapse in={showAuthor} timeout="auto" unmountOnExit>
                                <Grid
                                     container
                                     direction="row"
                                     justify="space-between"
                                     alignItems="flex-start"
                                    >
                                    <Typography  variant="caption">Created by: {UserNameFormatter.getBasicDisplayName(author.creator)}</Typography>
                                    <Typography variant="caption">Edited by: {UserNameFormatter.getBasicDisplayName(author.editor)}</Typography>
                                </Grid>
                        </Collapse>
                    )}
                </CardContent>
            )}

            {isEdited && (
                <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="center"
                >
                    <Tooltip title="Save">
                        <IconButton
                            onClick={doSave}
                            disabled={props.isApiCallPending}
                        >
                            <SaveOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                    {(!props.isCreatingNew) && (
                        <>
                            <Tooltip title="Delete">
                                <IconButton
                                    onClick={doDelete}
                                    disabled={props.isApiCallPending}>
                                    <DeleteOutlineOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                                <IconButton
                                    onClick={doCancelEdit}
                                    disabled={props.isApiCallPending}>
                                    <ClearOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}

                </Grid>
            )}

        </Card>
    )
}

class FetchingToolsImpl implements FetchingTools<NewsPost, SaveNewsPostCommand> {
    createNewEntity(command: SaveNewsPostCommand): Promise<number> {
        return callJsonEndpoint<CreatedEntityResponse>({
            conf: {
                url: "/api/up/server/api/newsPost/createNew",
                method: "post",
                data: {
                    content: command.content,
                    attachments: command.attachments,
                }
            }
        }).then(resp => resp.data.createdId);
    }

    deleteEntity(id: number): Promise<any> {
        return callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/newsPost/delete",
                method: "delete",
                params: {
                    id: id
                }
            }
        });
    }

    editEntity(id: number, command: SaveNewsPostCommand): Promise<any> {
        return callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/newsPost/edit",
                method: "post",
                data: {
                    id: id,
                    content: command.content,
                    attachments: command.attachments,
                }
            }
        });
    }

    fetchEntity(id: number): Promise<NewsPost> {
        return callJsonEndpoint<NewsPost>({
            conf: {
                url: "/api/up/server/api/newsPost/newsPost",
                method: "get",
                params: {
                    id: id
                }
            }
        }).then(resp => resp.data);
    }
}

NewsPostDisplay.fetchingTools = new FetchingToolsImpl();

export default NewsPostDisplay;