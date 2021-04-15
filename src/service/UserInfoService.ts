import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import {UserInfo} from "~/model/UserInfo";

export interface Author {
    creator: UserInfo;
    editor: UserInfo;
}

async function getUserInfo(userId: number): Promise<UserInfo> {
    return callJsonEndpoint<UserInfo>({
        url: "/api/up/server/api/user/info",
        params: {
            id: userId
        }
    }).then(resp => resp.data);
}

async function getAuthor(creatorUserId: number, editorUserId: number): Promise<Author> {
    const creatorPromise = UserInfoService.getUserInfo(creatorUserId);
    const editorPromise = UserInfoService.getUserInfo(editorUserId);

    return await Promise.all([creatorPromise, editorPromise])
        .then(value => {
            return {
                creator: value[0],
                editor: value[1],
            };
        });
}


const UserInfoService = {
    getUserInfo,
    getAuthor
};

export default UserInfoService;