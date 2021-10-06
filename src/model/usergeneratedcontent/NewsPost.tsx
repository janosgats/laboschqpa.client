import {UserGeneratedContent} from "~/model/usergeneratedcontent/UserGeneratedContent";

export interface NewsPost extends UserGeneratedContent {
    title: string;
    content: string;
}