import React, { FC, useContext, useRef, useState } from 'react';
import { CurrentUserContext } from '~/context/CurrentUserProvider';
import { Authority } from '~/enums/Authority';
import callJsonEndpoint from '~/utils/api/callJsonEndpoint';
import EventBus from '~/utils/EventBus';
import { useRouter } from 'next/router';
import {
    AppBar,
    Button,
    createStyles,
    Divider,
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
    Popper,
    Switch,
    Theme,
    Toolbar,
    Typography,
    useTheme,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Link from 'next/link';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import MyPaper from '../mui/MyPaper';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

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
        darkModeSwithcer: {
            cursor: 'pointer',
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
    links.push({ href: myProfileUrl, displayName: 'Profilom', authority: Authority.User, icon: 'person', });
    if (currentUser.isMemberOrLeaderOrApplicantOfAnyTeam()) {
        const myTeamUrl = `/teams/team/MyTeam/?id=${currentUser.getUserInfo() ? currentUser.getUserInfo().teamId : ''}`;
        links.push({ href: myTeamUrl, displayName: 'Csapatom', authority: Authority.User, icon: 'groups', });
    }
    links.push({ href: '/programs', displayName: 'Programok', authority: Authority.User, icon: 'emoji_events' });
    links.push({ href: '/events', displayName: 'Esem??nyek', authority: Authority.User, icon: 'book_online' });
    links.push({ hidden: true, href: '/qrFight', displayName: 'QR Fight', authority: Authority.User, icon: 'qr_code' });
    links.push({ hidden: true, href: '/riddles', displayName: 'Riddle', authority: Authority.User, icon: 'quiz' });
    links.push({ href: '/speedDrinking', displayName: 'S??rm??r??s', authority: Authority.User, icon: 'sports_bar' });
    links.push({ href: '/news', displayName: 'H??rek', authority: Authority.User, icon: 'feed' });
    links.push({ href: '/submissions', displayName: 'Bead??sok', authority: Authority.User, icon: 'assignment_turned_in' });
    links.push({ href: '/objectives', displayName: 'Feladatok', authority: Authority.User, icon: 'assignment' });
    links.push({ href: '/teams', displayName: 'Csapatok', authority: Authority.User, icon: 'group' });
    links.push({ href: '/users', displayName: 'Felhaszn??l??k', authority: Authority.User, icon: 'people' });

    links.push({ href: '/riddleEditor', displayName: 'Riddle Editor', authority: Authority.RiddleEditor, icon: 'mode' });
    links.push({ href: '/acceptedEmails', displayName: 'Accepted Emails', authority: Authority.AcceptedEmailEditor, icon: 'mark_email_read', });
    links.push({ href: '/admin', displayName: 'Admin', authority: Authority.Admin, icon: 'admin_panel_settings' });

    const drawer = (
        <div>
            <div className={classes.toolbar} />
            <Divider />
            <List>
                {links
                    .filter(link => !link.hidden)
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
                    <Typography variant="h5" noWrap className={classes.title}>
                        49. Aki m??snak vermet ??s SCH QPA
                    </Typography>
                    <Hidden smDown implementation="css">
                        <Grid
                            container
                            direction="row"
                            alignItems="center"
                        >

                            <Grid item >

                                <Icon
                                    className={classes.darkModeSwithcer}
                                    fontSize="default"
                                    color={!darkMode ? 'error' : 'disabled'}
                                >
                                    {'wb_sunny'}
                                </Icon>
                            </Grid>
                            <Grid item >

                                <Switch
                                    checked={darkMode}
                                    onChange={() => {
                                        setDarkMode(!darkMode);
                                    }}
                                />
                            </Grid>
                            <Grid item >

                                <Icon
                                    className={classes.darkModeSwithcer}
                                    fontSize="default"
                                    color={darkMode ? 'primary' : 'disabled'}
                                >
                                    {'nights_stay'}

                                </Icon>
                            </Grid>
                            <Grid item >

                                <Button color="inherit" onClick={() => doLogout()}>
                                    Kijelentkez??s
                                </Button>
                            </Grid>

                        </Grid>
                    </Hidden>
                    <Hidden mdUp implementation="css">
                        <Popper
                            open={popoverOpen}
                            placement="bottom-end"
                            anchorEl={popperRef.current}
                            transition

                        >
                            <MyPaper
                                opacity={1}
                            >
                                <Grid
                                    container
                                    direction="column"
                                    alignItems="center"
                                >
                                    <Grid
                                        item
                                    >
                                        <Grid
                                            container
                                            direction="row"
                                            alignItems="center"
                                        >
                                            <Grid item >
                                                <Icon
                                                    className={classes.darkModeSwithcer}
                                                    fontSize="default"
                                                    color={!darkMode ? 'error' : 'disabled'}
                                                >
                                                    {'wb_sunny'}
                                                </Icon>
                                            </Grid>
                                            <Grid item >

                                                <Switch
                                                    checked={darkMode}
                                                    onChange={() => {
                                                        setDarkMode(!darkMode);
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item >
                                                <Icon
                                                    className={classes.darkModeSwithcer}
                                                    fontSize="default"
                                                    color={darkMode ? 'primary' : 'disabled'}
                                                >
                                                    {'nights_stay'}

                                                </Icon>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid item >

                                        <Button color="inherit" onClick={() => doLogout()}>
                                            Kijelentkez??s
                                        </Button>
                                    </Grid>

                                </Grid>

                            </MyPaper>
                        </Popper>
                        <IconButton
                            ref={popperRef}
                            onClick={() => setPopoverOpen(p => !p)}
                        >
                            {popoverOpen ? (<ExpandLessIcon />) : (<ExpandMoreIcon />)}
                        </IconButton>
                    </Hidden>
                </Toolbar>
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
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <div>{props.children}</div>
            </main>
        </div>
    );
};

export default NavBar;
