import React, { FC, useContext, useRef, useState } from 'react';
import { CurrentUserContext } from '~/context/CurrentUserProvider';
import { Authority } from '~/enums/Authority';
import callJsonEndpoint from '~/utils/api/callJsonEndpoint';
import EventBus from '~/utils/EventBus';
import { useRouter } from 'next/router';
import {
    AppBar,
    Box,
    createStyles,
    Drawer,
    Grid,
    Hidden,
    Icon,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    makeStyles,
    Paper,
    Theme,
    Toolbar,
    Typography,
    useTheme,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Link from 'next/link';
import ThemeSelector from '~/components/nav/ThemeSelector';
import { Height } from '@material-ui/icons';
import MyPaper from '../mui/MyPaper';

interface LinkParams {
    href: string;
    displayName: string;
    authority: Authority;
    icon: string;
    hidden?: boolean;
}

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
        },
        title: {
            flexGrow: 1,
        },
        drawer: {
            [theme.breakpoints.up('sm')]: {
                width: drawerWidth,
                flexShrink: 0,
            },
        },
        appBar: {
            [theme.breakpoints.up('sm')]: {
                width: `calc(100% - ${drawerWidth}px)`,
                marginLeft: drawerWidth,
            },
        },
        menuButton: {
            marginRight: theme.spacing(2),
            [theme.breakpoints.up('sm')]: {
                display: 'none',
            },
        },
        toolbar: theme.mixins.toolbar,
        drawerPaper: {
            width: drawerWidth,
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
        },
        darkModeSwitcher: {
            cursor: 'pointer',
        },
        footer: {
            position: 'relative',
            left: '0',
            bottom: '0',
            width: '100%',
            zIndex: 2000,
        },
        footerContainer: {
        },
        footerLogo: {
            padding: '8px 32px',
            height: '60px',
        },
    })
);

interface NavBarInterFaceProps {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
    window?: () => Window;
}

const NavBar: FC<NavBarInterFaceProps> = (props) => {
    const { darkMode: darkMode, setDarkMode: setDarkMode, window: window } = props;
    const router = useRouter();
    const currentUser = useContext(CurrentUserContext);

    const popperRef = useRef(null);
    const [popoverOpen, setPopoverOpen] = useState(false);

    const classes = useStyles();
    const theme = useTheme();

    let footerBaseUrl = 'https://laboschqpa-public.s3.pl-waw.scw.cloud/static/frontend/sponsors/logos/';

    function doLogout() {
        callJsonEndpoint({
            conf: {
                url: '/api/up/server/logout',
                method: 'POST',
            },
        })
            .then((res) => {
                currentUser.setLoggedInState(false);
                EventBus.notifyInfo('You just logged out', 'See you soon');
                router.push('/');
            })
            .catch((reason) => {
                //TODO: more messages based on the ApiErrorDescriptor
                EventBus.notifyError('Please try again', 'We cannot log you out :/');
            });
    }

    const links: LinkParams[] = [];
    links.push({ href: '/', displayName: 'HQ', authority: Authority.User, icon: 'home' });
    const myProfileUrl = `/users/user/Me/?id=${currentUser.getUserInfo() ? currentUser.getUserInfo().userId : ''}`;
    links.push({ href: myProfileUrl, displayName: 'Profilom', authority: Authority.User, icon: 'person' });
    if (currentUser.isMemberOrLeaderOrApplicantOfAnyTeam()) {
        const myTeamUrl = `/teams/team/MyTeam/?id=${currentUser.getUserInfo() ? currentUser.getUserInfo().teamId : ''}`;
        links.push({ href: myTeamUrl, displayName: 'Csapatom', authority: Authority.User, icon: 'groups' });
    }
    links.push({ href: '/programs', displayName: 'Programok', authority: Authority.User, icon: 'emoji_events' });
    links.push({ href: '/events', displayName: 'Események', authority: Authority.User, icon: 'book_online' });
    links.push({ hidden: true, href: '/qrFight', displayName: 'QR Fight', authority: Authority.User, icon: 'qr_code' });
    links.push({ hidden: true, href: '/riddles', displayName: 'Riddle', authority: Authority.User, icon: 'quiz' });
    links.push({ href: '/speedDrinking', displayName: 'Sörmérés', authority: Authority.User, icon: 'sports_bar' });
    links.push({ href: '/news', displayName: 'Hírek', authority: Authority.User, icon: 'feed' });
    links.push({ href: '/submissions', displayName: 'Beadások', authority: Authority.User, icon: 'assignment_turned_in' });
    links.push({ href: '/objectives', displayName: 'Feladatok', authority: Authority.User, icon: 'assignment' });
    links.push({ href: '/teams', displayName: 'Csapatok', authority: Authority.User, icon: 'group' });
    links.push({ href: '/users', displayName: 'Felhasználók', authority: Authority.User, icon: 'people' });

    links.push({ href: '/riddleEditor', displayName: 'Riddle Editor', authority: Authority.RiddleEditor, icon: 'mode' });
    links.push({
        href: '/acceptedEmails',
        displayName: 'Accepted Emails',
        authority: Authority.AcceptedEmailEditor,
        icon: 'mark_email_read',
    });
    links.push({ href: '/admin', displayName: 'Admin', authority: Authority.Admin, icon: 'admin_panel_settings' });

    const drawer = (
        <div>
            <div />
            <List>
                <ListItem>
                    <ThemeSelector darkMode={darkMode} setDarkMode={setDarkMode} />
                </ListItem>

                {links
                    .filter((link) => !link.hidden)
                    .map((link: LinkParams, index: number) => {
                        return currentUser.hasAuthority(link.authority) ? (
                            <Link key={'link' + link.displayName + index} href={link.href}>
                                <ListItem button key={link.displayName + index}>
                                    <ListItemIcon>
                                        {' '}
                                        <Icon fontSize="small">{link.icon}</Icon>{' '}
                                    </ListItemIcon>
                                    <ListItemText primary={link.displayName} />
                                </ListItem>
                            </Link>
                        ) : null;
                    })}
            </List>
        </div>
    );

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleDrawerToggle = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <div className={classes.root}>
            <AppBar position="fixed" color="inherit" className={classes.appBar}>
                <Hidden smUp implementation="css">
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            className={classes.menuButton}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Toolbar>
                </Hidden>
            </AppBar>
            <nav className={classes.drawer} aria-label="mailbox folders">
                <Hidden smUp implementation="css">
                    <Drawer
                        container={container}
                        variant="temporary"
                        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                        open={isDrawerOpen}
                        onClose={handleDrawerToggle}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true,
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden xsDown implementation="css">
                    <Drawer
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        variant="permanent"
                        open
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
            </nav>
            <Grid
                container
                direction="column"
            >
                <Grid
                    item
                >

                    <main className={classes.content}>
                        <Hidden smUp implementation="css">
                            <div className={classes.toolbar} />
                        </Hidden>
                        <div>{props.children}</div>
                    </main>
                </Grid>
                <Grid
                    item
                >
                    <Paper className={classes.footer}>
                        <Grid
                            container
                            direction="row"
                            justify="space-evenly"
                            alignItems="center"
                        >

                            <Grid
                                className={classes.footerContainer}
                                item
                            >
                                <Grid
                                    container
                                    direction="column"
                                    alignItems="center"
                                >
                                    <Typography variant="subtitle1"><b>Főtámogatónk:</b></Typography>
                                    <img className={classes.footerLogo} src={footerBaseUrl + 'snapsoft.svg'} />
                                </Grid>
                            </Grid>

                            <Grid
                                className={classes.footerContainer}
                                item
                            >
                                <Grid
                                    container
                                    direction="column"
                                    alignItems="center"
                                    justify="center"
                                >
                                    <Typography variant="subtitle1"><b>Kiemelt támogatóink:</b></Typography>
                                    <Grid
                                        container
                                        justify="center"
                                        alignItems="center"
                                    >
                                        
                                        <img className={classes.footerLogo} src={footerBaseUrl + 'mol.png'} />
                                        <img className={classes.footerLogo} src={footerBaseUrl + 'mol_limo.svg'} />
                                        <img className={classes.footerLogo} src={footerBaseUrl + 'nova_services.png'} />
                                        <img className={classes.footerLogo} src={footerBaseUrl + 'sci-network.png'} />
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid
                                className={classes.footerContainer}
                                item
                            >
                                <Grid
                                    container
                                    direction="column"
                                    alignItems="center"
                                >
                                    <Typography variant="subtitle1"><b>Támogatóink:</b></Typography>
                                    <Grid
                                        direction="row"
                                    >
                                        <img className={classes.footerLogo} src={footerBaseUrl + 'sch_isiszovi.svg'} />
                                        <img className={classes.footerLogo} src={footerBaseUrl + 'AK.svg'} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>

                    </Paper>
                </Grid>

            </Grid>
        </div>
    );
};

export default NavBar;
