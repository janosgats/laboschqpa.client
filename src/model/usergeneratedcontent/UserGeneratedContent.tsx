import Entity from "~/model/Entity";

export interface UserGeneratedContent extends Entity {
    creatorUserId: number;
    editorUserId: number;
    creationTime: string | Date;
    editTime: string | Date;
    attachments: number[];
}