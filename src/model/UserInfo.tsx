import {Authority} from "~/enums/Authority";
import {TeamRole} from "~/enums/TeamRole";

export interface UserNameContainer {
    firstName: string;
    lastName: string;
    nickName: string;
}

export interface UserInfo extends UserNameContainer {
    userId: number;

    profilePicUrl: string;

    teamId: number;
    teamRole: TeamRole;

    enabled: boolean;
    authorities: Authority[];
}