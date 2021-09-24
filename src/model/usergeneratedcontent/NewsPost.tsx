import {UserGeneratedContent} from '~/model/usergeneratedcontent/UserGeneratedContent';

export interface NewsPost extends UserGeneratedContent {
    content: string;
    title: string;
}
