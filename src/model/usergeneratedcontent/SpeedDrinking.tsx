import {UserGeneratedContent} from "~/model/usergeneratedcontent/UserGeneratedContent";
import {SpeedDrinkingCategory} from "~/enums/SpeedDrinkingCategory";

export interface SpeedDrinking extends UserGeneratedContent {
    drinkerUserId: number;

    drinkerFirstName: string;
    drinkerLastName: string;
    drinkerNickName: string;
    drinkerTeamId: number;
    drinkerTeamName: string;

    time: number;
    category: SpeedDrinkingCategory;
    note: string;
}