import React, {FC, useContext, useEffect, useState} from 'react'
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
import {ObjectiveType} from "~/enums/ObjectiveType";
import DateTimeFormatter from "~/utils/DateTimeFormatter";
import ObjectiveTypeSelector from "~/components/selector/ObjectiveTypeSelector";
import {getSurelyDate, isDateTextInputValid} from "~/utils/DateHelpers";
import Scorer from "~/components/Scorer";
import {SubmissionDisplayContainer} from "~/components/fetchableDisplay/FetchableDisplayContainer";

export interface SaveObjectiveCommand {
    title: string;
    description: string;
    submittable: boolean;
    deadline: Date;
    objectiveType: ObjectiveType;
    attachments: number[];
}

const ObjectiveDisplay: FetchableDisplay<Objective, SaveObjectiveCommand> = (props) => {
    const defaultTitle = props.isCreatingNew ? '' : props.existingEntity.title;
    const defaultDescription = props.isCreatingNew ? MuiRteUtils.emptyEditorContent : props.existingEntity.description;
    const defaultSubmittable = props.isCreatingNew ? true : props.existingEntity.submittable;
    const defaultDeadline = props.isCreatingNew ? new Date() : props.existingEntity.deadline as Date;
    const defaultObjectiveType = props.isCreatingNew ? ObjectiveType.MAIN_OBJECTIVE : props.existingEntity.objectiveType;
    const defaultAttachments = props.isCreatingNew ? [] : props.existingEntity.attachments;

    const currentUser = useContext(CurrentUserContext);
    const [isEdited, setIsEdited] = useState<boolean>(props.isCreatingNew);
    const [isScorerOpen, setIsScorerOpen] = useState<boolean>(false);
    const [isSubmissionDisplayOpen, setIsSubmissionDisplayOpen] = useState<boolean>(false);

    const [title, setTitle] = useState<string>(defaultTitle);
    const [description, setDescription] = useState<string>(defaultDescription);
    const [submittable, setSubmittable] = useState<boolean>(defaultSubmittable);
    const [deadline, setDeadline] = useState<Date>(defaultDeadline);
    const [objectiveType, setObjectiveType] = useState<ObjectiveType>(defaultObjectiveType);
    const [attachments, setAttachments] = useState<number[]>(defaultAttachments);

    const [author, setAuthor] = useState<Author>();
    const [isAuthorFetchingPending, setIsAuthorFetchingPending] = useState<boolean>(false);

    useEffect(() => {
        setDescription(defaultDescription);
        setAttachments(defaultAttachments);
    }, [props.existingEntity]);

    function composeSaveObjectiveCommand(): SaveObjectiveCommand {
        return {
            title: title,
            description: description,
            submittable: submittable,
            deadline: deadline,
            objectiveType: objectiveType,
            attachments: attachments,
        };
    }

    function doSave() {
        //TODO: Wait for attachments to finish uploading
        props.onSave(composeSaveObjectiveCommand());
    }

    function doCancelEdit() {
        setIsEdited(false);
        setTitle(defaultTitle);
        setDescription(defaultDescription);
        setSubmittable(defaultSubmittable);
        setDeadline(defaultDeadline);
        setObjectiveType(defaultObjectiveType);
        setAttachments(defaultAttachments);
        props.onCancelEditing();
    }

    function doDelete() {
        const surelyDelete: boolean = confirm("Do you want to delete this Objective?");
        if (surelyDelete) {
            props.onDelete();
        }
    }

    function fetchAuthor() {
        setIsAuthorFetchingPending(true);
        UserInfoService.getAuthor(props.existingEntity.creatorUserId, props.existingEntity.editorUserId, false)
            .then(value => setAuthor(value))
            .catch(() => EventBus.notifyError("Error while loading Author"))
            .finally(() => setIsAuthorFetchingPending(false));
    }

    function isBeforeSubmissionDeadline() {
        return getSurelyDate(props.existingEntity.deadline).getTime() > new Date().getTime();
    }

    return (
        <>
            <div style={{borderStyle: "solid", borderWidth: 2, padding: 10}}>

                {(!isEdited)
                && currentUser.hasAuthority(Authority.ObjectiveEditor) && (
                    <button onClick={() => setIsEdited(true)}>Edit</button>
                )}

                {isEdited && (
                    <ObjectiveTypeSelector value={objectiveType} onChange={setObjectiveType}/>
                )}

                {isEdited ? (
                    <>
                        <label>Title: </label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)}/>
                        <br/>
                    </>
                ) : (
                    <h2>{title}</h2>
                )}

                <RichTextEditor isEdited={isEdited} readOnlyControls={props.isApiCallPending}
                                defaultValue={defaultDescription}
                                onChange={(data) => setDescription(data)}/>

                {isEdited && (
                    <>
                        <label>Teams can submit directly to this objective: </label>
                        <input type="checkbox"
                               checked={submittable}
                               onChange={e => setSubmittable(e.target.checked)}/>
                        <br/>
                    </>
                )}
                <label>Deadline: </label>
                <TempDatetimePicker value={deadline} onChange={setDeadline} disabled={!isEdited}/>

                <div>
                    <p>{isEdited && 'Editing'} Attachments: {JSON.stringify(attachments)}</p>
                </div>

                {(!isEdited) && (
                    <>
                        {submittable && isBeforeSubmissionDeadline() && currentUser.isMemberOrLeaderOfAnyTeam() && (
                            <button onClick={() => setIsSubmissionDisplayOpen(true)}>Submit</button>
                        )}
                        {currentUser.hasAuthority(Authority.TeamScoreEditor) && (
                            <button onClick={() => setIsScorerOpen(true)}>Score</button>
                        )}

                        {isSubmissionDisplayOpen && (
                            <div style={{borderStyle: 'solid', borderColor: 'green'}}>
                                <p>TODO: This should be a modal</p>
                                <button onClick={() => setIsSubmissionDisplayOpen(false)}>Close modal</button>
                                <SubmissionDisplayContainer
                                    shouldCreateNew={true}
                                    displayExtraProps={{
                                        creationObjectiveId: props.existingEntity.id,
                                        creationObjectiveTitle: props.existingEntity.title,
                                        creationTeamName: currentUser.getUserInfo() && currentUser.getUserInfo().teamName,
                                        showObjectiveTitle: true,
                                        showTeamName: !!currentUser.getUserInfo()
                                    }}
                                />
                            </div>
                        )}

                        {isScorerOpen && (
                            <Scorer defaultObjectiveId={props.existingEntity.id}
                                    onClose={() => setIsScorerOpen(false)}/>
                        )}

                        <ul>
                            <li>Created: {DateTimeFormatter.toFullBasic(props.existingEntity.creationTime)}</li>
                            <li>Last edited: {DateTimeFormatter.toFullBasic(props.existingEntity.editTime)}</li>
                        </ul>
                        {author ? (
                            <ul>
                                <li>Created by: {UserNameFormatter.getBasicDisplayName(author.creator)}</li>
                                <li>Last edited by: {UserNameFormatter.getBasicDisplayName(author.editor)}</li>
                            </ul>
                        ) : (
                            <button onClick={fetchAuthor} disabled={isAuthorFetchingPending}>Show Author</button>
                        )}

                    </>
                )}

                {isEdited && (
                    <>

                        {props.isCreatingNew && (
                            <button onClick={doSave} disabled={props.isApiCallPending}>Create</button>
                        )}
                        {(!props.isCreatingNew) && (
                            <>
                                <button onClick={doSave} disabled={props.isApiCallPending}>Modify</button>
                                <button onClick={doCancelEdit} disabled={props.isApiCallPending}>Cancel</button>
                                <button onClick={doDelete} disabled={props.isApiCallPending}>Delete</button>
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    )
}

interface TempDatetimePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    disabled: boolean;
}

/**
 * TODO: Replace this ugliness with a MUI component
 */
const TempDatetimePicker: FC<TempDatetimePickerProps> = ({value, onChange, disabled}) => {
    const [internalValue, setInternalValue] = useState<string>(
        getSurelyDate(value).toISOString().replace('T', ' ').replace('Z', '')
    );
    const [isError, setIsError] = useState<boolean>(!isDateTextInputValid(internalValue));

    return (<>
            <input
                value={internalValue}
                onChange={e => {
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
            {isError && 'datetime error TODO: use MUI'}
        </>
    )
}

class FetchingToolsImpl implements FetchingTools<Objective, SaveObjectiveCommand> {
    createNewEntity(command: SaveObjectiveCommand): Promise<number> {
        return callJsonEndpoint<CreatedEntityResponse>({
            url: "/api/up/server/api/objective/createNew",
            method: "post",
            data: {
                title: command.title,
                description: command.description,
                submittable: command.submittable,
                deadline: command.deadline,
                objectiveType: command.objectiveType,
                attachments: command.attachments,
            }
        }).then(resp => resp.data.createdId);
    }

    deleteEntity(id: number): Promise<any> {
        return callJsonEndpoint({
            url: "/api/up/server/api/objective/delete",
            method: "delete",
            params: {
                id: id
            }
        });
    }

    editEntity(id: number, command: SaveObjectiveCommand): Promise<any> {
        return callJsonEndpoint({
            url: "/api/up/server/api/objective/edit",
            method: "post",
            data: {
                id: id,
                title: command.title,
                description: command.description,
                submittable: command.submittable,
                deadline: command.deadline,
                objectiveType: command.objectiveType,
                attachments: command.attachments,
            }
        });
    }

    fetchEntity(id: number): Promise<Objective> {
        return callJsonEndpoint<Objective>({
            url: "/api/up/server/api/objective/objective",
            method: "get",
            params: {
                id: id
            }
        }).then(resp => resp.data);
    }
}

ObjectiveDisplay.fetchingTools = new FetchingToolsImpl();

export default ObjectiveDisplay;