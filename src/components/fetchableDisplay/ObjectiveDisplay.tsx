import {
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    createStyles,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    IconButton,
    makeStyles,
    TextField,
    Theme,
    Typography,
    useTheme,
} from '@material-ui/core';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import React, {useContext, useEffect, useState} from 'react';
import {SubmissionDisplayContainer} from '~/components/fetchableDisplay/FetchableDisplayContainer';
import AttachmentPanel from '~/components/file/AttachmentPanel';
import Scorer from '~/components/Scorer';
import ObjectiveTypeSelector from '~/components/selector/ObjectiveTypeSelector';
import TempDatetimePicker from '~/components/TempDatetimePicker';
import RichTextEditor from '~/components/textEditor/RichTextEditor';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {Authority} from '~/enums/Authority';
import {ObjectiveType, objectiveTypeData} from '~/enums/ObjectiveType';
import useAttachments, {UsedAttachments} from '~/hooks/useAttachments';
import CreatedEntityResponse from '~/model/CreatedEntityResponse';
import {FetchableDisplay, FetchingTools} from '~/model/FetchableDisplay';
import {Objective} from '~/model/usergeneratedcontent/Objective';
import {ProgramPageContext} from '~/pages/programs/program/[...programTitle]';
import UserInfoService, {Author} from '~/service/UserInfoService';
import callJsonEndpoint from '~/utils/api/callJsonEndpoint';
import {getSurelyDate} from '~/utils/DateHelpers';
import EventBus from '~/utils/EventBus';
import MuiRteUtils from '~/utils/MuiRteUtils';
import MyPaper from '../mui/MyPaper';
import {getStyles} from './styles/ObjectiveDisplayStyle';
import DateTimeFormatter from "~/utils/DateTimeFormatter";
import {isValidNonEmptyString} from "~/utils/CommonValidators";

const useStyles = makeStyles((theme: Theme) => createStyles(getStyles(theme)));

export interface SaveObjectiveCommand {
    programId: number;
    title: string;
    description: string;
    submittable: boolean;
    deadline: Date;
    hideSubmissionsBefore: Date;
    objectiveType: ObjectiveType;
    isHidden: boolean;
    attachments: number[];
}

function getDefaultDeadline(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
}

const ObjectiveDisplay: FetchableDisplay<Objective, SaveObjectiveCommand> = (props) => {
    const classes = useStyles();
    const theme = useTheme();
    const programPage = useContext(ProgramPageContext);

    const defaultProgramId = props.isCreatingNew ? programPage?.programId : props.existingEntity.programId;
    const defaultTitle = props.isCreatingNew ? '' : props.existingEntity.title;
    const defaultDescription = props.isCreatingNew ? MuiRteUtils.emptyEditorContent : props.existingEntity.description;
    const defaultSubmittable = props.isCreatingNew ? true : props.existingEntity.submittable;
    const defaultDeadline = props.isCreatingNew ? getDefaultDeadline() : getSurelyDate(props.existingEntity.deadline);
    const defaultHideSubmissionsBefore = props.isCreatingNew ? null : getSurelyDate(props.existingEntity.hideSubmissionsBefore);
    const defaultObjectiveType = props.isCreatingNew ? ObjectiveType.MAIN_OBJECTIVE : props.existingEntity.objectiveType;
    const defaultIsHidden = props.isCreatingNew ? false : props.existingEntity.isHidden;
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
    const [isHidden, setIsHidden] = useState<boolean>(defaultIsHidden);
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
            isHidden: isHidden,
            attachments: usedAttachments.firmAttachmentIds,
        };
    }

    function doSave() {
        if (usedAttachments.attachmentsUnderUpload.length > 0) {
            EventBus.notifyWarning('Please wait until all the attachments are uploaded!', 'You cannot save yet');
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
        setIsHidden(defaultIsHidden);
        usedAttachments.reset(defaultAttachments);
        props.onCancelEditing();
    }

    function doDelete() {
        const surelyDelete: boolean = confirm('Do you want to delete this Objective?');
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
            .catch(() => EventBus.notifyError('Error while loading Author'))
            .finally(() => setIsAuthorFetchingPending(false));
    }

    function isBeforeSubmissionDeadline(): boolean {
        return getSurelyDate(props.existingEntity.deadline).getTime() > new Date().getTime();
    }

    let iconClassName: string = null;
    let titleClassName: string = classes.title;
    let subtitleClassName: string = classes.subtitle;

    if (props.existingEntity?.isAccepted) {
        iconClassName = classes.acceptedIcon;
        titleClassName = classes.acceptedTitle;
        subtitleClassName = classes.acceptedSubtitle;
    } else if (props.existingEntity?.hasSubmission) {
        iconClassName = classes.hasSubmissionIcon;
        titleClassName = classes.hasSubmissionTitle;
        subtitleClassName = classes.hasSubmissionSubtitle;
    }

    return (
        <MyPaper>
            {isEdited ? (
                <Grid>
                    <Grid container direction="row" alignItems="center" justify="center">
                        <Typography variant="subtitle1" className={classes.typeSelectorLabel}>
                            Feladat típusa:
                        </Typography>
                        <ObjectiveTypeSelector value={objectiveType} onChange={setObjectiveType} />
                    </Grid>
                    <Grid container direction="row" alignItems="center" justify="space-between" style={{marginBottom: '8px'}}>
                        <Grid item>
                            <TextField
                                label="Program ID"
                                defaultValue={programId}
                                //TODO: This should be a dropdown where people can select a program
                                onChange={(e) => setProgramId(Number.parseInt(e.target.value))}
                                type="number"
                                variant="outlined"
                                style={{padding: theme.spacing(1)}}
                                disabled={programPage != null}
                            />
                        </Grid>
                        <Grid item>
                            {props.isCreatingNew && (
                                <>
                                    <ButtonGroup size="medium">
                                        <Button onClick={doSave} disabled={props.isApiCallPending} variant="contained" color="primary">
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
                                    <ButtonGroup variant="text" fullWidth size="large">
                                        <IconButton onClick={doSave} disabled={props.isApiCallPending}>
                                            <SaveIcon color="primary" />
                                        </IconButton>
                                        <IconButton onClick={doDelete} disabled={props.isApiCallPending}>
                                            <DeleteIcon color="secondary" />
                                        </IconButton>
                                        <IconButton onClick={doCancelEdit} disabled={props.isApiCallPending}>
                                            <CloseIcon color="action" />
                                        </IconButton>
                                    </ButtonGroup>
                                </>
                            )}
                        </Grid>
                    </Grid>
                    <Grid>
                        <TextField
                            label="Cím"
                            defaultValue={title}
                            onChange={(e) => setTitle(e.target.value)}
                            variant="outlined"
                            style={{padding: theme.spacing(1)}}
                            fullWidth={true}
                        />
                    </Grid>
                </Grid>
            ) : (
                <Grid container direction="row" alignItems="center" justify="space-between">
                    <Grid item>
                        <Grid container direction="row" alignItems="center">
                            {objectiveTypeData[props.existingEntity.objectiveType] && (
                                <>
                                    {React.createElement(objectiveTypeData[props.existingEntity.objectiveType].icon, {
                                        style: {width: 50, height: 50,},
                                        className: iconClassName,
                                    })}
                                </>
                            )}
                            <Typography variant="h4" className={titleClassName}>
                                {title}
                            </Typography>
                        </Grid>
                    </Grid>

                    {!isEdited && currentUser.hasAuthority(Authority.ObjectiveEditor) && (
                        <Grid item>
                            <IconButton onClick={() => setIsEdited(true)}>
                                <EditIcon color="action" />
                            </IconButton>
                        </Grid>
                    )}
                </Grid>
            )}

            {isValidNonEmptyString(props.existingEntity?.programTitle) && (
                <Grid item>
                    <Typography variant="h5" className={titleClassName}>
                        {props.existingEntity.programTitle}
                    </Typography>
                </Grid>
            )}

            {props.existingEntity?.isAccepted ? (
                <Typography variant="subtitle1" className={subtitleClassName}>
                    - A csapatod beadását elfogadtuk.
                </Typography>
            ) : (
                <>
                    {props.existingEntity?.hasSubmission && (
                        <Typography variant="subtitle1" className={subtitleClassName}>
                            - A csapatodnak már legalább egy beadása van ezen a feladaton.
                        </Typography>
                    )}
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
            {isEdited && (
                <>
                    <FormControlLabel
                        control={<TempDatetimePicker value={deadline} onChange={setDeadline} disabled={!isEdited} />}
                        labelPlacement="start"
                        label="Határidő: "
                    />
                    <br />
                    <FormControlLabel
                        control={<Checkbox checked={submittable} onChange={(e) => setSubmittable(e.target.checked)} color="primary" />}
                        labelPlacement="start"
                        label="A csapatok közvetlenül tudjanak beadni erre a feladatra."
                    />
                    <br />
                    <FormControlLabel
                        control={<Checkbox checked={isHidden} onChange={(e) => setIsHidden(e.target.checked)} color="primary" />}
                        labelPlacement="start"
                        label="Rejtett objektív (csak a pontozók és szerkesztők látják): "
                    />
                    <br />
                </>
            )}

            {isEdited && (
                <>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isHideSubmissionsBeforeChecked}
                                onChange={(e) => setIsHideSubmissionsBeforeChecked(e.target.checked)}
                                color="secondary"
                            />
                        }
                        labelPlacement="start"
                        label="A beadások ne legyenek nyilvánosak egy adott idő előtt"
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
                                label="A beadások el lesznek rejtve eddig: "
                            />
                        </>
                    )}
                </>
            )}

            <AttachmentPanel usedAttachments={usedAttachments} isEdited={isEdited} />

            {!isEdited && (
                <>
                    {submittable && (
                        <>
                            {!!hideSubmissionsBefore ? (
                                <Typography variant="caption">
                                    A
                                    beadások <i><b>{DateTimeFormatter.toDayMinutes(hideSubmissionsBefore)}</b></i> után
                                    nyilvánosak a
                                    többi Qpázó számára.
                                </Typography>
                            ) : (
                                <Typography variant="caption">
                                    A beadások <i><b>azonnal nyilvánosak</b></i> a többi Qpázó számára.
                                </Typography>
                            )}
                        </>
                    )}
                    <Grid container direction="row" justify="space-between" alignItems="center">
                        {submittable && isBeforeSubmissionDeadline() && currentUser.isMemberOrLeaderOfAnyTeam() && (
                            <Button size="large" variant="contained" onClick={() => setIsSubmissionDisplayOpen(true)} color="primary">
                                Beadás
                            </Button>
                        )}
                        {currentUser.hasAuthority(Authority.TeamScorer) && (
                            <Button size="large" variant="contained" onClick={() => setIsScorerOpen(true)} color="secondary">
                                Pontozás
                            </Button>
                        )}
                    </Grid>

                    {isSubmissionDisplayOpen && (
                        <div>
                            <Dialog open={isSubmissionDisplayOpen} fullWidth maxWidth="lg">
                                <DialogTitle>
                                    <Grid container alignItems="center" justify="space-between" direction="row">
                                        <Typography variant="h3">{props.existingEntity.title}</Typography>
                                        <IconButton onClick={() => setIsSubmissionDisplayOpen(false)}>
                                            <ClearOutlinedIcon />
                                        </IconButton>
                                    </Grid>
                                </DialogTitle>
                                <DialogContent>
                                    <SubmissionDisplayContainer
                                        shouldCreateNew={true}
                                        displayExtraProps={{
                                            creationObjectiveId: props.existingEntity.id,
                                            creationObjectiveTitle: props.existingEntity.title,
                                            creationTeamName: currentUser.getUserInfo() && currentUser.getUserInfo().teamName,
                                            showObjectiveTitle: true,
                                            showTeamName: !!currentUser.getUserInfo(),
                                        }}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}

                    {isScorerOpen && <Scorer defaultObjectiveId={props.existingEntity.id} onClose={() => setIsScorerOpen(false)} />}
                </>
            )}
        </MyPaper>
    );
};

class FetchingToolsImpl implements FetchingTools<Objective, SaveObjectiveCommand> {
    createNewEntity(command: SaveObjectiveCommand): Promise<number> {
        return callJsonEndpoint<CreatedEntityResponse>({
            conf: {
                url: '/api/up/server/api/objective/createNew',
                method: 'post',
                data: {
                    programId: command.programId,
                    title: command.title,
                    description: command.description,
                    submittable: command.submittable,
                    deadline: command.deadline,
                    hideSubmissionsBefore: command.hideSubmissionsBefore,
                    objectiveType: command.objectiveType,
                    isHidden: command.isHidden,
                    attachments: command.attachments,
                },
            },
        }).then((resp) => resp.data.createdId);
    }

    deleteEntity(id: number): Promise<any> {
        return callJsonEndpoint({
            conf: {
                url: '/api/up/server/api/objective/delete',
                method: 'delete',
                params: {
                    id: id,
                },
            },
        });
    }

    editEntity(id: number, command: SaveObjectiveCommand): Promise<any> {
        return callJsonEndpoint({
            conf: {
                url: '/api/up/server/api/objective/edit',
                method: 'post',
                data: {
                    id: id,
                    programId: command.programId,
                    title: command.title,
                    description: command.description,
                    submittable: command.submittable,
                    deadline: command.deadline,
                    hideSubmissionsBefore: command.hideSubmissionsBefore,
                    objectiveType: command.objectiveType,
                    isHidden: command.isHidden,
                    attachments: command.attachments,
                },
            },
        });
    }

    fetchEntity(id: number): Promise<Objective> {
        return callJsonEndpoint<Objective>({
            conf: {
                url: '/api/up/server/api/objective/objective',
                method: 'get',
                params: {
                    id: id,
                },
            },
        }).then((resp) => resp.data);
    }
}

ObjectiveDisplay.fetchingTools = new FetchingToolsImpl();

export default ObjectiveDisplay;
