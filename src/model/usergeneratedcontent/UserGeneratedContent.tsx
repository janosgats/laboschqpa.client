export interface UserGeneratedContent {
    id: number;
    creatorUserId: number;
    editorUserId: number;
    creationTime: string | Date;
    editTime: string | Date;
    attachments: number[];
}