import Head from 'next/head'
import {NextPage} from "next";
import React from "react";
import useEndpoint from "~/hooks/useEndpoint";
import {UserInfo} from "~/model/UserInfo";
import {CircularProgress} from "@material-ui/core";
import AdminNavBar from "~/components/nav/AdminNavBar";
import {teamRoleData} from "~/enums/TeamRole";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";

function logInAsUser(userId: number) {
    callJsonEndpoint({
        url: '/api/up/server/api/admin/users/logInAsUser',
        method: "post",
        params: {
            userAccId: userId
        }
    }).then(() => EventBus.notifyInfo(`Logged in as user ${userId}`))
}

const Index: NextPage = () => {
    const usedEndpoint = useEndpoint<UserInfo[]>({
        config: {
            url: "/api/up/server/api/user/listAll"
        }
    });

    return (
        <>
            <Head>
                <title>Admin - Users</title>
            </Head>

            <AdminNavBar/>

            {usedEndpoint.pending && <CircularProgress/>}
            {usedEndpoint.error && <p>Couldn't load users :'(</p>}
            {usedEndpoint.data && (
                <table>
                    <tr>
                        <th>ID</th>
                        <th>enabled</th>
                        <th>teamId</th>
                        <th>teamRole</th>
                        <th>nickName</th>
                        <th>firstName</th>
                        <th>lastName</th>
                    </tr>
                    {

                        usedEndpoint.data.map((userInfo: UserInfo) => {
                            return (
                                <tr>
                                    <td>{userInfo.userId}</td>
                                    <td>{userInfo.enabled ? 'true' : 'false'}</td>
                                    <td>{userInfo.teamId}</td>
                                    <td>{teamRoleData[userInfo.teamRole].displayName}</td>
                                    <td>{userInfo.nickName}</td>
                                    <td>{userInfo.firstName}</td>
                                    <td>{userInfo.lastName}</td>
                                    <td>
                                        <button onClick={() => logInAsUser(userInfo.userId)}>Log in as</button>
                                    </td>
                                </tr>
                            );
                        })
                    }
                </table>
            )}

        </>
    )
};

export default Index;
