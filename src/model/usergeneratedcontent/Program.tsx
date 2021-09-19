import {UserGeneratedContent} from "~/model/usergeneratedcontent/UserGeneratedContent";

export interface Program extends UserGeneratedContent {
    title: string;
    headline: string;
    description: string;
    startTime: string | Date;
    endTime: string | Date;

    teamScore?: number;
}