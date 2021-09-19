import React, {FC, useContext, useEffect, useState} from "react";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Authority} from "~/enums/Authority";
import RichTextEditor from "~/components/textEditor/RichTextEditor";
import MuiRteUtils from "~/utils/MuiRteUtils";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import {FetchableDisplay, FetchingTools} from "~/model/FetchableDisplay";
import CreatedEntityResponse from "~/model/CreatedEntityResponse";
import UserInfoService, {Author} from "~/service/UserInfoService";
import UserNameFormatter from "~/utils/UserNameFormatter";
import EventBus from "~/utils/EventBus";
import {Objective} from "~/model/usergeneratedcontent/Objective";
import {ObjectiveType, objectiveTypeData} from "~/enums/ObjectiveType";
import DateTimeFormatter from "~/utils/DateTimeFormatter";
import ObjectiveTypeSelector from "~/components/selector/ObjectiveTypeSelector";
import {getSurelyDate, isDateTextInputValid} from "~/utils/DateHelpers";
import Scorer from "~/components/Scorer";
import {SubmissionDisplayContainer} from "~/components/fetchableDisplay/FetchableDisplayContainer";
import useAttachments, {UsedAttachments} from "~/hooks/useAttachments";
import AttachmentPanel from "~/components/file/AttachmentPanel";
import {
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    Collapse,
    createStyles,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    IconButton,
    makeStyles,
    Paper,
    TextField,
    Theme,
    Typography,
    useTheme,
} from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import {getStyles} from "./styles/ObjectiveDisplayStyle";


const useStyles = makeStyles((theme: Theme) => createStyles(getStyles(theme)))

export interface SaveObjectiveCommand {
    programId: number;
    title: string;
    description: string;
    submittable: boolean;
    deadline: Date;
    hideSubmissionsBefore: Date;
    objectiveType: ObjectiveType;
    attachments: number[];
}

function getDefaultDeadline(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
}

const ObjectiveDisplay: FetchableDisplay<Objective, SaveObjectiveCommand> = (
    props
) => {
    const classes = useStyles();
    const theme = useTheme();

    const defaultProgramId = props.isCreatingNew ? null: props.existingEntity.programId;
    const defaultTitle = props.isCreatingNew ? "" : props.existingEntity.title;
    const defaultDescription = props.isCreatingNew ? MuiRteUtils.emptyEditorContent : props.existingEntity.description;
    const defaultSubmittable = props.isCreatingNew ? true : props.existingEntity.submittable;
    const defaultDeadline = props.isCreatingNew ? getDefaultDeadline() : getSurelyDate(props.existingEntity.deadline);
    const defaultHideSubmissionsBefore = props.isCreatingNew ? null : getSurelyDate(props.existingEntity.hideSubmissionsBefore);
    const defaultObjectiveType = props.isCreatingNew ? ObjectiveType.MAIN_OBJECTIVE : props.existingEntity.objectiveType;
    const defaultAttachments = props.isCreatingNew ? [] : props.existingEntity.attachments;

    const defaultIsHideSubmissionsBeforeChecked = !!defaultHideSubmissionsBefore;

    const currentUser = useContext(CurrentUserContext);
    const [isEdited, setIsEdited] = useState<boolean>(props.isCreatingNew);
    const [resetTrigger, setResetTrigger] = useState<number>(1);

    const [isScorerOpen, setIsScorerOpen] = useState<boolean>(false);
    const [isSubmissionDisplayOpen, setIsSubmissionDisplayOpen] = useState<boolean>(false);
    const [isHideSubmissionsBeforeChecked, setIsHideSubmissionsBeforeChecked] = useState<boolean>(defaultIsHideSubmissionsBeforeChecked);

    const [programId, setProgramId] = useState<number>(defaultProgramId);
    const [title, setTitle] = useState<string>(defaultTitle);
    const [description, setDescription] = useState<string>(defaultDescription);
    const [submittable, setSubmittable] = useState<boolean>(defaultSubmittable);
    const [deadline, setDeadline] = useState<Date>(defaultDeadline);
    const [hideSubmissionsBefore, setHideSubmissionsBefore] = useState<Date>(defaultHideSubmissionsBefore);
    const [objectiveType, setObjectiveType] = useState<ObjectiveType>(defaultObjectiveType);
    const usedAttachments: UsedAttachments = useAttachments(defaultAttachments);

    const [author, setAuthor] = useState<Author>();
    const [isAuthorFetchingPending, setIsAuthorFetchingPending] = useState<boolean>(false);

    const [showAuthor, setShowAuthor] = useState<boolean>(false);

    useEffect(() => {
        setDescription(defaultDescription);
        usedAttachments.reset(defaultAttachments);
    }, [props.existingEntity]);

    function composeSaveObjectiveCommand(): SaveObjectiveCommand {
        let hideSubmissionsBeforeToSave = null;
        if (isHideSubmissionsBeforeChecked) {
            hideSubmissionsBeforeToSave = hideSubmissionsBefore;
        }

        return {
            programId: programId,
            title: title,
            description: description,
            submittable: submittable,
            deadline: deadline,
            hideSubmissionsBefore: hideSubmissionsBeforeToSave,
            objectiveType: objectiveType,
            attachments: usedAttachments.firmAttachmentIds,
        };
    }

    function doSave() {
        if (usedAttachments.attachmentsUnderUpload.length > 0) {
            EventBus.notifyWarning("Please wait until all the attachments are uploaded!", "You cannot save yet");
            return;
        }

        props.onSave(composeSaveObjectiveCommand());
    }

    function doCancelEdit() {
        setIsEdited(false);
        setResetTrigger(resetTrigger + 1);
        setProgramId(defaultProgramId);
        setTitle(defaultTitle);
        setDescription(defaultDescription);
        setSubmittable(defaultSubmittable);
        setDeadline(defaultDeadline);
        setHideSubmissionsBefore(defaultHideSubmissionsBefore);
        setIsHideSubmissionsBeforeChecked(defaultIsHideSubmissionsBeforeChecked);
        setObjectiveType(defaultObjectiveType);
        usedAttachments.reset(defaultAttachments);
        props.onCancelEditing();
    }

    function doDelete() {
        const surelyDelete: boolean = confirm("Do you want to delete this Objective?");
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

    function isBeforeSubmissionDeadline(): boolean {
        return getSurelyDate(props.existingEntity.deadline).getTime() > new Date().getTime();
    }

    const observerTeamHasScore = props.existingEntity && props.existingEntity.observerTeamScore > 0;

    return (
        <>
            <Paper className={classes.objectiveDisplayWrapper}>

                {isEdited ? (
                    <Grid>
                        <Grid
                            container
                            direction="row"
                            alignItems="center"
                            justify="center"
                        >
                            <Typography variant="subtitle1" className={classes.typeSelectorLabel}>
                                Feladat típusa:
                            </Typography>
                            <ObjectiveTypeSelector
                                value={objectiveType}
                                onChange={setObjectiveType}
                            />
                        </Grid>
                        <Grid
                            container
                            direction="row"
                            alignItems="center"
                            justify="space-between"
                            style={{marginBottom: "8px"}}
                        >
                            <Grid>
                            <TextField label="Program ID" defaultValue={programId}
                                //TODO: This should be a dropdown where people can select a program
                                       onChange={(e) => setProgramId(Number.parseInt(e.target.value))}
                                       type="number"
                                       variant="outlined"
                            style={{paddingRight: theme.spacing(2)}}/>
                            <TextField label="Cím" defaultValue={title} onChange={(e) => setTitle(e.target.value)}
                                       variant="outlined"/>
                            </Grid>
                            <Grid>
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
                    </Grid>


                ) : (
                    <Grid
                        container
                        direction="row"
                        alignItems="center"
                        justify="space-between"
                    >
                        <Grid item>
                            {objectiveTypeData[props.existingEntity.objectiveType] && (
                                <Grid
                                    container
                                    direction="row"
                                    alignItems="center"
                                >
                                    {React.createElement(
                                        objectiveTypeData[props.existingEntity.objectiveType].icon,
                                        {style: {width: 50, height: 50}}
                                    )}
                                    <Typography variant="h4" className={classes.title}>{title}</Typography>
                                </Grid>
                            )}
                        </Grid>

                        {!isEdited && currentUser.hasAuthority(Authority.ObjectiveEditor) && (
                            <Grid
                                item
                            >
                                <IconButton
                                    onClick={() => setIsEdited(true)}
                                >
                                    <EditIcon
                                        color="action"
                                    />
                                </IconButton>
                            </Grid>
                        )}

                    </Grid>
                )}


                {observerTeamHasScore && (
                    <Typography variant="subtitle1" className={classes.subtitle}>
                        -A csapatod pontszáma: {props.existingEntity.observerTeamScore}
                    </Typography>
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
                {isEdited && (
                    <>
                        <FormControlLabel
                            control={
                                <TempDatetimePicker
                                    value={deadline}
                                    onChange={setDeadline}
                                    disabled={!isEdited}
                                />
                            }
                            labelPlacement="start"
                            label="Határidő: "
                        />
                        <br/>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={submittable}
                                    onChange={(e) => setSubmittable(e.target.checked)}
                                    color="primary"
                                />
                            }
                            labelPlacement="start"
                            label="A csapatok közvetlenül tudjanak beadni erre a feladatra."
                        />

                        <br/>
                    </>
                )}

                {isEdited && (
                    <>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isHideSubmissionsBeforeChecked}
                                    onChange={(e) =>
                                        setIsHideSubmissionsBeforeChecked(e.target.checked)
                                    }
                                    color="secondary"
                                />
                            }
                            labelPlacement="start"
                            label="A feladat nem lehet elérhető hamarabb mint egy adott idő."
                        />

                        {isHideSubmissionsBeforeChecked && (
                            <>
                                <FormControlLabel
                                    control={
                                        <TempDatetimePicker
                                            value={hideSubmissionsBefore}
                                            onChange={setHideSubmissionsBefore}
                                            disabled={!isEdited}
                                        />
                                    }
                                    labelPlacement="start"
                                    label="A feladat nem érhető el egészen: "
                                />
                            </>
                        )}
                    </>
                )}

                <AttachmentPanel usedAttachments={usedAttachments} isEdited={isEdited}/>

                {!isEdited && (
                    <>
                        <Grid
                            container
                            direction="row"
                            justify="space-between"
                            alignItems="center"
                        >
                            {submittable &&
                            isBeforeSubmissionDeadline() &&
                            currentUser.isMemberOrLeaderOfAnyTeam() && (
                                <Button
                                    size="large"
                                    variant="contained"
                                    onClick={() => setIsSubmissionDisplayOpen(true)}
                                    color="primary"
                                >
                                    Beadás
                                </Button>
                            )}
                            {currentUser.hasAuthority(Authority.TeamScorer) && (
                                <Button
                                    size="large"
                                    variant="contained"
                                    onClick={() => setIsScorerOpen(true)}
                                    color="secondary"
                                >
                                    Pontozás
                                </Button>
                            )}
                        </Grid>

                        {isSubmissionDisplayOpen && (
                            <div>
                                <Dialog open={isSubmissionDisplayOpen} fullWidth maxWidth="lg">
                                    <DialogTitle>
                                        <Grid
                                            container
                                            alignItems="center"
                                            justify="space-between"
                                            direction="row"
                                        >
                                            <Typography variant="h3">
                                                {props.existingEntity.title}
                                            </Typography>
                                            <IconButton
                                                onClick={() => setIsSubmissionDisplayOpen(false)}
                                            >
                                                <ClearOutlinedIcon/>
                                            </IconButton>
                                        </Grid>
                                    </DialogTitle>
                                    <DialogContent>
                                        <SubmissionDisplayContainer
                                            shouldCreateNew={true}
                                            displayExtraProps={{
                                                creationObjectiveId: props.existingEntity.id,
                                                creationObjectiveTitle: props.existingEntity.title,
                                                creationTeamName:
                                                    currentUser.getUserInfo() &&
                                                    currentUser.getUserInfo().teamName,
                                                showObjectiveTitle: true,
                                                showTeamName: !!currentUser.getUserInfo(),
                                            }}
                                        />
                                    </DialogContent>

                                </Dialog>
                            </div>
                        )}

                        {isScorerOpen && (
                            <Scorer
                                defaultObjectiveId={props.existingEntity.id}
                                onClose={() => setIsScorerOpen(false)}
                            />
                        )}
                        <Grid
                            container
                            direction="row"
                            alignItems="center"
                            justify="space-between"
                        >
                            {props.existingEntity.creationTime === props.existingEntity.editTime ? (
                                    <Typography
                                        variant="caption">Posztolva: {DateTimeFormatter.toFullBasic(props.existingEntity.creationTime)}</Typography>
                                ) :
                                <Typography
                                    variant="caption">Módosítva: {DateTimeFormatter.toFullBasic(props.existingEntity.editTime)}</Typography>
                            }
                            <IconButton
                                onClick={fetchAuthor}
                                disabled={isAuthorFetchingPending}
                            >
                                <InfoOutlinedIcon
                                    color="secondary"
                                />
                            </IconButton>
                        </Grid>
                        {author && (
                            <Collapse in={showAuthor}>
                                <Grid
                                    container
                                    direction="column"
                                >
                                    <Grid
                                        container
                                        direction="row"
                                        alignItems="center"
                                        justify="space-between"
                                    >
                                        <Typography variant="caption">Posztolta:{" "}
                                            {UserNameFormatter.getBasicDisplayName(author.creator)}
                                        </Typography>
                                        <Typography variant="caption">
                                            Posztolva:{" "}
                                            {DateTimeFormatter.toFullBasic(
                                                props.existingEntity.creationTime
                                            )}
                                        </Typography>
                                    </Grid>
                                    <Grid
                                        container
                                        direction="row"
                                        alignItems="center"
                                        justify="space-between"
                                    >
                                        <Typography variant="caption">Módosította:{" "}
                                            {UserNameFormatter.getBasicDisplayName(author.editor)}
                                        </Typography>
                                        <Typography variant="caption">
                                            Módosítva:{" "}
                                            {DateTimeFormatter.toFullBasic(props.existingEntity.editTime)}
                                        </Typography>

                                    </Grid>
                                </Grid>
                            </Collapse>
                        )}
                    </>
                )}
            </Paper>
        </>
    );
};

interface TempDatetimePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    disabled: boolean;
}

function padToTwoChars(num: number): string {
    if (num >= 10) {
        return num.toString();
    }
    return "0" + num.toString();
}

/**
 * TODO: Replace this ugliness with a MUI component
 */
const TempDatetimePicker: FC<TempDatetimePickerProps> = ({value, onChange, disabled}) => {
    const valueDate = getSurelyDate(value);
    const [internalValue, setInternalValue] = useState<string>(
        valueDate
            ? `${valueDate.getFullYear()}-${padToTwoChars(valueDate.getMonth() + 1)}-${padToTwoChars(valueDate.getDate())} ` +
            `${padToTwoChars(valueDate.getHours())}:${padToTwoChars(valueDate.getMinutes())}:${padToTwoChars(valueDate.getSeconds())}`
            : ""
    );
    const [isError, setIsError] = useState<boolean>(!isDateTextInputValid(internalValue));

    return (
        <>
            <input
                value={internalValue}
                onChange={(e) => {
                    setInternalValue(e.target.value);
                    if (isDateTextInputValid(e.target.value)) {
                        setIsError(false);
                        onChange(new Date(e.target.value));
                    } else {
                        setIsError(true);
                    }
                }}
                disabled={disabled}
            />
            {isError && "datetime error TODO: use MUI"}
        </>
    );
};

class FetchingToolsImpl
    implements FetchingTools<Objective, SaveObjectiveCommand> {
    createNewEntity(command: SaveObjectiveCommand): Promise<number> {
        return callJsonEndpoint<CreatedEntityResponse>({
            conf: {
                url: "/api/up/server/api/objective/createNew",
                method: "post",
                data: {
                    programId: command.programId,
                    title: command.title,
                    description: command.description,
                    submittable: command.submittable,
                    deadline: command.deadline,
                    hideSubmissionsBefore: command.hideSubmissionsBefore,
                    objectiveType: command.objectiveType,
                    attachments: command.attachments,
                },
            },
        }).then((resp) => resp.data.createdId);
    }

    deleteEntity(id: number): Promise<any> {
        return callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/objective/delete",
                method: "delete",
                params: {
                    id: id,
                },
            },
        });
    }

    editEntity(id: number, command: SaveObjectiveCommand): Promise<any> {
        return callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/objective/edit",
                method: "post",
                data: {
                    id: id,
                    programId: command.programId,
                    title: command.title,
                    description: command.description,
                    submittable: command.submittable,
                    deadline: command.deadline,
                    hideSubmissionsBefore: command.hideSubmissionsBefore,
                    objectiveType: command.objectiveType,
                    attachments: command.attachments,
                },
            },
        });
    }

    fetchEntity(id: number): Promise<Objective> {
        return callJsonEndpoint<Objective>({
            conf: {
                url: "/api/up/server/api/objective/objective",
                method: "get",
                params: {
                    id: id,
                },
            },
        }).then((resp) => resp.data);
    }
}

ObjectiveDisplay.fetchingTools = new FetchingToolsImpl();

export default ObjectiveDisplay;
