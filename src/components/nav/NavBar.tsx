import React, {FC, useContext, useState} from "react";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Authority} from "~/enums/Authority";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import {useRouter} from "next/router";
import {
    AppBar,
    Button,
    createStyles,
    Divider,
    Drawer,
    Hidden,
    Icon,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    makeStyles,
    Switch,
    Theme,
    Toolbar,
    Typography,
    useTheme
} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import Link from "next/link";


interface LinkParams {
    href: string,
    displayName: string,
    authority: Authority,
    icon: string,
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
    }),
);

interface NavBarInterFaceProps {
    darkMode: boolean,
    setDarkMode: (value: boolean) => void,
    window?: () => Window;
}


const NavBar: FC<NavBarInterFaceProps> = (props) => {
    const { darkMode: darkMode, setDarkMode: setDarkMode, window: window } = props;
    const router = useRouter();
    const currentUser = useContext(CurrentUserContext);

    const classes = useStyles();
    const theme = useTheme();

    function doLogout() {
        callJsonEndpoint({
            conf: {
                url: "/api/up/server/logout",
                method: "POST"
            }
        }).then(res => {
            currentUser.setLoggedInState(false);
            EventBus.notifyInfo("You just logged out", "See you soon")
            router.push("/");
        }).catch((reason) => {
            //TODO: more messages based on the ApiErrorDescriptor
            EventBus.notifyError("Please try again", "We cannot log you out :/")
        });
    }


    const Links: LinkParams[] = [
        { href: "/", displayName: "Home", authority: Authority.User, icon: 'home' },
        { href: `/users/user/Me/?id=${currentUser.getUserInfo() ? currentUser.getUserInfo().userId : ''}`, displayName: "My Profile", authority: Authority.User, icon: 'person' },
        { href: "/teams", displayName: "Teams", authority: Authority.User, icon: 'group' },
        { href: "/users", displayName: "Users", authority: Authority.User, icon: 'people' },
        { href: "/news", displayName: "News", authority: Authority.User, icon: 'feed' },
        { href: "/events", displayName: "Események", authority: Authority.User, icon: 'book_online' },
        { href: "/objectives", displayName: "Objectives", authority: Authority.User, icon: 'assignment' },
        { href: "/submissions", displayName: "Submissions", authority: Authority.User, icon: 'assignment_turned_in' },
        { href: "/speedDrinking", displayName: "Speed Drinking", authority: Authority.User, icon: 'sports_bar' },
        { href: "/riddles", displayName: "Riddles", authority: Authority.User, icon: 'quiz' },
        { href: "/riddleEditor", displayName: "Riddle Editor", authority: Authority.RiddleEditor, icon: 'mode' },
        { href: "/acceptedEmails", displayName: "Accepted Emails", authority: Authority.AcceptedEmailEditor, icon: 'mark_email_read' },
        { href: "/admin", displayName: "Admin", authority: Authority.Admin, icon: 'admin_panel_settings' },
    ]

    const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();

    const drawer = (
        <div>
            <div className={classes.toolbar} />
            <Divider />
            <List>
                {Links.map((link: LinkParams, index: number) => {
                    return currentUser.hasAuthority(link.authority) ? (
                        <Link
                            key={"link" + link.displayName + index}
                            href={link.href}
                        >
                            <ListItem button key={link.displayName + index} >
                                <ListItemIcon> <Icon fontSize='small'>{link.icon}</Icon> </ListItemIcon>
                                <ListItemText primary={link.displayName} />
                            </ListItem>
                        </Link>
                    )
                        :
                        null
                }
                )
                }
            </List>
        </div>
    )

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleDrawerToggle = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const container = window !== undefined ? () => window().document.body : undefined;
    
    return (
        <div className={classes.root}>
            <AppBar
                position="fixed"
                color="inherit"
                className={classes.appBar}
            >
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
                    <Typography
                        variant="h5"
                        noWrap
                        className={classes.title}
                    >
                        QPA 2021
                    </Typography>
                    <Switch checked={darkMode} onChange={() => { setDarkMode(!darkMode) }} />
                    <Button color="inherit" onClick={() => doLogout()}>Logout</Button>
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
                <div>
                    {props.children}
                </div>
            </main>
        </div>
    )
};

export default NavBar;
