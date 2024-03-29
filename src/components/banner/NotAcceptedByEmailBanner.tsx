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
import useCurrentUser from "~/hooks/useCurrentUser";
import {TeamRole} from "~/enums/TeamRole";

interface AskYourTeamLeadForHelpDialogProps {
    onClose: () => void;
    onSubmitNewAddressClicked: () => void;
    isOpen: boolean;
}

const useStyles = makeStyles((theme: Theme) => createStyles(style));

const AskYourTeamLeadForHelpDialog: FC<AskYourTeamLeadForHelpDialogProps> = (props) => {
    const currentUser = useCurrentUser();

    return (
        <Dialog open={props.isOpen} onClose={props.onClose}>
            <DialogTitle>Probléma megoldása</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Hogy megbizonyosodjunk arról, tényleg Qpázó vagy-e, megkértük a csapatkapitányokat, hogy adják le csapatuk tagjainak
                    email címeit.
                </DialogContentText>
                <DialogContentText>
                    Kérdezd meg a csk-d, leadta-e már az email címed. Ha igen, de más e-maillel regisztráltál, a lenti gombbal könnyedén
                    hozzáadhatod a fiókodhoz. Ha még nem, a CSK még mindig leadhatja nekünk.
                </DialogContentText>
                {currentUser.getUserInfo()?.teamRole === TeamRole.LEADER && (
                    <Alert variant="outlined" style={{borderRadius: '1rem'}} severity="info">
                        <p>Mivel CSK vagy, kérjük, küldd el a csapatod tagjainak e-mail címeit a <a
                            href="mailto:schociqpa@gmail.com">schociqpa@gmail.com</a> címre,
                            akár egyszerre, akár több részletben!</p>
                    </Alert>
                )}
                {true || currentUser.getUserInfo()?.teamRole === TeamRole.APPLICANT || currentUser.getUserInfo()?.teamRole === TeamRole.MEMBER && (
                    <Alert variant="outlined" style={{borderRadius: '1rem'}} severity="info">
                        <p>Esetleg említsd meg a CSK-dnak, hogy, küldje el a csapatod tagjainak e-mail címeit a <a
                            href="mailto:schociqpa@gmail.com">schociqpa@gmail.com</a> címre,
                            akár egyszerre, akár több részletben!</p>
                    </Alert>
                )}
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
            <MyPaper p={0} borderRadius={'1rem'}>
                <Alert variant="outlined" style={{borderRadius: '1rem'}} severity="warning">
                    <AlertTitle>Nincs még egyetlen elfogadott e-mail címed sem</AlertTitle>
                    <p>- ezért nem láthatod a többi csapat beadásait :/</p>
                    <ButtonGroup color="inherit" aria-label="outlined primary button group">
                        <Button onClick={() => setAskYourTeamLeadDialogOpen(true)}>Kattints ide, hogy megoldd a problémát</Button>
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
                    <br/>
                    <br/>
                    <AlertTitle style={{color: 'skyblue'}}>
                        Update: <b>Lepattanó e-mailek fixálva</b>. Már tényleg tudsz új címeket felvenni.
                    </AlertTitle>
                </Alert>
            </MyPaper>
        </Grid>
    );
};

export default NotAcceptedByEmailBanner;
