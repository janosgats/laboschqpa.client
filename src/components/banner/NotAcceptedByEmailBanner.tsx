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
    Theme,
    Typography,
    useTheme,
} from '@material-ui/core';
import {Alert, AlertTitle} from '@material-ui/lab';
import React, {FC, useContext, useState} from 'react';
import {AddNewEmailAddressDialog} from '~/components/email/AddNewEmailAddressDialog';
import EmailAddressesPanel from '~/components/email/EmailAddressesPanel';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {style} from './styles/style';

interface AskYourTeamLeadForHelpDialogProps {
    onClose: () => void;
    onSubmitNewAddressClicked: () => void;
    isOpen: boolean;
}

const useStyles = makeStyles((theme: Theme) => createStyles(style));

const AskYourTeamLeadForHelpDialog: FC<AskYourTeamLeadForHelpDialogProps> = (props) => {
    return (
        <Dialog open={props.isOpen} onClose={props.onClose}>
            <DialogTitle>Resolve email issues</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To make sure you are really a QPA participant, we asked the Team Leads to send us the e-mail addresses of the people in
                    their team.
                </DialogContentText>
                <DialogContentText>
                    Go ahead, reach out to your Team Lead and ask if your e-mail address was submitted! If yes, you can easily add it to
                    your account by clicking the below button. If not, your Team Lead can still submit it.
                </DialogContentText>
                <DialogContentText style={{marginBottom: 0}}>
                    <Typography variant="h6">Your current e-mail addresses:</Typography>
                </DialogContentText>
                <EmailAddressesPanel hideAddNewAddressButton={true} overrides={{ul: {marginTop: 0}}} />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onSubmitNewAddressClicked} color="primary">
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
    const classes = useStyles();
    const currentUser = useContext(CurrentUserContext);
    const theme = useTheme();

    const [isAddNewEmailDialogOpen, setAddNewEmailDialogOpen] = useState<boolean>(false);
    const [isAskYourTeamLeadDialogOpen, setAskYourTeamLeadDialogOpen] = useState<boolean>(false);

    const displayBanner = currentUser.getUserInfo() && !currentUser.getUserInfo().isAcceptedByEmail;

    if (!displayBanner) {
        return <></>;
    }

    return (
        <Grid item>
            <Alert variant="outlined" severity="warning" style={{backgroundColor: theme.palette.background.paper}}>
                <AlertTitle>You don't own any accepted e-mail addresses</AlertTitle>
                <p>- which makes you unable to see submissions of other users :/</p>
                <ButtonGroup color="inherit" aria-label="outlined primary button group">
                    <Button onClick={() => setAskYourTeamLeadDialogOpen(true)}>Click here to fix this</Button>
                </ButtonGroup>

                <AddNewEmailAddressDialog onClose={() => setAddNewEmailDialogOpen(false)} isOpen={isAddNewEmailDialogOpen} />
                <AskYourTeamLeadForHelpDialog
                    onClose={() => setAskYourTeamLeadDialogOpen(false)}
                    isOpen={isAskYourTeamLeadDialogOpen}
                    onSubmitNewAddressClicked={() => {
                        setAskYourTeamLeadDialogOpen(false);
                        setAddNewEmailDialogOpen(true);
                    }}
                />
            </Alert>
        </Grid>
    );
};

export default NotAcceptedByEmailBanner;
