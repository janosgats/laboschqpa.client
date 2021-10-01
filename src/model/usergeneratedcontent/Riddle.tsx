import {UserGeneratedContent} from "~/model/usergeneratedcontent/UserGeneratedContent";
import {RiddleCategory} from "~/enums/RiddleCategory";

export interface Riddle extends UserGeneratedContent {
    title: string;
    category: RiddleCategory;
    hint: string;
    solution: string;
}