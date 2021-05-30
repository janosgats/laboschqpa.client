import Head from 'next/head'
import {NextPage} from "next";
import React, {useContext, useEffect, useState} from "react";
import useEndpoint from "~/hooks/useEndpoint";
import Link from "next/link";
import {useRouter} from "next/router";
import {TeamRole, teamRoleData} from "~/enums/TeamRole";
import UserNameFormatter from "~/utils/UserNameFormatter";
import {UserNameContainer} from "~/model/UserInfo";
import {TeamInfo} from "~/model/Team";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";

interface TeamMember extends UserNameContainer {
    userId: number;
    profilePicUrl: string;
    teamRole: number;
}

const Index: NextPage = () => {
    const router = useRouter();
    const currentUser = useContext(CurrentUserContext);

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedTeamName, setEditedTeamName] = useState<string>();

    const usedTeamInfo = useEndpoint<TeamInfo>({
        conf: {
            url: "/api/up/server/api/team/info",
            params: {
                id: router.query["id"]
            }
        },
        deps: [router.query["id"], router.isReady],
        enableRequest: router.isReady
    });

    const usedTeamMembers = useEndpoint<TeamMember[]>({
        conf: {
            url: "/api/up/server/api/team/listMembers",
            params: {
                id: router.query["id"]
            }
        },
        deps: [router.query["id"], router.isReady],
        enableRequest: router.isReady
    });

    useEffect(() => {
        if (!isEditing) {
            return;
        }
        if (usedTeamInfo.data?.name) {
            setEditedTeamName(usedTeamInfo.data.name);
        }
    }, [isEditing, usedTeamInfo.data?.name]);

    function submitEdit() {
        if (!(usedTeamInfo.data)) {
            EventBus.notifyError('Cannot edit team');
            return;
        }

        callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/team/editTeam",
                method: "POST",
                data: {
                    id: usedTeamInfo.data?.id,
                    name: editedTeamName,
                }
            }
        }).then(() => {
            setIsEditing(false);
            usedTeamInfo.reloadEndpoint();
        })
    }

    const isViewedByLeaderOfTeam = usedTeamInfo.data && currentUser.isMemberOrLeaderOfTeam(usedTeamInfo.data.id);

    return (
        <div>
            <Head>
                <title>{usedTeamInfo.data ? usedTeamInfo.data.name + ' ' : 'Qpa '} Team</title>
            </Head>

            {
                usedTeamInfo.pending && (
                    <p>Pending...</p>
                )
            }

            {
                usedTeamInfo.data && (
                    <div>

                        {isEditing ? (
                            <>
                                <input value={editedTeamName} onChange={e => setEditedTeamName(e.target.value)}/>
                            </>
                        ) : (
                            <>
                                <h2>{usedTeamInfo.data.name}</h2>
                            </>
                        )}

                        {usedTeamInfo.data.archived ? <h3>Archived</h3> : null}

                        {isViewedByLeaderOfTeam && (
                            <>
                                {isEditing ? (
                                    <>
                                        <button onClick={() => submitEdit()}>Save</button>
                                        <button onClick={() => setIsEditing(false)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setIsEditing(true)}>Edit Team</button>
                                    </>
                                )}

                            </>
                        )}
                    </div>
                )
            }

            <h2>Members</h2>
            {
                usedTeamMembers.pending && (
                    <p>Pending...</p>
                )
            }

            {
                usedTeamMembers.error && (
                    <p>Couldn't load members :'(</p>
                )
            }

            {
                usedTeamMembers.data &&
                usedTeamMembers.data.map((member, index) => {
                    const basicDisplayName = UserNameFormatter.getBasicDisplayName(member);
                    return (
                        <div key={member.userId}>
                            <Link
                                href={`/users/user/${UserNameFormatter.getUrlName(member)}?id=${member.userId}`}>
                                <a>
                                    <span>{
                                        basicDisplayName
                                        + (member.teamRole === TeamRole.LEADER
                                            ? ` (${teamRoleData[member.teamRole].displayName})`
                                            : ' ')
                                    }
                                    </span>
                                    <img src={member.profilePicUrl} alt={basicDisplayName}/>
                                </a>
                            </Link>
                        </div>
                    );
                })
            }
        </div>
    )
};

export default Index;
