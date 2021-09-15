import {
    Button,
    ButtonGroup,
    createStyles,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    makeStyles,
    TextField,
    Theme,
} from '@material-ui/core';
import {Alert, AlertTitle} from '@material-ui/lab';
import {useRouter} from 'next/router';
import React, {FC, useContext, useEffect, useState} from 'react';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {teamLifecycle_YOU_ARE_ALREADY_MEMBER_OR_APPLICANT_OF_A_TEAM} from '~/enums/ApiErrors';
import {TeamRole} from '~/enums/TeamRole';
import ApiErrorDescriptorException from '~/exception/ApiErrorDescriptorException';
import {TeamInfo} from '~/model/Team';
import callJsonEndpoint from '~/utils/api/callJsonEndpoint';
import EventBus from '~/utils/EventBus';
import {style} from './styles/style';

interface CreateNewTeamDialogProps {
    onClose: () => void;
    isOpen: boolean;
}

const useStyles = makeStyles((theme: Theme) => createStyles(style));

const CreateNewTeamDialog: FC<CreateNewTeamDialogProps> = (props) => {
    const router = useRouter();
    const currentUser = useContext(CurrentUserContext);

    const [teamName, setTeamName] = useState<string>('');
    const [isCreatingNewTeamPending, setIsCreatingNewTeamPending] = useState<boolean>(false);

    useEffect(() => {
        if (props.isOpen) {
            setTeamName('');
        }
    }, [props.isOpen]);

    function createNewTeam() {
        setIsCreatingNewTeamPending(true);
        callJsonEndpoint<TeamInfo>({
            conf: {
                url: '/api/up/server/api/team/createNewTeam',
                method: 'POST',
                data: {
                    name: teamName,
                },
            },
        })
            .then((res) => {
                currentUser.reload();
                EventBus.notifySuccess("You've just created a team");
                router.push(`/teams/team/My/?id=${res.data.id}`);
                props.onClose();
            })
            .catch((err) => {
                if (err instanceof ApiErrorDescriptorException) {
                    if (teamLifecycle_YOU_ARE_ALREADY_MEMBER_OR_APPLICANT_OF_A_TEAM.is(err.apiErrorDescriptor)) {
                        EventBus.notifyWarning(
                            'You have to leave your current team (or cancel your application) to create a new one',
                            'You are already in a team'
                        );
                        return;
                    }
                }
            })
            .finally(() => {
                setIsCreatingNewTeamPending(false);
            });
    }

    return (
        <Dialog open={props.isOpen} onClose={props.onClose} aria-labelledby="form-dialog-title">
            <DialogTitle>Create Team</DialogTitle>
            <DialogContent>
                <DialogContent>
                    <DialogContentText>
                        To create a team you have to give a name to your team. After your team is created you will be the lead of that team.
                    </DialogContentText>
                    <TextField autoFocus label="Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                </DialogContent>
            </DialogContent>
            <DialogActions>
                <Button onClick={createNewTeam} color="primary" disabled={isCreatingNewTeamPending || !teamName || teamName.length < 3}>
                    Create my team
                </Button>
                <Button onClick={props.onClose} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const NotTeamMemberBanner: FC = () => {
    const classes = useStyles();
    const router = useRouter();
    const currentUser = useContext(CurrentUserContext);

    const [isCreateNewTeamDialogOpen, setIsCreateNewTeamDialogOpen] = useState<boolean>(false);

    const displayBanner = currentUser.getUserInfo() && !currentUser.isMemberOrLeaderOfAnyTeam();
    const isApplicant = currentUser.getUserInfo() && currentUser.getUserInfo().teamRole === TeamRole.APPLICANT;

    if (!displayBanner) {
        return <></>;
    }

    if (isApplicant) {
        return (
            <Grid item>
                <Alert variant="outlined" severity="info">
                    <AlertTitle>You applied for a membership at {currentUser.getUserInfo()?.teamName}</AlertTitle>
                    <p>- the leaders of the team should review your application soon</p>
                    <ButtonGroup size="large" color="inherit" aria-label="large outlined primary button group">
                        <Button onClick={() => router.push(`/teams/team/My?id=${currentUser.getUserInfo()?.teamId}`)}>
                            Check out {currentUser.getUserInfo()?.teamName}
                        </Button>
                    </ButtonGroup>
                </Alert>
                <CreateNewTeamDialog onClose={() => setIsCreateNewTeamDialogOpen(false)} isOpen={isCreateNewTeamDialogOpen} />
            </Grid>
        );
    }

    return (
        <Grid item>
            <Alert variant="outlined" severity="info">
                <AlertTitle>You are not a team member</AlertTitle>
                <p>- which makes a few features unavailable for your solo self :/</p>
                <ButtonGroup size="large" color="inherit" aria-label="large outlined primary button group">
                    <Button onClick={() => router.push('/teams')}>Join a team</Button>
                    <Button onClick={() => setIsCreateNewTeamDialogOpen(true)}>Create new team</Button>
                </ButtonGroup>
            </Alert>
            <CreateNewTeamDialog onClose={() => setIsCreateNewTeamDialogOpen(false)} isOpen={isCreateNewTeamDialogOpen} />
        </Grid>
    );
};

export default NotTeamMemberBanner;
