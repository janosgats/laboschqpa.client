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
import MyPaper from '../mui/MyPaper';
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
            <DialogTitle>Probléma megoldása</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Hogy megbizonyosodjunk arról, hogy tényleg Qpázó vagy, megkértük a csapatkapitányokat arra, hogy adják le tagjaik email
                    címét.
                </DialogContentText>
                <DialogContentText>
                    Kérdezd meg a csk-d, leadta-e már az email címed. Ha igen, de más e-maillel regisztráltál itt könnyedén hozzáadhatod a
                    fiókodhoz. Ha még nem, a Csk még mindig leadhatja nekünk.
                </DialogContentText>
                <DialogContentText style={{marginBottom: 0}}>
                    <Typography variant="h6">A jelenleg fiókodhoz rendelt e-mail címeid:</Typography>
                </DialogContentText>
                <EmailAddressesPanel hideAddNewAddressButton={true} overrides={{ul: {marginTop: 0}}} />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onSubmitNewAddressClicked} color="primary">
                    Új e-mail cím hozzáadása
                </Button>

                <Button onClick={props.onClose} color="secondary">
                    Bezárás
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
            <MyPaper p={0}>
                <Alert variant="outlined" severity="warning">
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
            </MyPaper>
        </Grid>
    );
};

export default NotAcceptedByEmailBanner;
