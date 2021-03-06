import {Button, Container, Table, TableCell, TableContainer, TableHead, TableRow, Typography} from '@material-ui/core';
import {NextPage} from 'next';
import Head from 'next/head';
import React, {useContext} from 'react';
import NotTeamMemberBanner from '~/components/banner/NotTeamMemberBanner';
import MyPaper from '~/components/mui/MyPaper';
import Spinner from '~/components/Spinner';
import useEndpoint from '~/hooks/useEndpoint';
import {EventTarget} from "~/enums/EventTarget";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import DateTimeFormatter from "~/utils/DateTimeFormatter";
import {isValidNumber} from "~/utils/CommonValidators";

interface EventForUser {
    id: number;
    name: string;
    target: EventTarget;
    registrationLimit: number;
    registrationDeadline: string | Date;
}

interface PersonalEventForUser extends EventForUser {
    isUserRegistered: boolean;
}

interface TeamEventForUser extends EventForUser {
    isTeamRegistered: boolean;
}

const Index: NextPage = () => {
    const currentUser = useContext(CurrentUserContext);

    const usedPersonalEvents = useEndpoint<PersonalEventForUser[]>({
        conf: {
            url: '/api/up/server/api/event/listPersonalEventsForUser',
        },
        keepOldDataWhileFetchingNew: true,
    });

    const usedTeamEvents = useEndpoint<TeamEventForUser[]>({
        conf: {
            url: '/api/up/server/api/event/listTeamEventsForUser',
        },
        keepOldDataWhileFetchingNew: true,
        enableRequest: currentUser.isMemberOrLeaderOfAnyTeam(),
    });

    async function register(event: EventForUser): Promise<void> {
        let url = null;
        if (event.target === EventTarget.PERSONAL) {
            url = '/api/up/server/api/event/registration/personal/register';
        } else if (event.target === EventTarget.TEAM) {
            url = '/api/up/server/api/event/registration/team/register';
        }

        return callJsonEndpoint({
            conf: {
                url: url,
                method: 'post',
                params: {
                    eventId: event.id,
                },
            }
        }).then(() => {
            EventBus.notifySuccess('Sikeres jelentkez??s');
            if (event.target === EventTarget.PERSONAL) {
                usedPersonalEvents.reloadEndpoint();
            } else if (event.target === EventTarget.TEAM) {
                usedTeamEvents.reloadEndpoint();
            }
        });
    }

    async function deRegister(event: EventForUser): Promise<void> {
        let url = null;
        if (event.target === EventTarget.PERSONAL) {
            url = '/api/up/server/api/event/registration/personal/deRegister';
        } else if (event.target === EventTarget.TEAM) {
            url = '/api/up/server/api/event/registration/team/deRegister';
        }

        return callJsonEndpoint({
            conf: {
                url: url,
                method: 'post',
                params: {
                    eventId: event.id,
                },
            }
        }).then(() => {
            EventBus.notifySuccess('Sikeres lead??s');
            if (event.target === EventTarget.PERSONAL) {
                usedPersonalEvents.reloadEndpoint();
            } else if (event.target === EventTarget.TEAM) {
                usedTeamEvents.reloadEndpoint();
            }
        });
    }

    return (
        <Container maxWidth="lg" >
            <Head>
                <title>Esem??nyek</title>
            </Head>

            <MyPaper>
                <Typography variant="h4">Jelentkez??s egy??ni esem??nyekre</Typography>
            </MyPaper>
            <br/>
            {usedPersonalEvents.pending && <Spinner/>}
            {usedPersonalEvents.failed && <p>Couldn't load personal events :'(</p>}
            {usedPersonalEvents.data && (
                <TableContainer
                    component={MyPaper}
                    style={{ maxWidth:"calc(100vw - 25vw)", overflow:"auto"}}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Esem??ny</TableCell>
                                <TableCell>Max l??tsz??m</TableCell>
                                <TableCell>Jelentkez??si hat??rid??</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        {usedPersonalEvents.data.map((event: PersonalEventForUser, index) => {
                            return (
                                <TableRow>
                                    <TableCell>{event.name}</TableCell>
                                    <TableCell>{isValidNumber(event.registrationLimit) ? event.registrationLimit : "-"}</TableCell>
                                    <TableCell>{DateTimeFormatter.toFullBasic(event.registrationDeadline)}</TableCell>
                                    <TableCell>
                                        {event.isUserRegistered ? (
                                            <Button variant="contained" color="secondary"
                                                    onClick={() => deRegister(event)}>
                                                Jelentkez??s t??rl??se
                                            </Button>
                                        ) : (
                                            <Button variant="contained" color="primary" onClick={() => register(event)}>
                                                Egy??ni jelentkez??s
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </Table>
                </TableContainer>
            )}

            <br/>
            <br/>
            <MyPaper>
                <Typography variant="h4">Jelentkez??s csapatos esem??nyekre</Typography>
            </MyPaper>
            <br/>
            <NotTeamMemberBanner/>
            {currentUser.isMemberOrLeaderOfAnyTeam() && (
                <>
                    {usedTeamEvents.pending && <Spinner/>}
                    {usedTeamEvents.failed && <p>Couldn't load team events :'(</p>}
                    {usedTeamEvents.data && (
                        <TableContainer
                        component={MyPaper}
                        style={{maxWidth:"calc(100vw - 25vw)", overflow:"auto"}}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Esem??ny</TableCell>
                                        <TableCell>Max l??tsz??m</TableCell>
                                        <TableCell>Jelentkez??si hat??rid??</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                {usedTeamEvents.data.map((event: TeamEventForUser, index) => {
                                    return (
                                        <TableRow>
                                            <TableCell>{event.name}</TableCell>
                                            <TableCell>{isValidNumber(event.registrationLimit) ? event.registrationLimit : "-"}</TableCell>
                                            <TableCell>{DateTimeFormatter.toFullBasic(event.registrationDeadline)}</TableCell>
                                            <TableCell>
                                                {currentUser.isLeaderOfAnyTeam() && (
                                                    <>
                                                        {event.isTeamRegistered ? (
                                                            <Button variant="contained" color="secondary"
                                                                    onClick={() => deRegister(event)}>
                                                                Jelentkez??s t??rl??se
                                                            </Button>
                                                        ) : (
                                                            <Button variant="contained" color="primary"
                                                                    onClick={() => register(event)}>
                                                                Csapatos jelentkez??s
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </Table>
                        </TableContainer>
                    )}
                </>
            )}
        </Container>
    );
};

export default Index;
