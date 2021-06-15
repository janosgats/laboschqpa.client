import Head from 'next/head'
import {NextPage} from "next";
import React, {useContext, useState} from "react";
import useEndpoint from "~/hooks/useEndpoint";
import {UserInfo} from "~/model/UserInfo";
import {CircularProgress} from "@material-ui/core";
import AdminNavBar from "~/components/nav/AdminNavBar";
import {teamRoleData} from "~/enums/TeamRole";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import EditAuthoritiesDialog from "~/components/admin/EditAuthoritiesDialog";


const Index: NextPage = () => {
    const currentUser = useContext(CurrentUserContext);
    const [userIdToEdit, setUserIdToEdit] = useState<number>()
    const [isEditAuthoritiesDialogOpen, setEditAuthoritiesDialogOpen] = useState<boolean>(false)

    const usedEndpoint = useEndpoint<UserInfo[]>({
        conf: {
            url: "/api/up/server/api/user/listAll"
        }
    });

    function logInAsUser(userId: number) {
        callJsonEndpoint({
            conf: {
                url: '/api/up/server/api/admin/users/logInAsUser',
                method: "post",
                params: {
                    userAccId: userId
                }
            }
        }).then(() => {
            currentUser.reload();
            EventBus.notifyInfo(`Logged in as user ${userId}`);
        })
    }

    function editAuthorities(userId: number) {
        setUserIdToEdit(userId);
        setEditAuthoritiesDialogOpen(true);
    }

    return (
        <>
            <Head>
                <title>Admin - Users</title>
            </Head>

            <AdminNavBar/>

            <EditAuthoritiesDialog onClose={() => setEditAuthoritiesDialogOpen(false)}
                                   isOpen={isEditAuthoritiesDialogOpen}
                                   userId={userIdToEdit}/>

            {usedEndpoint.pending && <CircularProgress/>}
            {usedEndpoint.failed && <p>Couldn't load users :'(</p>}
            {usedEndpoint.data && (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>enabled</th>
                        <th>accepted by e-mail</th>
                        <th>teamId</th>
                        <th>teamRole</th>
                        <th>nickName</th>
                        <th>firstName</th>
                        <th>lastName</th>
                    </tr>
                    </thead>
                    <tbody>
                    {

                        usedEndpoint.data.map((userInfo: UserInfo) => {
                            return (
                                <tr key={userInfo.userId}>
                                    <td>{userInfo.userId}</td>
                                    <td>{userInfo.enabled ? 'true' : 'false'}</td>
                                    <td>{userInfo.isAcceptedByEmail ? 'true' : 'false'}</td>
                                    <td>{userInfo.teamId}</td>
                                    <td>{teamRoleData[userInfo.teamRole].displayName}</td>
                                    <td>{userInfo.nickName}</td>
                                    <td>{userInfo.firstName}</td>
                                    <td>{userInfo.lastName}</td>
                                    <td>
                                        <button onClick={() => editAuthorities(userInfo.userId)}>
                                            Edit authorities
                                        </button>
                                    </td>
                                    <td>
                                        <button onClick={() => logInAsUser(userInfo.userId)}>Log in as</button>
                                    </td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
            )}

        </>
    )
};

export default Index;
