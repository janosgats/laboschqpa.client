import {
  Avatar,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PersonAddDisabledIcon from '@material-ui/icons/PersonAddDisabled';
import RedoIcon from '@material-ui/icons/Redo';
import SaveIcon from '@material-ui/icons/Save';
import {NextPage} from 'next';
import Head from 'next/head';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {useContext, useEffect, useState} from 'react';
import NotTeamMemberBanner from '~/components/banner/NotTeamMemberBanner';
import Spinner from '~/components/Spinner';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {teamLifecycle_THERE_IS_NO_OTHER_LEADER} from '~/enums/ApiErrors';
import {TeamRole, teamRoleData} from '~/enums/TeamRole';
import ApiErrorDescriptorException from '~/exception/ApiErrorDescriptorException';
import useEndpoint from '~/hooks/useEndpoint';
import {TeamInfo} from '~/model/Team';
import {UserNameContainer} from '~/model/UserInfo';
import callJsonEndpoint from '~/utils/api/callJsonEndpoint';
import EventBus from '~/utils/EventBus';
import UserNameFormatter from '~/utils/UserNameFormatter';

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
      url: '/api/up/server/api/team/info',
      params: {
        id: router.query['id'],
      },
    },
    deps: [router.query['id'], router.isReady],
    enableRequest: router.isReady,
  });

  const isViewedByMemberOrLeaderOfTeam = usedTeamInfo.data && currentUser.isMemberOrLeaderOfTeam(usedTeamInfo.data.id);
  const isViewedByLeaderOfTeam = usedTeamInfo.data && currentUser.isLeaderOfTeam(usedTeamInfo.data.id);

  const usedTeamMembers = useEndpoint<TeamMember[]>({
    conf: {
      url: '/api/up/server/api/team/listMembers',
      params: {
        id: router.query['id'],
      },
    },
    deps: [router.query['id'], router.isReady],
    enableRequest: router.isReady,
    keepOldDataWhileFetchingNew: true,
  });

  const usedTeamApplicants = useEndpoint<TeamMember[]>({
    conf: {
      url: '/api/up/server/api/team/listApplicants',
      params: {
        id: router.query['id'],
      },
    },
    deps: [router.query['id'], router.isReady, isViewedByLeaderOfTeam],
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
    if (!usedTeamInfo.data) {
      EventBus.notifyError('Try refreshing the page', 'Missing team info');
      return;
    }

    callJsonEndpoint({
      conf: {
        url: '/api/up/server/api/team/editTeam',
        method: 'POST',
        data: {
          id: usedTeamInfo.data?.id,
          name: editedTeamName,
        },
      },
    }).then(() => {
      setIsEditing(false);
      usedTeamInfo.reloadEndpoint();
    });
  }

  function submitKick(userId: number) {
    if (!confirm("Kickin'? Are you sure?")) {
      return;
    }

    callJsonEndpoint({
      conf: {
        url: '/api/up/server/api/team/kickFromTeam',
        method: 'POST',
        params: {
          userId: userId,
        },
      },
    })
      .then(() => {
        EventBus.notifySuccess('Member kicked');
        usedTeamMembers.reloadEndpoint();
      })
      .catch((err) => {
        EventBus.notifyError('Error while kicking member');
      });
  }

  function submitGiveLeaderRights(userId: number) {
    callJsonEndpoint({
      conf: {
        url: '/api/up/server/api/team/giveLeaderRights',
        method: 'POST',
        params: {
          userId: userId,
        },
      },
    })
      .then(() => {
        EventBus.notifySuccess('Leader rights given');
        usedTeamMembers.reloadEndpoint();
      })
      .catch((err) => {
        EventBus.notifyError('Error while giving leader rights');
      });
  }

  function submitTakeAwayLeaderRights(userId: number) {
    callJsonEndpoint({
      conf: {
        url: '/api/up/server/api/team/takeAwayLeaderRights',
        method: 'POST',
        params: {
          userId: userId,
        },
      },
    })
      .then(() => {
        EventBus.notifySuccess('Deprived of leader rights');
        usedTeamMembers.reloadEndpoint();
      })
      .catch((err) => {
        EventBus.notifyError('Error while depriving of leader rights');
      });
  }

  function submitApproveApplication(userId: number) {
    callJsonEndpoint({
      conf: {
        url: '/api/up/server/api/team/approveApplicationToTeam',
        method: 'POST',
        params: {
          userId: userId,
        },
      },
    })
      .then(() => {
        EventBus.notifySuccess('Application approved');
        usedTeamApplicants.reloadEndpoint();
        usedTeamMembers.reloadEndpoint();
      })
      .catch((err) => {
        EventBus.notifyError('Error while approving application');
      });
  }

  function submitDeclineApplication(userId: number) {
    callJsonEndpoint({
      conf: {
        url: '/api/up/server/api/team/declineApplicationToTeam',
        method: 'POST',
        params: {
          userId: userId,
        },
      },
    })
      .then(() => {
        EventBus.notifySuccess('Application declined');
        usedTeamApplicants.reloadEndpoint();
      })
      .catch((err) => {
        EventBus.notifyError('Error while declining application');
      });
  }

  function submitResignFromLeadership() {
    callJsonEndpoint({
      conf: {
        url: '/api/up/server/api/team/resignFromLeadership',
        method: 'POST',
      },
    })
      .then(() => {
        EventBus.notifySuccess("You aren't a leader anymore", 'Successfully resigned');
        currentUser.reload();
      })
      .catch((err) => {
        if (err instanceof ApiErrorDescriptorException) {
          if (teamLifecycle_THERE_IS_NO_OTHER_LEADER.is(err.apiErrorDescriptor)) {
            const confirmText =
              'There is no other leader in this team besides you. ' +
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
        url: '/api/up/server/api/team/cancelApplicationToTeam',
        method: 'POST',
      },
    })
      .then(() => {
        EventBus.notifySuccess("You're now free to join or create other teams", 'Application cancelled');
        currentUser.reload();
      })
      .catch((err) => {
        EventBus.notifyError('Error while cancelling application');
      });
  }

  function submitApply() {
    if (!usedTeamInfo.data) {
      EventBus.notifyError('Try refreshing the page', 'Missing team info');
      return;
    }

    callJsonEndpoint({
      conf: {
        url: '/api/up/server/api/team/applyToTeam',
        method: 'POST',
        params: {
          teamId: usedTeamInfo.data.id,
        },
      },
    })
      .then(() => {
        EventBus.notifySuccess('The team leaders should review it soon', 'Application submitted');
        currentUser.reload();
      })
      .catch((err) => {
        EventBus.notifyError('Error while submitting application');
      });
  }

  function submitArchiveAndLeave() {
    callJsonEndpoint({
      conf: {
        url: '/api/up/server/api/team/archiveAndLeaveTeam',
        method: 'POST',
      },
    })
      .then(() => {
        usedTeamInfo.reloadEndpoint();
        usedTeamMembers.reloadEndpoint();
        usedTeamApplicants.reloadEndpoint();
        currentUser.reload();
      })
      .catch((err) => {
        EventBus.notifyError('Error while archiving and leaving team');
      });
  }

  function submitLeave() {
    callJsonEndpoint({
      conf: {
        url: '/api/up/server/api/team/leaveTeam',
        method: 'POST',
      },
    })
      .then(() => {
        currentUser.reload();
      })
      .catch((err) => {
        if (err instanceof ApiErrorDescriptorException) {
          if (teamLifecycle_THERE_IS_NO_OTHER_LEADER.is(err.apiErrorDescriptor)) {
            const confirmText =
              'There is no other leader in this team besides you. ' +
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
    <>
      <Head>
        <title>{usedTeamInfo.data ? usedTeamInfo.data.name + ' ' : 'Qpa '} Team</title>
      </Head>
      <Paper>
        <NotTeamMemberBanner />
        {usedTeamInfo.pending && <Spinner />}

        {usedTeamInfo.data && (
          <Grid container direction="row" alignItems="center">
            {isEditing ? (
              <>
                <TextField
                  variant="outlined"
                  label="Csapatnév"
                  value={editedTeamName}
                  onChange={(e) => setEditedTeamName(e.target.value)}
                />
              </>
            ) : (
              <>
                <Typography variant="h3">{usedTeamInfo.data.name}</Typography>
              </>
            )}

            {usedTeamInfo.data.archived ? <h3>Archive</h3> : null}

            {isViewedByLeaderOfTeam && (
              <>
                {isEditing ? (
                  <>
                    <Tooltip title="Mentés">
                      <IconButton onClick={() => submitEdit()}>
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mégsem">
                      <IconButton onClick={() => setIsEditing(false)}>
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip title="Módosítás">
                    <IconButton onClick={() => setIsEditing(true)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}

            {currentUser.getUserInfo()?.teamRole === TeamRole.NOTHING && !usedTeamInfo.data.archived && (
              <Tooltip title="Csatlakozási kérelem.">
                <IconButton onClick={() => submitApply()}>
                  <PersonAddIcon />
                </IconButton>
              </Tooltip>
            )}

            {isViewedByMemberOrLeaderOfTeam && (
              <Tooltip title="Csapat elhagyása.">
                <IconButton onClick={() => submitLeave()}>
                  <ExitToAppIcon />
                </IconButton>
              </Tooltip>
            )}
            {currentUser.getUserInfo()?.teamId == usedTeamInfo.data.id && currentUser.getUserInfo()?.teamRole === TeamRole.APPLICANT && (
              <Tooltip title="Csatlakozási kérelem visszavonása.">
                <IconButton onClick={() => submitCancelApplication()}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            )}
            {isViewedByLeaderOfTeam && (
              <Tooltip title="Visszalépés mint csapatkapitány.">
                <IconButton onClick={() => submitResignFromLeadership()}>
                  <RedoIcon />
                </IconButton>
              </Tooltip>
            )}
          </Grid>
        )}

        {isViewedByLeaderOfTeam && (
          <>
            <Typography variant="h4">Jelentkezők</Typography>
            {usedTeamApplicants.pending && <Spinner />}

            {usedTeamApplicants.failed && <p>Couldn't load applicants :'(</p>}

            <List component="nav">
              {usedTeamApplicants.data &&
                usedTeamApplicants.data.map((applicant) => {
                  const basicDisplayName = UserNameFormatter.getBasicDisplayName(applicant);
                  return (
                    <ListItem key={applicant.userId}>
                      <Link href={`/users/user/${UserNameFormatter.getUrlName(applicant)}?id=${applicant.userId}`}>
                        <Grid container direction="row" alignItems="center">
                          <ListItemAvatar>
                            <Avatar src={applicant.profilePicUrl} alt={basicDisplayName} />
                          </ListItemAvatar>
                          <ListItemText>{basicDisplayName}</ListItemText>
                        </Grid>
                      </Link>
                      <ListItemSecondaryAction>
                        <Tooltip title="Engedélyez">
                          <IconButton onClick={() => submitApproveApplication(applicant.userId)}>
                            <PersonAddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Elutasít">
                          <IconButton onClick={() => submitDeclineApplication(applicant.userId)}>
                            <PersonAddDisabledIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
            </List>
            <Divider variant="middle" />
          </>
        )}
        {usedTeamMembers.pending && <Spinner />}

        {usedTeamMembers.failed && <p>Couldn't load members :'(</p>}
        <>
          <Typography variant="h4">Tagok</Typography>
          <List component="nav">
            {usedTeamMembers.data &&
              usedTeamMembers.data.map((member, index) => {
                const basicDisplayName = UserNameFormatter.getBasicDisplayName(member);
                return (
                  <ListItem key={member.userId}>
                    <Link href={`/users/user/${UserNameFormatter.getUrlName(member)}?id=${member.userId}`}>
                      <Grid container direction="row" alignItems="center">
                        <ListItemAvatar>
                          <Avatar src={member.profilePicUrl} alt={basicDisplayName} />
                        </ListItemAvatar>
                        <ListItemText>
                          {basicDisplayName +
                            (member.teamRole === TeamRole.LEADER ? ` (${teamRoleData[member.teamRole].displayName})` : ' ')}
                        </ListItemText>
                      </Grid>
                    </Link>
                    {isViewedByLeaderOfTeam && member.userId !== currentUser.getUserInfo()?.userId && (
                      <ListItemSecondaryAction>
                        <Tooltip title="Kirugás">
                          <IconButton onClick={() => submitKick(member.userId)}>
                            <MeetingRoomIcon />
                          </IconButton>
                        </Tooltip>
                        {member.teamRole === TeamRole.MEMBER && (
                          <Tooltip title="Kinevezés csapatkapitánnyá">
                            <IconButton onClick={() => submitGiveLeaderRights(member.userId)}>
                              <ArrowUpwardIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {member.teamRole === TeamRole.LEADER && (
                          <Tooltip title="Inasba rakni">
                            <IconButton onClick={() => submitTakeAwayLeaderRights(member.userId)}>
                              <ArrowDownwardIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                );
              })}
          </List>
        </>
      </Paper>
    </>
  );
};

export default Index;
