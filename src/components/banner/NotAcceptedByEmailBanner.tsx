import React, {FC, useContext, useState} from "react";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Alert, AlertTitle} from '@material-ui/lab';
import {Button, ButtonGroup, Dialog, DialogActions, DialogContent} from "@material-ui/core";
import {AddNewEmailAddressDialog} from "~/components/email/AddNewEmailAddressDialog";

interface AskYourTeamLeadForHelpDialogProps {
    onClose: () => void;
    onSubmitNewAddressClicked: () => void;
    isOpen: boolean;
}

const AskYourTeamLeadForHelpDialog: FC<AskYourTeamLeadForHelpDialogProps> = (props) => {
    return (
        <Dialog open={props.isOpen} onClose={props.onClose}>
            <DialogContent>
                <p>
                    To make sure you are really a QPA participant, we asked the Team Leads
                    to send us the e-mail addresses of people in their team.
                </p>
                <p>
                    Go ahead, reach out to your Team Lead and ask if your e-mail address was submitted!
                    If yes, you can easily add it to your account below, if it's not the same as your SSO e-mail.
                </p>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onSubmitNewAddressClicked}
                        color="primary">
                    Add new e-mail address
                </Button>

                <Button onClick={props.onClose} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const NotAcceptedByEmailBanner: FC = () => {
    const currentUser = useContext(CurrentUserContext);

    const [isAddNewEmailDialogOpen, setAddNewEmailDialogOpen] = useState<boolean>(false);
    const [isAskYourTeamLeadDialogOpen, setAskYourTeamLeadDialogOpen] = useState<boolean>(false);

    const displayBanner = currentUser.getUserInfo() && !currentUser.getUserInfo().isAcceptedByEmail;

    if (!displayBanner) {
        return <></>;
    }

    return (
        <Alert severity="warning">
            <AlertTitle>You don't own any accepted e-mail addresses</AlertTitle>
            <p>- which makes you unable to see submissions of other users :/</p>
            <ButtonGroup variant="outlined" color="primary" aria-label="outlined primary button group">
                <Button onClick={() => setAddNewEmailDialogOpen(true)}>
                    Connect an accepted address to your account
                </Button>
                <Button onClick={() => setAskYourTeamLeadDialogOpen(true)}>
                    Ask your Team Lead for help
                </Button>
            </ButtonGroup>

            <AddNewEmailAddressDialog onClose={() => setAddNewEmailDialogOpen(false)} isOpen={isAddNewEmailDialogOpen}/>
            <AskYourTeamLeadForHelpDialog onClose={() => setAskYourTeamLeadDialogOpen(false)}
                                          isOpen={isAskYourTeamLeadDialogOpen}
                                          onSubmitNewAddressClicked={() => {
                                              setAskYourTeamLeadDialogOpen(false);
                                              setAddNewEmailDialogOpen(true);
                                          }}
            />
        </Alert>
    )
};

export default NotAcceptedByEmailBanner;
