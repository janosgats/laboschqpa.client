import Head from 'next/head'
import {NextPage} from "next";
import React from "react";
import useEndpoint from "~/hooks/useEndpoint";
import Link from "next/link";
import {useRouter} from "next/router";
import {TeamRole, teamRoleData} from "~/enums/TeamRole";
import UserNameFormatter from "~/utils/UserNameFormatter";
import {UserNameContainer} from "~/model/UserInfo";
import {TeamInfo} from "~/model/Team";

interface TeamMember extends UserNameContainer {
    userId: number;
    profilePicUrl: string;
    teamRole: number;
}

const Index: NextPage = () => {
    const router = useRouter();

    const usedTeamInfo = useEndpoint<TeamInfo>({
        config: {
            url: "/api/up/server/api/team/info",
            params: {
                id: router.query["id"]
            }
        },
        deps: [router.query["id"], router.isReady],
        enableRequest: router.isReady
    });

    const usedTeamMembers = useEndpoint<TeamMember[]>({
        config: {
            url: "/api/up/server/api/team/listMembers",
            params: {
                id: router.query["id"]
            }
        },
        deps: [router.query["id"], router.isReady],
        enableRequest: router.isReady
    });

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
                        <h2>{usedTeamInfo.data.name}</h2>
                        {usedTeamInfo.data.archived ? <h3>Archived</h3> : null}
                    </div>
                )
            }

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
