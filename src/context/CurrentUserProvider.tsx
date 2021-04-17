import React, {createContext, FunctionComponent, ReactNode, useState} from "react";
import {isValidBoolean} from "~/utils/CommonValidators";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import LoginWall from "~/components/join/LoginWall";
import {useRouter} from "next/router";
import {UserInfo} from "~/model/UserInfo";
import {Authority} from "~/enums/Authority";

export interface CurrentUser {
    getUserInfo: () => UserInfo;
    /**
     * Returns false until the UserInfo was fetched. After that, it checks for authority.
     */
    hasAuthority: (authorityToCheck: Authority) => boolean;
    isLoggedIn: () => boolean;
    setLoggedInState: (isLoggedIn: boolean) => void;
    reload: () => Promise<void>;
}

export const CurrentUserContext = createContext<CurrentUser>({
    getUserInfo: null,
    hasAuthority: null,
    isLoggedIn: null,
    setLoggedInState: null,
    reload: null,
});

interface Props {
    children: ReactNode;
}

const CurrentUserProvider: FunctionComponent = ({children}: Props): JSX.Element => {
    const router = useRouter();
    const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(null);
    const [userInfo, setUserInfo] = useState<UserInfo>(null);

    function shouldApplyLoginWall(): boolean {
        return !router.pathname.startsWith('/login/');
    }

    async function updateStateFromServer() {
        await callJsonEndpoint<UserInfo>({
                url: "/api/up/server/api/currentUser/userInfoWithAuthorities"
            },
            true,
            [200, 403]
        ).then(res => {
            if (res.status === 200) {
                setIsUserLoggedIn(true);
                setUserInfo(res.data);
            } else {
                setIsUserLoggedIn(false);
                setUserInfo(null);
            }
        });
    }

    function isLoggedIn(): boolean {
        if (isValidBoolean(isUserLoggedIn)) {
            return isUserLoggedIn;
        }
        updateStateFromServer();

        return null;
    }

    function getUserInfo(): UserInfo {
        if (!isLoggedIn()) {
            return null;
        }
        if (userInfo) {
            return userInfo;
        }
        updateStateFromServer();

        return null;
    }

    function hasAuthority(authorityToCheck: Authority): boolean {
        return getUserInfo() && getUserInfo().authorities.includes(authorityToCheck);
    }

    function setLoggedInState(isLoggedIn: boolean) {
        setIsUserLoggedIn(isLoggedIn);
        setUserInfo(null);
    }

    async function reload() {
        await updateStateFromServer();
    }

    const contextValue: CurrentUser = {
        getUserInfo: getUserInfo,
        isLoggedIn: isLoggedIn,
        setLoggedInState: setLoggedInState,
        reload: reload,
        hasAuthority: hasAuthority,
    };

    function getPageContent(): ReactNode {
        if (!shouldApplyLoginWall()) {
            return children;
        }
        if (isLoggedIn() === null) {
            return (<p>TODO: Display a spinner here while determining login status</p>)
        }
        if (isLoggedIn()) {
            return children;
        }
        return <LoginWall/>
    }

    return (
        <CurrentUserContext.Provider value={contextValue}>
            {JSON.stringify(isUserLoggedIn)}
            {JSON.stringify(userInfo)}
            {getPageContent()}
        </CurrentUserContext.Provider>
    );
};

export default CurrentUserProvider;
