import {UserGeneratedContent} from "~/model/usergeneratedcontent/UserGeneratedContent";

export interface AccessibleRiddle extends UserGeneratedContent {
    title: string;
    hint: string;
    solution: string;

    wasHintUsed: boolean;
    isAlreadySolved: boolean;

    firstSolvingTeamId: number;
    firstSolvingTeamName: string;
    firstSolvingTime: Date | string;
}