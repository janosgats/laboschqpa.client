import {
    Button,
    ButtonGroup,
    Collapse,
    createStyles,
    Grid,
    IconButton,
    Link as MuiLink,
    makeStyles,
    TextField,
    Theme,
    Tooltip,
    Typography,
    useTheme
} from '@material-ui/core';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionIcon from '@material-ui/icons/Description';
import EditIcon from '@material-ui/icons/Edit';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import SaveIcon from '@material-ui/icons/Save';
import React, {useContext, useEffect, useState} from 'react';
import AttachmentPanel from '~/components/file/AttachmentPanel';
import RichTextEditor from '~/components/textEditor/RichTextEditor';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {Authority} from '~/enums/Authority';
import useAttachments, {UsedAttachments} from '~/hooks/useAttachments';
import CreatedEntityResponse from '~/model/CreatedEntityResponse';
import {FetchableDisplay, FetchingTools} from '~/model/FetchableDisplay';
import {NewsPost} from '~/model/usergeneratedcontent/NewsPost';
import UserInfoService, {Author} from '~/service/UserInfoService';
import callJsonEndpoint from '~/utils/api/callJsonEndpoint';
import DateTimeFormatter from '~/utils/DateTimeFormatter';
import EventBus from '~/utils/EventBus';
import MuiRteUtils from '~/utils/MuiRteUtils';
import UserNameFormatter from '~/utils/UserNameFormatter';
import MyPaper from '../mui/MyPaper';
import {getStyles} from './styles/NewsPostDisplayStyle';
import getUrlFriendlyString from "~/utils/getUrlFriendlyString";
import Link from "next/link";

export interface SaveNewsPostCommand {
    title: string;
    content: string;
    attachments: number[];
}

const useStyles = makeStyles((theme: Theme) => createStyles(getStyles(theme)));

const NewsPostDisplay: FetchableDisplay<NewsPost, SaveNewsPostCommand> = (props) => {
    const classes = useStyles();
    const theme = useTheme();

    const defaultTitle = props.isCreatingNew ? '' : props.existingEntity.title;
    const defaultContent = props.isCreatingNew ? MuiRteUtils.emptyEditorContent : props.existingEntity.content;
    const defaultAttachments = props.isCreatingNew ? [] : props.existingEntity.attachments;

    const currentUser = useContext(CurrentUserContext);
    const [isEdited, setIsEdited] = useState<boolean>(props.isCreatingNew);
    const [resetTrigger, setResetTrigger] = useState<number>(1);

    const [title, setTitle] = useState<string>(defaultTitle);
    const [content, setContent] = useState<string>(defaultContent);
    const usedAttachments: UsedAttachments = useAttachments(defaultAttachments);

    const [author, setAuthor] = useState<Author>();
    const [isAuthorFetchingPending, setIsAuthorFetchingPending] = useState<boolean>(false);
    const [showAuthor, setShowAuthor] = useState<boolean>(false);

    useEffect(() => {
        setTitle(defaultTitle);
        setContent(defaultContent);
        usedAttachments.reset(defaultAttachments);
    }, [props.existingEntity]);

    function composeSaveNewsPostCommand(): SaveNewsPostCommand {
        return {
            title: title,
            content: content,
            attachments: usedAttachments.firmAttachmentIds,
        };
    }

    function doSave() {
        if (usedAttachments.attachmentsUnderUpload.length > 0) {
            EventBus.notifyWarning('Please wait until all the attachments are uploaded!', "You really shouldn't save yet");
            return;
        }

        props.onSave(composeSaveNewsPostCommand());
    }

    function doCancelEdit() {
        setIsEdited(false);
        setResetTrigger(resetTrigger + 1);
        setTitle(defaultTitle);
        setContent(defaultContent);
        usedAttachments.reset(defaultAttachments);
        props.onCancelEditing();
    }

    function doDelete() {
        const surelyDelete: boolean = confirm('Do you want to delete this NewsPost?');
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
                setAuthor(value);
            })
            .catch(() => EventBus.notifyError('Error while loading Author'))
            .finally(() => setIsAuthorFetchingPending(false));
    }

    return (
        <MyPaper>
            <Grid className={classes.newsHeader}>
                <Grid container direction="row" alignItems="center" justify="space-between">
                    <Grid item>
                        <Grid container direction="row" alignItems="center">
                            <Grid item>
                                <DescriptionIcon style={{width: 30, height: 30}}/>
                            </Grid>
                            <Grid item>
                                {isEdited ? (
                                    <TextField
                                        label="Cím"
                                        defaultValue={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        variant="outlined"
                                        style={{padding: theme.spacing(1)}}
                                        fullWidth={true}
                                    />
                                ) : (
                                    <Link href={`/news/post/${getUrlFriendlyString(title)}/?id=${props.existingEntity.id}`}>
                                        <MuiLink style={{cursor: 'pointer'}}>
                                            <Typography variant="h4">{title}</Typography>
                                        </MuiLink>
                                    </Link>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>

                    {!isEdited && currentUser.hasAuthority(Authority.NewsPostEditor) && (
                        <Grid item>
                            <IconButton onClick={() => setIsEdited(true)}>
                                <EditIcon />
                            </IconButton>
                        </Grid>
                    )}
                    {props.isCreatingNew && (
                        <ButtonGroup>
                            <Button onClick={doSave} disabled={props.isApiCallPending} variant="contained" color="primary">
                                Létrehoz
                            </Button>
                            <Button onClick={doCancelEdit} disabled={props.isApiCallPending} variant="outlined" color="secondary">
                                Mégsem
                            </Button>
                        </ButtonGroup>
                    )}
                    {isEdited && !props.isCreatingNew && (
                        <ButtonGroup>
                            <Tooltip title="Save">
                                <IconButton onClick={doSave} disabled={props.isApiCallPending}>
                                    <SaveIcon color="primary" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton onClick={doDelete} disabled={props.isApiCallPending}>
                                    <DeleteIcon color="secondary" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                                <IconButton onClick={doCancelEdit} disabled={props.isApiCallPending}>
                                    <ClearOutlinedIcon color="action" />
                                </IconButton>
                            </Tooltip>
                        </ButtonGroup>
                    )}
                </Grid>
            </Grid>

            <RichTextEditor
                isEdited={isEdited}
                readOnlyControls={props.isApiCallPending}
                defaultValue={defaultContent}
                resetTrigger={resetTrigger}
                onChange={(data) => setContent(data)}
                usedAttachments={usedAttachments}
            />

            <AttachmentPanel usedAttachments={usedAttachments} isEdited={isEdited} />

            {!isEdited && (
                <>
                    <Grid container direction="row" alignItems="center" justify="space-between">
                        {props.existingEntity.creationTime === props.existingEntity.editTime ? (
                            <Typography variant="caption">
                                Létrehozva: {DateTimeFormatter.toFullBasic(props.existingEntity.creationTime)}
                            </Typography>
                        ) : (
                            <Typography variant="caption">
                                Módosítva: {DateTimeFormatter.toFullBasic(props.existingEntity.editTime)}
                            </Typography>
                        )}
                        <Tooltip title="Show Author" leaveDelay={300}>
                            <IconButton aria-label="Show Author" onClick={() => fetchAuthor()} disabled={isAuthorFetchingPending}>
                                <InfoOutlinedIcon color="secondary" />
                            </IconButton>
                        </Tooltip>
                    </Grid>

                    {author && (
                        <Collapse in={showAuthor}>
                            <Grid container direction="column">
                                <Grid container direction="row" alignItems="center" justify="space-between">
                                    <Typography variant="caption">
                                        Létrehozta: {UserNameFormatter.getBasicDisplayName(author.creator)}
                                    </Typography>
                                    <Typography variant="caption">
                                        Létrehozva: {DateTimeFormatter.toFullBasic(props.existingEntity.creationTime)}
                                    </Typography>
                                </Grid>
                                <Grid container direction="row" alignItems="center" justify="space-between">
                                    <Typography variant="caption">
                                        Módosította: {UserNameFormatter.getBasicDisplayName(author.editor)}
                                    </Typography>
                                    <Typography variant="caption">
                                        Módosítva: {DateTimeFormatter.toFullBasic(props.existingEntity.editTime)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Collapse>
                    )}
                </>
            )}
        </MyPaper>
    );
};

class FetchingToolsImpl implements FetchingTools<NewsPost, SaveNewsPostCommand> {
    createNewEntity(command: SaveNewsPostCommand): Promise<number> {
        return callJsonEndpoint<CreatedEntityResponse>({
            conf: {
                url: '/api/up/server/api/newsPost/createNew',
                method: 'post',
                data: {
                    title: command.title,
                    content: command.content,
                    attachments: command.attachments,
                },
            },
        }).then((resp) => resp.data.createdId);
    }

    deleteEntity(id: number): Promise<any> {
        return callJsonEndpoint({
            conf: {
                url: '/api/up/server/api/newsPost/delete',
                method: 'delete',
                params: {
                    id: id,
                },
            },
        });
    }

    editEntity(id: number, command: SaveNewsPostCommand): Promise<any> {
        return callJsonEndpoint({
            conf: {
                url: '/api/up/server/api/newsPost/edit',
                method: 'post',
                data: {
                    id: id,
                    title: command.title,
                    content: command.content,
                    attachments: command.attachments,
                },
            },
        });
    }

    fetchEntity(id: number): Promise<NewsPost> {
        return callJsonEndpoint<NewsPost>({
            conf: {
                url: '/api/up/server/api/newsPost/newsPost',
                method: 'get',
                params: {
                    id: id,
                },
            },
        }).then((resp) => resp.data);
    }
}

NewsPostDisplay.fetchingTools = new FetchingToolsImpl();

export default NewsPostDisplay;
