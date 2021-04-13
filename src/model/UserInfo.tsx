export interface UserNameContainer {
    firstName: string;
    lastName: string;
    nickName: string;
}

export interface UserInfo extends UserNameContainer {
    userId: number;

    profilePicUrl: string;
    authorities: string[];
}