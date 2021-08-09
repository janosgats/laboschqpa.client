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
import ApiErrorDescriptorException from "~/exception/ApiErrorDescriptorException";
import {teamLifecycle_THERE_IS_NO_OTHER_LEADER} from "~/enums/ApiErrors";
import NotTeamMemberBanner from "~/components/banner/NotTeamMemberBanner";

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

    const isViewedByMemberOrLeaderOfTeam = usedTeamInfo.data && currentUser.isMemberOrLeaderOfTeam(usedTeamInfo.data.id);
    const isViewedByLeaderOfTeam = usedTeamInfo.data && currentUser.isLeaderOfTeam(usedTeamInfo.data.id);

    const usedTeamMembers = useEndpoint<TeamMember[]>({
        conf: {
            url: "/api/up/server/api/team/listMembers",
            params: {
                id: router.query["id"]
            }
        },
        deps: [router.query["id"], router.isReady],
        enableRequest: router.isReady,
        keepOldDataWhileFetchingNew: true,
    });

    const usedTeamApplicants = useEndpoint<TeamMember[]>({
        conf: {
            url: "/api/up/server/api/team/listApplicants",
            params: {
                id: router.query["id"]
            }
        },
        deps: [router.query["id"], router.isReady, isViewedByLeaderOfTeam],
        enableRequest: router.isReady && isViewedByLeaderOfTeam,
        keepOldDataWhileFetchingNew: true,
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
            EventBus.notifyError('Try refreshing the page', 'Missing team info');
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

    function submitKick(userId: number) {
        if (!confirm("Kickin'? Are you sure?")) {
            return;
        }

        callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/team/kickFromTeam",
                method: "POST",
                params: {
                    userId: userId
                }
            }
        }).then(() => {
            EventBus.notifySuccess('Member kicked');
            usedTeamMembers.reloadEndpoint();
        }).catch(err => {
            EventBus.notifyError('Error while kicking member');
        });
    }

    function submitGiveLeaderRights(userId: number) {
        callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/team/giveLeaderRights",
                method: "POST",
                params: {
                    userId: userId
                }
            }
        }).then(() => {
            EventBus.notifySuccess('Leader rights given');
            usedTeamMembers.reloadEndpoint();
        }).catch(err => {
            EventBus.notifyError('Error while giving leader rights');
        });
    }

    function submitTakeAwayLeaderRights(userId: number) {
        callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/team/takeAwayLeaderRights",
                method: "POST",
                params: {
                    userId: userId
                }
            }
        }).then(() => {
            EventBus.notifySuccess('Deprived of leader rights');
            usedTeamMembers.reloadEndpoint();
        }).catch(err => {
            EventBus.notifyError('Error while depriving of leader rights');
        });
    }

    function submitApproveApplication(userId: number) {
        callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/team/approveApplicationToTeam",
                method: "POST",
                params: {
                    userId: userId
                }
            }
        }).then(() => {
            EventBus.notifySuccess('Application approved');
            usedTeamApplicants.reloadEndpoint();
            usedTeamMembers.reloadEndpoint();
        }).catch(err => {
            EventBus.notifyError('Error while approving application');
        });
    }

    function submitDeclineApplication(userId: number) {
        callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/team/declineApplicationToTeam",
                method: "POST",
                params: {
                    userId: userId
                }
            }
        }).then(() => {
            EventBus.notifySuccess('Application declined');
            usedTeamApplicants.reloadEndpoint();
        }).catch(err => {
            EventBus.notifyError('Error while declining application');
        });
    }

    function submitResignFromLeadership() {
        callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/team/resignFromLeadership",
                method: "POST",
            }
        }).then(() => {
            EventBus.notifySuccess("You aren't a leader anymore", 'Successfully resigned')
            currentUser.reload();
        }).catch(err => {
            if (err instanceof ApiErrorDescriptorException) {
                if (teamLifecycle_THERE_IS_NO_OTHER_LEADER.is(err.apiErrorDescriptor)) {
                    const confirmText = 'There is no other leader in this team besides you. ' +
                        'You can either give someone else leader rights and then resign, or you can leave and archive this team right now. \n' +
                        'Do you want to archive this team (and kick every member)?';
                    if (confirm(confirmText)) {
                        submitArchiveAndLeave();
                    }
                    return;
                }
            }
            EventBus.notifyError('Error while leaving team');
            EventBus.notifyError('Error while archiving and leaving team');
        });
    }

    function submitCancelApplication() {
        callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/team/cancelApplicationToTeam",
                method: "POST",
            }
        }).then(() => {
            EventBus.notifySuccess("You're now free to join or create other teams", 'Application cancelled')
            currentUser.reload();
        }).catch(err => {
            EventBus.notifyError('Error while cancelling application');
        });
    }

    function submitApply() {
        if (!(usedTeamInfo.data)) {
            EventBus.notifyError('Try refreshing the page', 'Missing team info');
            return;
        }

        callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/team/applyToTeam",
                method: "POST",
                params: {
                    teamId: usedTeamInfo.data.id,
                }
            }
        }).then(() => {
            EventBus.notifySuccess('The team leaders should review it soon', 'Application submitted')
            currentUser.reload();
        }).catch(err => {
            EventBus.notifyError('Error while submitting application');
        });
    }

    function submitArchiveAndLeave() {
        callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/team/archiveAndLeaveTeam",
                method: "POST",
            }
        }).then(() => {
            usedTeamInfo.reloadEndpoint();
            usedTeamMembers.reloadEndpoint();
            usedTeamApplicants.reloadEndpoint();
            currentUser.reload();
        }).catch(err => {
            EventBus.notifyError('Error while archiving and leaving team');
        });
    }

    function submitLeave() {
        callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/team/leaveTeam",
                method: "POST",
            }
        }).then(() => {
            currentUser.reload();
        }).catch(err => {
            if (err instanceof ApiErrorDescriptorException) {
                if (teamLifecycle_THERE_IS_NO_OTHER_LEADER.is(err.apiErrorDescriptor)) {
                    const confirmText = 'There is no other leader in this team besides you. ' +
                        'You can either give someone else leader rights and then leave, or you can leave and archive this team right now. \n' +
                        'Do you want to archive this team (and kick every member)?';
                    if (confirm(confirmText)) {
                        submitArchiveAndLeave();
                    }
                    return;
                }
            }
            EventBus.notifyError('Error while leaving team');
        });
    }

    return (
        <div>
            <Head>
                <title>{usedTeamInfo.data ? usedTeamInfo.data.name + ' ' : 'Qpa '} Team</title>
            </Head>

            <NotTeamMemberBanner/>

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

                        {usedTeamInfo.data.archived ? <h3>Archive</h3> : null}

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

                        {currentUser.getUserInfo()?.teamRole === TeamRole.NOTHING && !usedTeamInfo.data.archived && (
                            <button onClick={() => submitApply()}>Join team</button>
                        )}

                        {isViewedByMemberOrLeaderOfTeam && (
                            <button onClick={() => submitLeave()}>Leave team</button>
                        )}
                        {currentUser.getUserInfo()?.teamId == usedTeamInfo.data.id
                        && currentUser.getUserInfo()?.teamRole === TeamRole.APPLICANT && (
                            <button onClick={() => submitCancelApplication()}>Cancel application</button>
                        )}
                        {isViewedByLeaderOfTeam && (
                            <button onClick={() => submitResignFromLeadership()}>Resign from leadership</button>
                        )}
                    </div>
                )
            }

            {isViewedByLeaderOfTeam && (
                <>
                    <h2>Applicants</h2>
                    {usedTeamApplicants.pending && (
                        <p>Pending...</p>
                    )}

                    {usedTeamApplicants.failed && (
                        <p>Couldn't load applicants :'(</p>
                    )}

                    {usedTeamApplicants.data && (
                        usedTeamApplicants.data.map(applicant => {
                            const basicDisplayName = UserNameFormatter.getBasicDisplayName(applicant);
                            return (
                                <div key={applicant.userId}>
                                    <Link
                                        href={`/users/user/${UserNameFormatter.getUrlName(applicant)}?id=${applicant.userId}`}>
                                        <a>
                                            <span>{basicDisplayName} (Applicant)</span>
                                            <img src={applicant.profilePicUrl} alt={basicDisplayName}/>
                                        </a>
                                    </Link>
                                    <button onClick={() => submitApproveApplication(applicant.userId)}>Approve</button>
                                    <button onClick={() => submitDeclineApplication(applicant.userId)}>Decline</button>
                                </div>
                            );
                        })
                    )}
                </>
            )}

            <h2>Members</h2>
            {usedTeamMembers.pending && (
                <p>Pending...</p>
            )}

            {usedTeamMembers.failed && (
                <p>Couldn't load members :'(</p>
            )}

            {usedTeamMembers.data &&
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
                            {isViewedByLeaderOfTeam && member.userId !== currentUser.getUserInfo()?.userId && (
                                <>
                                    <button onClick={() => submitKick(member.userId)}>Kick</button>
                                    {member.teamRole === TeamRole.MEMBER && (
                                        <button onClick={() => submitGiveLeaderRights(member.userId)}>
                                            Give leader rights
                                        </button>
                                    )}
                                    {member.teamRole === TeamRole.LEADER && (
                                        <button onClick={() => submitTakeAwayLeaderRights(member.userId)}>
                                            Take away leader rights
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    );
                }
            )}
        </div>
    )
};

export default Index;
