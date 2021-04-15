import React, {useContext, useEffect, useState} from 'react'
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Authority} from "~/enums/Authority";
import {NewsPost} from "~/model/usergeneratedcontent/NewsPost";
import RichTextEditor from "~/components/texteditor/RichTextEditor";
import MuiRteUtils from "~/utils/MuiRteUtils";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import {FetchableDisplay, FetchingTools} from "~/model/FetchableDisplay";
import CreatedEntityResponse from "~/model/CreatedEntityResponse";
import UserInfoService, {Author} from "~/service/UserInfoService";
import UserNameFormatter from "~/utils/UserNameFormatter";

export interface SaveNewsPostCommand {
    content: string;
    attachments: number[];
}

const NewsPostDisplay: FetchableDisplay<NewsPost, SaveNewsPostCommand> = (props) => {
    const defaultContent = props.isCreatingNew ? MuiRteUtils.emptyEditorContent : props.existingEntity.content;
    const defaultAttachments = props.isCreatingNew ? [] : props.existingEntity.attachments;

    const currentUser = useContext(CurrentUserContext);
    const [isEdited, setIsEdited] = useState<boolean>(props.isCreatingNew);
    const [content, setContent] = useState<string>(defaultContent);
    const [attachments, setAttachments] = useState<number[]>(defaultAttachments);

    const [author, setAuthor] = useState<Author>();
    const [isAuthorFetchingPending, setIsAuthorFetchingPending] = useState<boolean>(false);

    useEffect(() => {
        setContent(defaultContent);
        setAttachments(defaultAttachments);
    }, [props.existingEntity]);

    function composeSaveNewsPostCommand(): SaveNewsPostCommand {
        return {
            content: content,
            attachments: attachments
        };
    }

    function doSave() {
        //TODO: Wait for attachments to finish uploading
        props.onSave(composeSaveNewsPostCommand());
    }

    function doCancelEdit() {
        setIsEdited(false);
        setContent(defaultContent)
        setAttachments(defaultAttachments)
    }

    function doDelete() {
        const surelyDelete: boolean = confirm("Do you want to delete this NewsPost?");
        if (surelyDelete) {
            props.onDelete();
        }
    }

    function fetchAuthor() {
        setIsAuthorFetchingPending(true);
        UserInfoService.getAuthor(props.existingEntity.creatorUserId, props.existingEntity.editorUserId)
            .then(value => setAuthor(value))
            .finally(() => setIsAuthorFetchingPending(false));
    }

    return (
        <>
            <div style={{borderStyle: "solid", borderWidth: 2, padding: 10}}>

                {(!isEdited)
                && currentUser.getUserInfo() && currentUser.getUserInfo().authorities.includes(Authority.NewsPostEditor) && (
                    <button onClick={() => setIsEdited(true)}>Edit</button>
                )}

                <RichTextEditor isEdited={isEdited} readOnlyControls={props.isApiCallPending}
                                defaultValue={defaultContent}
                                onChange={(data) => setContent(data)}/>

                <div>
                    <p>{isEdited && 'Editing'} Attachments: {JSON.stringify(attachments)}</p>
                </div>

                {(!props.isCreatingNew) && (!isEdited) && (
                    <>
                        <ul>
                            <li>Created at: {props.existingEntity.creationTime}</li>
                            <li>Last edited at: {props.existingEntity.editTime}</li>
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

class FetchingToolsImpl implements FetchingTools<NewsPost, SaveNewsPostCommand> {
    createNewEntity(command: SaveNewsPostCommand): Promise<number> {
        return callJsonEndpoint<CreatedEntityResponse>({
            url: "/api/up/server/api/newsPost/createNew",
            method: "post",
            data: {
                content: command.content,
                attachments: command.attachments,
            }
        }).then(resp => resp.data.createdId);
    }

    deleteEntity(id: number): Promise<any> {
        return callJsonEndpoint<NewsPost>({
            url: "/api/up/server/api/newsPost/delete",
            method: "delete",
            params: {
                id: id
            }
        });
    }

    editEntity(id: number, command: SaveNewsPostCommand): Promise<any> {
        return callJsonEndpoint({
            url: "/api/up/server/api/newsPost/edit",
            method: "post",
            data: {
                id: id,
                content: command.content,
                attachments: command.attachments,
            }
        });
    }

    fetchEntity(id: number): Promise<NewsPost> {
        return callJsonEndpoint<NewsPost>({
            url: "/api/up/server/api/newsPost/newsPost",
            method: "get",
            params: {
                id: id
            }
        }).then(resp => resp.data);
    }
}

NewsPostDisplay.fetchingTools = new FetchingToolsImpl();

export default NewsPostDisplay;