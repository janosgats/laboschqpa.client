import {UserGeneratedContent} from "~/model/usergeneratedcontent/UserGeneratedContent";
import {ObjectiveType} from "~/enums/ObjectiveType";

export interface Objective extends UserGeneratedContent {
    title: string;
    description: string;
    submittable: boolean;
    deadline: string | Date;
    objectiveType: ObjectiveType;
}