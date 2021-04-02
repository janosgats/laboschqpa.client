import React, {createContext, FunctionComponent, ReactNode, useState} from "react";
import {isValidBoolean} from "~/utils/CommonValidators";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import LoginWall from "~/components/join/LoginWall";
import {useRouter} from "next/router";

export interface UserInfo {
    userId: number;
}

export interface CurrentUser {
    getUserInfo: () => UserInfo;
    isLoggedIn: () => boolean;
    setLoggedInState: (isLoggedIn: boolean) => void;
}

export const CurrentUserContext = createContext<CurrentUser>({
    getUserInfo: null,
    isLoggedIn: null,
    setLoggedInState: null,
});

interface Props {
    children: ReactNode;
}

const CurrentUserProvider: FunctionComponent = ({children}: Props): JSX.Element => {
    const router = useRouter();
    const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(null);
    const [userInfo, setUserInfo] = useState<UserInfo>(null);
    console.log(JSON.stringify(router));

    function shouldApplyLoginWall(): boolean {
        return !router.pathname.startsWith('/login/');
    }

    async function updateStateFromServer() {
        await callJsonEndpoint<UserInfo>({
                url: "/api/up/server/api/currentUser/userInfo"
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

    function setLoggedInState(isLoggedIn: boolean) {
        setIsUserLoggedIn(isLoggedIn);
        setUserInfo(null);
    }

    const contextValue: CurrentUser = {
        getUserInfo: getUserInfo,
        isLoggedIn: isLoggedIn,
        setLoggedInState: setLoggedInState,
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
