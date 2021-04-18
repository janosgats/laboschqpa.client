import {UserGeneratedContent} from "~/model/usergeneratedcontent/UserGeneratedContent";

export interface Submission extends UserGeneratedContent {
    objectiveId: number;
    teamId: number;
    content: string;

    objectiveTitle: string;
    teamName: string;
    objectiveDeadline: Date | string;
    objectiveSubmittable: boolean;
}