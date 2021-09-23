import {
    Avatar,
    Container,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    TextField,
    Tooltip,
    Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import {NextPage} from 'next';
import Head from 'next/head';
import {useRouter} from 'next/router';
import React, {FC, useContext, useState} from 'react';
import EmailAddressesPanel from '~/components/email/EmailAddressesPanel';
import LoginForm from '~/components/join/LoginForm';
import MyPaper from '~/components/mui/MyPaper';
import Responsive from '~/components/Responsive';
import Spinner from '~/components/Spinner';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {Authority} from '~/enums/Authority';
import useEndpoint from '~/hooks/useEndpoint';
import {UserInfo} from '~/model/UserInfo';
import callJsonEndpoint from '~/utils/api/callJsonEndpoint';
import EventBus from '~/utils/EventBus';
import UserNameFormatter from '~/utils/UserNameFormatter';

const Index: NextPage = () => {
    const router = useRouter();
    const currentUser = useContext(CurrentUserContext);

    const [userInfoEditorOpen, setUserInfoEditorOpen] = useState<boolean>(false);

    const usedEndpoint = useEndpoint<UserInfo>({
        conf: {
            url: '/api/up/server/api/user/infoWithAuthorities',
            params: {
                id: router.query['id'],
            },
        },
        deps: [router.query['id'], router.isReady],
        enableRequest: router.isReady,
    });
    const userInfo: UserInfo = usedEndpoint.data;

    function submitEditedUserInfo(userNamesDto: UserNamesDto) {
        callJsonEndpoint<void>({
            conf: {
                url: '/api/up/server/api/user/setInfo',
                method: 'POST',
                data: {
                    userId: usedEndpoint.data.userId,
                    firstName: userNamesDto.firstName,
                    lastName: userNamesDto.lastName,
                    nickName: userNamesDto.nickName,
                },
            },
        })
            .then((resp) => {
                setUserInfoEditorOpen(false);
                usedEndpoint.reloadEndpoint();
                currentUser.reload();
            })
            .catch(() => {
                EventBus.notifyError('Error while editing your profile', "Couldn't save your changes");
            });
    }

    const isViewingOwnProfile: boolean = !!(userInfo && userInfo.userId === currentUser?.getUserInfo()?.userId);

    return (
        <Container maxWidth="lg">
            <Head>
                <title>{UserNameFormatter.getBasicDisplayName(userInfo, 'Qpa')} User</title>
            </Head>
            {usedEndpoint.pending && <Spinner />}
            {usedEndpoint.failed && <p>Couldn't load user :'(</p>}
            {userInfo && (
                <MyPaper>
                    <Grid container direction="column" alignItems="stretch" spacing={3}>
                        <Grid item container justify="flex-start" alignItems="center" spacing={2}>
                            {!userInfoEditorOpen && (
                                <>
                                    <Grid item>
                                        <Avatar src={userInfo.profilePicUrl} alt={UserNameFormatter.getBasicDisplayName(userInfo)} />
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="h3">
                                            {UserNameFormatter.getNickName(userInfo) !== 'N/A' &&
                                            UserNameFormatter.getNickName(userInfo) !== null
                                                ? UserNameFormatter.getNickName(userInfo)
                                                : null}{' '}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="h4">{UserNameFormatter.getFullName(userInfo)}</Typography>
                                    </Grid>
                                    {isViewingOwnProfile && (
                                        <Grid>
                                            <Tooltip title="Adatok módosítása" arrow>
                                                <IconButton onClick={() => setUserInfoEditorOpen(true)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Grid>
                                    )}
                                </>
                            )}
                        </Grid>
                        {isViewingOwnProfile && userInfoEditorOpen && (
                            <>
                                <Grid item>
                                    <Typography variant="h4">Adatok módosítása</Typography>
                                </Grid>
                                <Grid item>
                                    <UserInfoEditor
                                        defaultNames={{
                                            firstName: userInfo.firstName,
                                            lastName: userInfo.lastName,
                                            nickName: userInfo.nickName,
                                        }}
                                        onSubmit={submitEditedUserInfo}
                                        onCancel={() => setUserInfoEditorOpen(false)}
                                    />
                                </Grid>
                            </>
                        )}
                        {isViewingOwnProfile && (
                            <>
                                <Grid item>
                                    <Typography variant="h5">Használatban lévő email címek:</Typography>
                                    <EmailAddressesPanel />
                                </Grid>
                                <Grid>
                                    <LoginForm addLoginMethod={true} />
                                </Grid>
                            </>
                        )}
                        {currentUser.getUserInfo() && currentUser.getUserInfo().authorities.includes(Authority.Admin) && (
                            <Grid item>
                                <Typography variant="h5">Jogosultságok: </Typography>
                                <List>
                                    {userInfo.authorities.map((value) => (
                                        <>
                                            <ListItem key={value}>
                                                <ListItemText primary={value} />
                                            </ListItem>
                                            <Divider variant="middle" />
                                        </>
                                    ))}
                                </List>
                            </Grid>
                        )}
                    </Grid>
                </MyPaper>
            )}
        </Container>
    );
};

interface UserNamesDto {
    firstName: string;
    lastName: string;
    nickName: string;
}

interface UserNamesEditorProps {
    defaultNames: UserNamesDto;
    onSubmit: (newNames: UserNamesDto) => void;
    onCancel: () => void;
}

const UserInfoEditor: FC<UserNamesEditorProps> = ({defaultNames, onSubmit, onCancel}) => {
    const [firstName, setFirstName] = useState<string>(defaultNames.firstName);
    const [lastName, setLastName] = useState<string>(defaultNames.lastName);
    const [nickName, setNickName] = useState<string>(defaultNames.nickName);

    function composeUserNamesDto() {
        return {
            firstName: firstName,
            lastName: lastName,
            nickName: nickName,
        };
    }

    return (
        <Grid container direction="row" alignItems="center" spacing={2}>
            <Grid item md={3} xs={12}>
                <TextField
                    fullWidth
                    variant="outlined"
                    id="firstNameInputBox"
                    label="Keresztnév"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
            </Grid>
            <Grid item md={3} xs={12}>
                <TextField
                    fullWidth
                    variant="outlined"
                    id="firstNameInputBox"
                    label="Vezetéknév"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
            </Grid>
            <Grid item md={3} xs={12}>
                <TextField
                    fullWidth
                    variant="outlined"
                    id="firstNameInputBox"
                    label="Becenév"
                    value={nickName}
                    onChange={(e) => setNickName(e.target.value)}
                />
            </Grid>
            <Grid item md={3} xs={12}>
                <Responsive component={Grid} container direction="row" justifyContent="flex-end" __md={{justifyContent: 'flex-start'}}>
                    <Tooltip title="Mentés">
                        <IconButton onClick={() => onSubmit(composeUserNamesDto())}>
                            <SaveIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Mégsem">
                        <IconButton onClick={() => onCancel()}>
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </Responsive>
            </Grid>
        </Grid>
    );
};

export default Index;
