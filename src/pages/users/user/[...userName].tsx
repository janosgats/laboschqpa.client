import Head from 'next/head'
import {NextPage} from "next";
import React, {FC, useContext, useState} from "react";
import useEndpoint from "~/hooks/useEndpoint";
import {useRouter} from "next/router";
import UserNameFormatter from "~/utils/UserNameFormatter";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import {UserInfo} from "~/model/UserInfo";
import LoginForm from "~/components/join/LoginForm";
import EmailAddressesPanel from "~/components/email/EmailAddressesPanel";

const Index: NextPage = () => {
    const router = useRouter();
    const currentUser = useContext(CurrentUserContext);

    const [userInfoEditorOpen, setUserInfoEditorOpen] = useState<boolean>(false);

    const usedEndpoint = useEndpoint<UserInfo>({
        conf: {
            url: "/api/up/server/api/user/infoWithAuthorities",
            params: {
                id: router.query["id"]
            }
        },
        deps: [router.query["id"], router.isReady],
        enableRequest: router.isReady,
    });
    const userInfo: UserInfo = usedEndpoint.data;

    function submitEditedUserInfo(userNamesDto: UserNamesDto) {
        callJsonEndpoint<void>({
            conf: {
                url: "/api/up/server/api/user/setInfo",
                method: "POST",
                data: {
                    userId: usedEndpoint.data.userId,
                    firstName: userNamesDto.firstName,
                    lastName: userNamesDto.lastName,
                    nickName: userNamesDto.nickName,
                }
            }
        })
            .then(resp => {
                setUserInfoEditorOpen(false);
                usedEndpoint.reloadEndpoint();
                currentUser.reload();
            })
            .catch(() => {
                EventBus.notifyError("Error while editing your profile", "Couldn't save your changes")
            });
    }

    const isViewingOwnProfile: boolean = !!(userInfo && userInfo.userId === currentUser?.getUserInfo()?.userId);

    return (
        <div>
            <Head>
                <title>{UserNameFormatter.getBasicDisplayName(userInfo, 'Qpa')} User</title>
            </Head>

            {usedEndpoint.pending && (
                <p>Pending...</p>
            )}

            {usedEndpoint.failed && (
                <p>Couldn't load user :'(</p>
            )}

            {userInfo && (
                <div>
                    {isViewingOwnProfile && (
                        <LoginForm addLoginMethod={true}/>
                    )}
                    {isViewingOwnProfile && (
                        <EmailAddressesPanel/>
                    )}

                    <h2>{UserNameFormatter.getFullName(userInfo)}</h2>
                    <h4>{UserNameFormatter.getNickName(userInfo)}</h4>
                    <img src={userInfo.profilePicUrl} alt={UserNameFormatter.getBasicDisplayName(userInfo)}/>
                    <ul>
                        {
                            userInfo.authorities.map(value => <li key={value}>{value}</li>)
                        }
                    </ul>
                    {isViewingOwnProfile && (
                        <div>
                            <button onClick={() => setUserInfoEditorOpen(true)}>Edit info</button>

                            {userInfoEditorOpen && (
                                <>
                                    <h3>Edit</h3>
                                    <UserInfoEditor
                                        defaultNames={{
                                            firstName: userInfo.firstName,
                                            lastName: userInfo.lastName,
                                            nickName: userInfo.nickName,
                                        }}
                                        onSubmit={submitEditedUserInfo}
                                        onCancel={() => setUserInfoEditorOpen(false)}/>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

        </div>
    )
};

interface UserNamesDto {
    firstName: string;
    lastName: string;
    nickName: string;
}

interface UserNamesEditorProps {
    defaultNames: UserNamesDto;
    onSubmit: (newNames: UserNamesDto) => void
    onCancel: () => void
}

const UserInfoEditor: FC<UserNamesEditorProps> = ({defaultNames, onSubmit, onCancel}) => {
    const [firstName, setFirstName] = useState<string>(defaultNames.firstName);
    const [lastName, setLastName] = useState<string>(defaultNames.lastName);
    const [nickName, setNickName] = useState<string>(defaultNames.nickName);

    function composeUserNamesDto() {
        return {
            firstName: firstName,
            lastName: lastName,
            nickName: nickName,
        };
    }

    return (
        <>
            <span>First name:</span>
            <input value={firstName} onChange={e => setFirstName(e.target.value)}/>
            <span>Last name:</span>
            <input value={lastName} onChange={e => setLastName(e.target.value)}/>
            <span>Nick name:</span>
            <input value={nickName} onChange={e => setNickName(e.target.value)}/>

            <button onClick={() => onSubmit(composeUserNamesDto())}>Save changes</button>
            <button onClick={() => onCancel()}>Cancel</button>
        </>
    );
};

export default Index;
