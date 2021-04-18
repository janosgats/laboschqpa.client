import React, {useContext, useEffect, useState} from 'react'
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import RichTextEditor from "~/components/textEditor/RichTextEditor";
import MuiRteUtils from "~/utils/MuiRteUtils";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import {FetchableDisplay, FetchingTools} from "~/model/FetchableDisplay";
import CreatedEntityResponse from "~/model/CreatedEntityResponse";
import UserInfoService, {Author} from "~/service/UserInfoService";
import UserNameFormatter from "~/utils/UserNameFormatter";
import EventBus from "~/utils/EventBus";
import DateTimeFormatter from "~/utils/DateTimeFormatter";
import {Submission} from "~/model/usergeneratedcontent/Submission";
import {TeamRole} from "~/enums/TeamRole";
import ApiErrorDescriptorException from "~/exception/ApiErrorDescriptorException";
import {submission_OBJECTIVE_DEADLINE_HAS_PASSED, submission_OBJECTIVE_IS_NOT_SUBMITTABLE} from "~/enums/ApiErrors";
import {getSurelyDate} from "~/utils/DateHelpers";
import {Authority} from "~/enums/Authority";
import Scorer from "~/components/Scorer";

export interface SaveSubmissionCommand {
    /**
     * Only needed when creating new submission
     */
    objectiveId?: number;

    content: string;
    attachments: number[];
}

export interface SubmissionDisplayExtraProps {
    creationObjectiveId?: number;
    creationObjectiveTitle?: string;
    creationTeamName?: string;

    showObjectiveTitle: boolean;
    showTeamName: boolean;
}

const SubmissionDisplay: FetchableDisplay<Submission, SaveSubmissionCommand, SubmissionDisplayExtraProps> = (props) => {
    const objectiveId = props.isCreatingNew ? props.creationObjectiveId : props.existingEntity.objectiveId;
    const objectiveTitle = props.isCreatingNew ? props.creationObjectiveTitle : props.existingEntity.objectiveTitle;
    const teamName = props.isCreatingNew ? props.creationTeamName : props.existingEntity.teamName;
    const defaultContent = props.isCreatingNew ? MuiRteUtils.emptyEditorContent : props.existingEntity.content;
    const defaultAttachments = props.isCreatingNew ? [] : props.existingEntity.attachments;

    const currentUser = useContext(CurrentUserContext);
    const [isEdited, setIsEdited] = useState<boolean>(props.isCreatingNew);
    const [isScorerOpen, setIsScorerOpen] = useState<boolean>(false);

    const [content, setContent] = useState<string>(defaultContent);
    const [attachments, setAttachments] = useState<number[]>(defaultAttachments);

    const [author, setAuthor] = useState<Author>();
    const [isAuthorFetchingPending, setIsAuthorFetchingPending] = useState<boolean>(false);

    useEffect(() => {
        setContent(defaultContent);
        setAttachments(defaultAttachments);
    }, [props.existingEntity]);

    function composeSaveSubmissionCommand(): SaveSubmissionCommand {
        return {
            objectiveId: objectiveId,
            content: content,
            attachments: attachments
        };
    }

    function doSave() {
        //TODO: Wait for attachments to finish uploading
        props.onSave(composeSaveSubmissionCommand())
            .catch(e => {
                if (e instanceof ApiErrorDescriptorException) {
                    if (submission_OBJECTIVE_DEADLINE_HAS_PASSED.is(e.apiErrorDescriptor)) {
                        EventBus.notifyWarning('The deadline of this objective has already passed', 'Cannot submit')
                    } else if (submission_OBJECTIVE_IS_NOT_SUBMITTABLE.is(e.apiErrorDescriptor)) {
                        EventBus.notifyWarning('This objective is not open for manual submissions', 'Cannot submit')
                    }
                }
            });
    }

    function doCancelEdit() {
        setIsEdited(false);
        setContent(defaultContent)
        setAttachments(defaultAttachments)
    }

    function doDelete() {
        const surelyDelete: boolean = confirm("Do you want to delete this Submission?");
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

    function canEditSubmission(): boolean {
        if (!currentUser.isMemberOrLeaderOfTeam(props.existingEntity.teamId)) {
            return false;
        }
        if (!props.existingEntity.objectiveSubmittable) {
            return false;
        }
        if (getSurelyDate(props.existingEntity.objectiveDeadline).getTime() < new Date().getTime()) {
            return false;
        }

        return currentUser.getUserInfo().teamRole == TeamRole.LEADER
            || currentUser.getUserInfo().userId === props.existingEntity.creatorUserId;
    }

    return (
        <>
            <div style={{borderStyle: "solid", borderWidth: 2, padding: 10}}>

                {(!isEdited) && canEditSubmission() && (
                    <button onClick={() => setIsEdited(true)}>Edit</button>
                )}

                {props.showObjectiveTitle && (
                    <h1>For {objectiveTitle}</h1>
                )}

                {props.showTeamName && (
                    <h3>By {teamName}</h3>
                )}

                <RichTextEditor isEdited={isEdited} readOnlyControls={props.isApiCallPending}
                                defaultValue={defaultContent}
                                onChange={(data) => setContent(data)}/>

                <div>
                    <p>{isEdited && 'Editing'} Attachments: {JSON.stringify(attachments)}</p>
                </div>

                {(!isEdited) && (
                    <>
                        {currentUser.hasAuthority(Authority.TeamScoreEditor) && (
                            <button onClick={() => setIsScorerOpen(true)}>Score</button>
                        )}

                        {isScorerOpen && (
                            <Scorer defaultObjectiveId={props.existingEntity.objectiveId}
                                    defaultTeamId={props.existingEntity.teamId}
                                    onClose={() => setIsScorerOpen(false)}/>
                        )}

                        <ul>
                            <li>Created at: {DateTimeFormatter.toBasic(props.existingEntity.creationTime)}</li>
                            <li>Last edited at: {DateTimeFormatter.toBasic(props.existingEntity.editTime)}</li>
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
                                <button onClick={doSave} disabled={props.isApiCallPending}>Save</button>
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

class FetchingToolsImpl implements FetchingTools<Submission, SaveSubmissionCommand> {
    createNewEntity(command: SaveSubmissionCommand): Promise<number> {
        return callJsonEndpoint<CreatedEntityResponse>({
            url: "/api/up/server/api/submission/createNew",
            method: "post",
            data: {
                objectiveId: command.objectiveId,
                content: command.content,
                attachments: command.attachments,
            }
        }).then(resp => resp.data.createdId);
    }

    deleteEntity(id: number): Promise<any> {
        return callJsonEndpoint({
            url: "/api/up/server/api/submission/delete",
            method: "delete",
            params: {
                id: id
            }
        });
    }

    editEntity(id: number, command: SaveSubmissionCommand): Promise<any> {
        return callJsonEndpoint({
            url: "/api/up/server/api/submission/edit",
            method: "post",
            data: {
                id: id,
                content: command.content,
                attachments: command.attachments,
            }
        });
    }

    fetchEntity(id: number): Promise<Submission> {
        return callJsonEndpoint<Submission>({
            url: "/api/up/server/api/submission/submission",
            method: "get",
            params: {
                id: id
            }
        }).then(resp => resp.data);
    }
}

SubmissionDisplay.fetchingTools = new FetchingToolsImpl();

export default SubmissionDisplay;