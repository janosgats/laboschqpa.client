import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import {UserInfo} from "~/model/UserInfo";

export interface Author {
    creator: UserInfo;
    editor: UserInfo;
}

async function getUserInfo(userId: number, publishExceptionEvents = true): Promise<UserInfo> {
    return callJsonEndpoint<UserInfo>({
        conf: {
            url: "/api/up/server/api/user/info",
            params: {
                id: userId
            }
        }, publishExceptionEvents: publishExceptionEvents
    }).then(resp => resp.data);
}

async function getAuthor(creatorUserId: number, editorUserId: number, publishExceptionEvents = true): Promise<Author> {
    const creatorPromise = UserInfoService.getUserInfo(creatorUserId, publishExceptionEvents);
    const editorPromise = UserInfoService.getUserInfo(editorUserId, publishExceptionEvents);

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