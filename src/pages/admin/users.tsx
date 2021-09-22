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
import MyPaper from "~/components/mui/MyPaper";


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
            <MyPaper>
                {usedEndpoint.pending && <CircularProgress/>}
                {usedEndpoint.failed && <p>Couldn't load users :'(</p>}
                {usedEndpoint.data && (
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>enabled</th>
                            <th>registered</th>
                            <th>acceptedByEmail</th>
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
                                    <tr key={userInfo.userId} style={{textAlign: "center"}}>
                                        <td><b>{userInfo.userId}</b></td>
                                        <td><b>{userInfo.enabled ? 'Y' : 'N'}</b></td>
                                        <td>{userInfo.registered}</td>
                                        <td><b>{userInfo.isAcceptedByEmail ? 'Y' : 'N'}</b></td>
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
            </MyPaper>
        </>
    )
};

export default Index;
