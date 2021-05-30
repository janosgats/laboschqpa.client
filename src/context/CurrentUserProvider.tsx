import React, {createContext, FC, FunctionComponent, ReactNode, useState} from "react";
import {isValidBoolean} from "~/utils/CommonValidators";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import LoginWall from "~/components/join/LoginWall";
import {useRouter} from "next/router";
import {UserInfo} from "~/model/UserInfo";
import {Authority} from "~/enums/Authority";
import {TeamRole} from "~/enums/TeamRole";
import * as CsrfService from "~/service/CsrfService";
import EventBus, {EventType} from "~/utils/EventBus";

export interface CurrentUser {
    getUserInfo: () => UserInfo;
    /**
     * Returns false until the UserInfo was fetched. After that, it checks for authority.
     */
    hasAuthority: (authorityToCheck: Authority) => boolean;
    /**
     * Returns false until the UserInfo was fetched. After that, it checks for team membership.
     */
    isMemberOrLeaderOrApplicantOfAnyTeam: () => boolean;
    /**
     * Returns false until the UserInfo was fetched. After that, it checks for team membership.
     */
    isMemberOrLeaderOfTeam: (teamId: number) => boolean;
    /**
     * Returns false until the UserInfo was fetched. After that, it checks for team leadership.
     */
    isLeaderOfTeam: (teamId: number) => boolean;
    /**
     * Returns false until the UserInfo was fetched. After that, it checks for team membership.
     */
    isMemberOrLeaderOfAnyTeam: () => boolean;
    isLoggedIn: () => boolean;
    setLoggedInState: (isLoggedIn: boolean) => void;
    reload: () => Promise<void>;
}

export const CurrentUserContext = createContext<CurrentUser>({
    getUserInfo: null,
    hasAuthority: null,
    isMemberOrLeaderOrApplicantOfAnyTeam: null,
    isMemberOrLeaderOfTeam: null,
    isMemberOrLeaderOfAnyTeam: null,
    isLeaderOfTeam: null,
    isLoggedIn: null,
    setLoggedInState: null,
    reload: null,
});

interface Props {
    children: ReactNode;
}

const FetchErrorBlock: FC<{ onRetryClick: () => void; }> = (props) => {
    return (
        <>
            <p>Error while fetching your login info</p>
            <button onClick={props.onRetryClick}>
                Retry
            </button>
        </>
    );
}

const CurrentUserProvider: FunctionComponent = ({children}: Props): JSX.Element => {
    const router = useRouter();
    const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(null);
    const [userInfo, setUserInfo] = useState<UserInfo>(null);
    const [errorWhileFetchingUserInfo, setErrorWhileFetchingUserInfo] = useState<boolean>(false);
    const [pendingFetchingUserInfo, setPendingFetchingUserInfo] = useState<boolean>(false);

    function shouldApplyLoginWall(): boolean {
        return !router.pathname.startsWith('/login/') && !router.pathname.startsWith('/emailVerification/');
    }

    async function updateStateFromServer() {
        setPendingFetchingUserInfo(true);
        CsrfService.reloadCsrfToken();
        await callJsonEndpoint<UserInfo>({
                conf: {
                    url: "/api/up/server/api/currentUser/userInfoWithAuthoritiesAndTeam"
                },
                acceptedResponseCodes: [200, 403]
            }
        ).then(res => {
            if (res.status === 200) {
                setIsUserLoggedIn(true);
                setUserInfo(res.data);
            } else {
                setIsUserLoggedIn(false);
                setUserInfo(null);
            }
            setErrorWhileFetchingUserInfo(false);
        }).catch(e => {
            setErrorWhileFetchingUserInfo(true);
        }).finally(() => {
            setPendingFetchingUserInfo(false);
        });
    }

    function isLoggedIn(): boolean {
        if (isValidBoolean(isUserLoggedIn)) {
            return isUserLoggedIn;
        }

        if (!pendingFetchingUserInfo) {
            updateStateFromServer();
        }

        return null;
    }

    function getUserInfo(): UserInfo {
        if (!isLoggedIn()) {
            return null;
        }
        if (userInfo) {
            return userInfo;
        }

        if (!pendingFetchingUserInfo) {
            updateStateFromServer();
        }

        return null;
    }

    function hasAuthority(authorityToCheck: Authority): boolean {
        return getUserInfo() && getUserInfo().authorities.includes(authorityToCheck);
    }

    function isMemberOrLeaderOfTeam(teamId: number): boolean {
        return getUserInfo()
            && getUserInfo().teamId === teamId
            && (getUserInfo().teamRole == TeamRole.MEMBER || getUserInfo().teamRole == TeamRole.LEADER);
    }

    function isMemberOrLeaderOrApplicantOfAnyTeam(): boolean {
        return getUserInfo()
            && (getUserInfo().teamRole == TeamRole.MEMBER
                || getUserInfo().teamRole == TeamRole.LEADER
                || getUserInfo().teamRole == TeamRole.APPLICANT);
    }

    function isLeaderOfTeam(teamId: number): boolean {
        return getUserInfo()
            && getUserInfo().teamId === teamId
            && getUserInfo().teamRole == TeamRole.LEADER;
    }

    function isMemberOrLeaderOfAnyTeam(): boolean {
        return getUserInfo()
            && (getUserInfo().teamRole == TeamRole.MEMBER || getUserInfo().teamRole == TeamRole.LEADER);
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
        isMemberOrLeaderOrApplicantOfAnyTeam: isMemberOrLeaderOrApplicantOfAnyTeam,
        isMemberOrLeaderOfTeam: isMemberOrLeaderOfTeam,
        isLeaderOfTeam: isLeaderOfTeam,
        isMemberOrLeaderOfAnyTeam: isMemberOrLeaderOfAnyTeam,

    };

    EventBus.subscribe(EventType.TRIGGER_USER_CONTEXT_RELOAD, "CurrentUserProvider", event => {
        setTimeout(reload, 600);
    });

    function getPageContent(): ReactNode {
        if (!shouldApplyLoginWall()) {
            return children;
        }

        if (errorWhileFetchingUserInfo && !pendingFetchingUserInfo) {
            return <FetchErrorBlock onRetryClick={reload}/>
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
            {getPageContent()}
        </CurrentUserContext.Provider>
    );
};

export default CurrentUserProvider;
