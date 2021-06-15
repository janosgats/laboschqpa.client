import {UserGeneratedContent} from "~/model/usergeneratedcontent/UserGeneratedContent";

export interface Riddle extends UserGeneratedContent {
    title: string;
    hint: string;
    solution: string;
}