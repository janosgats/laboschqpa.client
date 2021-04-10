import Head from 'next/head'
import {NextPage} from "next";
import React from "react";
import 'react-notifications/lib/notifications.css';
import useEndpoint from "~/hooks/useEndpoint";
import Link from "next/link";
import {useRouter} from "next/router";
import {isValidNonEmptyString} from "~/utils/CommonValidators";
import {TeamRole, teamRoleData} from "~/enums/TeamRole";

interface TeamInfo {
    id: number;
    name: string;
    archived: boolean;
}

interface TeamMember {
    userId: number;
    firstName: string;
    lastName: string;
    nickName: string;
    profilePicUrl: string;
    teamRole: number;
}

function getMemberDisplayName(member: TeamMember): string {
    if (!member) {
        return "N/A";
    }

    if (isValidNonEmptyString(member.nickName)
        && (isValidNonEmptyString(member.firstName) || isValidNonEmptyString(member.lastName))) {
        return member.nickName + " - " + member.firstName + " " + member.lastName;
    }

    if (isValidNonEmptyString(member.nickName)) {
        return member.nickName;
    }
    if (isValidNonEmptyString(member.firstName) || isValidNonEmptyString(member.lastName)) {
        return member.firstName + " " + member.lastName;
    }
    return "N/A";
}

//TODO: Replace with MUi
const Index: NextPage = () => {
    const router = useRouter();

    const [teamInfo, errorTeamInfo, pendingTeamInfo] = useEndpoint<TeamInfo>({
        config: {
            url: "/api/up/server/api/team/info",
            params: {
                id: router.query["id"]
            }
        },
        deps: [router.query["id"], router.isReady],
        enableRequest: router.isReady
    });

    const [teamMembers, errorTeamMembers, pendingTeamMembers] = useEndpoint<TeamMember[]>({
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
                <title>{teamInfo ? teamInfo.name + ' ' : 'Qpa '} Team</title>
            </Head>

            {
                pendingTeamInfo && (
                    <p>Pending...</p>
                )
            }

            {
                teamInfo && (
                    <div>
                        <h2>{teamInfo.name}</h2>
                        {teamInfo.archived ? <h3>Archived</h3> : null}
                    </div>
                )
            }

            {
                pendingTeamMembers && (
                    <p>Pending...</p>
                )
            }

            {
                errorTeamMembers && (
                    <p>Couldn't load members :'(</p>
                )
            }

            {
                teamMembers &&
                teamMembers.map((member, index) => {
                    return (
                        <div>
                            <Link key={member.userId}
                                  href={`/users/user/${member.firstName}_${member.lastName}_${member.nickName}?id=${member.userId}`}>
                                <a>
                                    <span>{
                                        getMemberDisplayName(member)
                                        + (member.teamRole === TeamRole.LEADER
                                            ? ` (${teamRoleData[member.teamRole].displayName})`
                                            : ' ')
                                    }
                                    </span>
                                    <img src={member.profilePicUrl} alt={getMemberDisplayName(member)}/>
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
