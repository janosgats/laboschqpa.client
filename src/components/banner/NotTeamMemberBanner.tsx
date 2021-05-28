import React, {FC, useContext} from "react";
import {useRouter} from "next/router";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Alert, AlertTitle} from '@material-ui/lab';
import {Button, ButtonGroup} from "@material-ui/core";

const NotTeamMemberBanner: FC = () => {
    const router = useRouter();
    const currentUser = useContext(CurrentUserContext);

    const displayBanner = currentUser.getUserInfo() && !currentUser.isMemberOrLeaderOfAnyTeam();

    if (!displayBanner) {
        return <></>;
    }

    return (
        <Alert severity="info">
            <AlertTitle>You are not a team member</AlertTitle>
            <p>- which makes a few features unavailable for your solo self :/</p>
            <ButtonGroup variant="outlined" color="primary" aria-label="outlined primary button group">
                <Button onClick={() => router.push('/teams')}>Join a team</Button>
                <Button onClick={() => alert('TODO: create team action')}>Create new team</Button>
            </ButtonGroup>
        </Alert>
    )
};

export default NotTeamMemberBanner;
