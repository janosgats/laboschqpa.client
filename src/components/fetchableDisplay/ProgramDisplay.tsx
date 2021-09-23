import React, {useContext, useEffect, useState} from "react";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Authority} from "~/enums/Authority";
import RichTextEditor from "~/components/textEditor/RichTextEditor";
import MuiRteUtils from "~/utils/MuiRteUtils";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import {FetchableDisplay, FetchingTools} from "~/model/FetchableDisplay";
import CreatedEntityResponse from "~/model/CreatedEntityResponse";
import UserInfoService, {Author} from "~/service/UserInfoService";
import EventBus from "~/utils/EventBus";
import {getSurelyDate} from "~/utils/DateHelpers";
import useAttachments, {UsedAttachments} from "~/hooks/useAttachments";
import AttachmentPanel from "~/components/file/AttachmentPanel";
import {
    Box,
    Button,
    ButtonGroup,
    createStyles,
    FormControlLabel,
    Grid,
    IconButton,
    makeStyles,
    TextField,
    Theme,
    Typography,
    useTheme,
} from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import {getStyles} from "./styles/ProgramDisplayStyle";
import {Program} from "~/model/usergeneratedcontent/Program";
import TempDatetimePicker from "~/components/TempDatetimePicker";
import MyPaper from "../mui/MyPaper";


const useStyles = makeStyles((theme: Theme) => createStyles(getStyles(theme)))

export interface SaveProgramCommand {
    title: string;
    headline: string;
    description: string;
    startTime: Date;
    endTime: Date;

    attachments: number[];
}

const ProgramDisplay: FetchableDisplay<Program, SaveProgramCommand> = (
    props
) => {
    const classes = useStyles();
    const theme = useTheme();

    const defaultTitle = props.isCreatingNew ? "" : props.existingEntity.title;
    const defaultHeadline = props.isCreatingNew ? "" : props.existingEntity.headline;
    const defaultDescription = props.isCreatingNew ? MuiRteUtils.emptyEditorContent : props.existingEntity.description;
    const defaultStartTime = props.isCreatingNew ? new Date() : getSurelyDate(props.existingEntity.startTime);
    const defaultEndTime = props.isCreatingNew ? new Date() : getSurelyDate(props.existingEntity.endTime);
    const defaultAttachments = props.isCreatingNew ? [] : props.existingEntity.attachments;


    const currentUser = useContext(CurrentUserContext);
    const [isEdited, setIsEdited] = useState<boolean>(props.isCreatingNew);
    const [resetTrigger, setResetTrigger] = useState<number>(1);

    const [title, setTitle] = useState<string>(defaultTitle);
    const [headline, setHeadline] = useState<string>(defaultHeadline);
    const [description, setDescription] = useState<string>(defaultDescription);
    const [startTime, setStartTime] = useState<Date>(defaultStartTime);
    const [endTime, setEndTime] = useState<Date>(defaultEndTime);

    const usedAttachments: UsedAttachments = useAttachments(defaultAttachments);

    const [author, setAuthor] = useState<Author>();
    const [isAuthorFetchingPending, setIsAuthorFetchingPending] = useState<boolean>(false);

    const [showAuthor, setShowAuthor] = useState<boolean>(false);

    useEffect(() => {
        setDescription(defaultDescription);
        usedAttachments.reset(defaultAttachments);
    }, [props.existingEntity]);

    function composeSaveProgramCommand(): SaveProgramCommand {
        return {
            title: title,
            headline: headline,
            description: description,
            startTime: startTime,
            endTime: endTime,
            attachments: usedAttachments.firmAttachmentIds,
        };
    }

    function doSave() {
        if (usedAttachments.attachmentsUnderUpload.length > 0) {
            EventBus.notifyWarning("Please wait until all the attachments are uploaded!", "You cannot save yet");
            return;
        }

        props.onSave(composeSaveProgramCommand());
    }

    function doCancelEdit() {
        setIsEdited(false);
        setResetTrigger(resetTrigger + 1);
        setTitle(defaultTitle);
        setHeadline(defaultHeadline);
        setDescription(defaultDescription);
        setStartTime(defaultStartTime);
        setEndTime(defaultEndTime);
        usedAttachments.reset(defaultAttachments);
        props.onCancelEditing();
    }

    function doDelete() {
        const surelyDelete: boolean = confirm("Do you want to delete this Program?");
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

        setIsAuthorFetchingPending(true);
        UserInfoService.getAuthor(props.existingEntity.creatorUserId, props.existingEntity.editorUserId, false)
            .then((value) => setAuthor(value))
            .catch(() => EventBus.notifyError("Error while loading Author"))
            .finally(() => setIsAuthorFetchingPending(false));
    }

    return (
        <>
            <MyPaper>

                {isEdited ? (
                    <Grid>
                        <Grid container direction="row" alignItems="center" justify="space-between"
                              style={{marginBottom: "8px"}}>
                            <Grid item>
                                <TextField label="Cím" defaultValue={title} onChange={(e) => setTitle(e.target.value)}
                                           variant="outlined" fullWidth style={{padding: theme.spacing(1)}}/>
                            </Grid>

                            <Grid item>
                                {props.isCreatingNew && (
                                    <>
                                        <ButtonGroup
                                            size="medium"
                                        >
                                            <Button
                                                onClick={doSave}
                                                disabled={props.isApiCallPending}
                                                variant="contained"
                                                color="primary"
                                            >
                                                Létrehoz
                                            </Button>
                                            <Button
                                                onClick={doCancelEdit}
                                                disabled={props.isApiCallPending}
                                                variant="outlined"
                                                color="secondary"
                                            >
                                                Mégsem
                                            </Button>
                                        </ButtonGroup>

                                    </>
                                )}
                                {!props.isCreatingNew && (
                                    <>
                                        <ButtonGroup
                                            variant="text"
                                            fullWidth
                                            size="large"
                                        >
                                            <IconButton
                                                onClick={doSave}
                                                disabled={props.isApiCallPending}
                                            >
                                                <SaveIcon
                                                    color="primary"
                                                />
                                            </IconButton>
                                            <IconButton
                                                onClick={doDelete}
                                                disabled={props.isApiCallPending}

                                            >
                                                <DeleteIcon
                                                    color="secondary"
                                                />
                                            </IconButton>
                                            <IconButton
                                                onClick={doCancelEdit}
                                                disabled={props.isApiCallPending}
                                            >
                                                <CloseIcon
                                                    color="action"
                                                />
                                            </IconButton>
                                        </ButtonGroup>
                                    </>
                                )}
                            </Grid>
                        </Grid>
                        <Grid>
                            <TextField label="Rövid leírás" defaultValue={headline}
                                       onChange={(e) => setHeadline(e.target.value)}
                                       variant="outlined" fullWidth style={{padding: theme.spacing(1)}}/>
                        </Grid>

                    </Grid>
                ) : (
                    <>
                        <Grid
                            container
                            direction="row"
                            alignItems="center"
                            justify="space-between"
                        >
                            <Grid item>
                                <Typography variant="h4" className={classes.title}>{title}</Typography>
                            </Grid>
                            {!isEdited && currentUser.hasAuthority(Authority.ProgramEditor) && (
                                <Grid item>
                                    <IconButton onClick={() => setIsEdited(true)}>
                                        <EditIcon color="action"/>
                                    </IconButton>
                                </Grid>
                            )}

                        </Grid>
                        <Grid
                            container
                            direction="row"
                            alignItems="center"
                            justify="space-between"
                        >
                            <Grid item>
                                <Typography variant="h6" className={classes.title}>{headline}</Typography>
                            </Grid>

                        </Grid>
                    </>
                )}

                <Box className={classes.richTextEditor}>
                    <RichTextEditor
                        isEdited={isEdited}
                        readOnlyControls={props.isApiCallPending}
                        defaultValue={defaultDescription}
                        resetTrigger={resetTrigger}
                        onChange={(data) => setDescription(data)}
                        usedAttachments={usedAttachments}
                    />
                </Box>


                <AttachmentPanel usedAttachments={usedAttachments} isEdited={isEdited}/>

                <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="center"
                    style={{paddingLeft: theme.spacing(3), paddingRight: theme.spacing(6)}}
                >
                    <FormControlLabel
                        control={
                            <TempDatetimePicker value={startTime} onChange={setStartTime} disabled={!isEdited}/>
                        }
                        labelPlacement="start"
                        label="Program kezdete: "
                    />
                    <FormControlLabel
                        control={<TempDatetimePicker value={endTime} onChange={setEndTime} disabled={!isEdited}/>
                        }
                        labelPlacement="start"
                        label="Program vége: "
                    />
                </Grid>

            </MyPaper>
        </>
    );
};

class FetchingToolsImpl implements FetchingTools<Program, SaveProgramCommand> {
    createNewEntity(command: SaveProgramCommand):
        Promise<number> {
        return callJsonEndpoint<CreatedEntityResponse>({
            conf: {
                url: "/api/up/server/api/program/createNew",
                method: "post",
                data: {
                    title: command.title,
                    headline: command.headline,
                    description: command.description,
                    startTime: command.startTime,
                    endTime: command.endTime,
                    attachments: command.attachments,
                },
            },
        }).then((resp) => resp.data.createdId);
    }

    deleteEntity(id: number):
        Promise<any> {
        return callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/program/delete",
                method: "delete",
                params: {
                    id: id,
                },
            },
        });
    }

    editEntity(id: number, command: SaveProgramCommand):
        Promise<any> {
        return callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/program/edit",
                method: "post",
                data: {
                    id: id,
                    title: command.title,
                    headline: command.headline,
                    description: command.description,
                    startTime: command.startTime,
                    endTime: command.endTime,
                    attachments: command.attachments,
                },
            },
        });
    }

    fetchEntity(id: number):
        Promise<Program> {
        return callJsonEndpoint<Program>({
            conf: {
                url: "/api/up/server/api/program/program",
                method: "get",
                params: {
                    id: id,
                },
            },
        }).then((resp) => resp.data);
    }
}

ProgramDisplay.fetchingTools = new FetchingToolsImpl();

export default ProgramDisplay;
