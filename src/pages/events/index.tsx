import {Button, Container, Table, TableCell, TableHead, TableRow, Typography} from '@material-ui/core';
import {NextPage} from 'next';
import Head from 'next/head';
import React, {useContext, useState} from 'react';
import NotTeamMemberBanner from '~/components/banner/NotTeamMemberBanner';
import MyPaper from '~/components/mui/MyPaper';
import Spinner from '~/components/Spinner';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {EventTarget} from '~/enums/EventTarget';
import useEndpoint from '~/hooks/useEndpoint';
import callJsonEndpoint from '~/utils/api/callJsonEndpoint';
import {isValidNumber} from '~/utils/CommonValidators';
import DateTimeFormatter from '~/utils/DateTimeFormatter';
import EventBus from '~/utils/EventBus';
import ContactFormDialog, {ContactInfo} from './ContactFormDialog';

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

    async function register(event: EventForUser, contact?: ContactInfo): Promise<void> {
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
            },
        }).then(() => {
            EventBus.notifySuccess('Sikeres jelentkezés');
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
            },
        }).then(() => {
            EventBus.notifySuccess('Sikeres leadás');
            if (event.target === EventTarget.PERSONAL) {
                usedPersonalEvents.reloadEndpoint();
            } else if (event.target === EventTarget.TEAM) {
                usedTeamEvents.reloadEndpoint();
            }
        });
    }

    const [contactInfoNeededFor, setContactInfoNeededFor] = useState<EventForUser>(null);

    return (
        <Container maxWidth="lg">
            <Head>
                <title>Események</title>
            </Head>

            {contactInfoNeededFor && (
                <ContactFormDialog
                    onSuccess={(contact) => {
                        setContactInfoNeededFor(null);
                        register(contactInfoNeededFor, contact);
                    }}
                    onClose={() => setContactInfoNeededFor(null)}
                />
            )}

            <MyPaper>
                <Typography variant="h4">Jelentkezés egyéni eseményekre</Typography>
            </MyPaper>
            <br />
            {usedPersonalEvents.pending && <Spinner />}
            {usedPersonalEvents.failed && <p>Couldn't load personal events :'(</p>}
            {usedPersonalEvents.data && (
                <MyPaper>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Esemény</TableCell>
                                <TableCell>Max létszám</TableCell>
                                <TableCell>Jelentkezési határidő</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        {usedPersonalEvents.data.map((event: PersonalEventForUser, index) => {
                            return (
                                <TableRow>
                                    <TableCell>{event.name}</TableCell>
                                    <TableCell>{isValidNumber(event.registrationLimit) ? event.registrationLimit : '-'}</TableCell>
                                    <TableCell>{DateTimeFormatter.toFullBasic(event.registrationDeadline)}</TableCell>
                                    <TableCell>
                                        {event.isUserRegistered ? (
                                            <Button variant="contained" color="secondary" onClick={() => deRegister(event)}>
                                                Jelentkezés törlése
                                            </Button>
                                        ) : (
                                            <Button variant="contained" color="primary" onClick={() => register(event)}>
                                                Egyéni jelentkezés
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </Table>
                </MyPaper>
            )}

            <br />
            <br />
            <MyPaper>
                <Typography variant="h4">Jelentkezés csapatos eseményekre</Typography>
            </MyPaper>
            <br />
            <NotTeamMemberBanner />
            {currentUser.isMemberOrLeaderOfAnyTeam() && (
                <>
                    {usedTeamEvents.pending && <Spinner />}
                    {usedTeamEvents.failed && <p>Couldn't load team events :'(</p>}
                    {usedTeamEvents.data && (
                        <MyPaper>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Esemény</TableCell>
                                        <TableCell>Max létszám</TableCell>
                                        <TableCell>Jelentkezési határidő</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                {usedTeamEvents.data.map((event: TeamEventForUser, index) => {
                                    return (
                                        <TableRow>
                                            <TableCell>{event.name}</TableCell>
                                            <TableCell>{isValidNumber(event.registrationLimit) ? event.registrationLimit : '-'}</TableCell>
                                            <TableCell>{DateTimeFormatter.toFullBasic(event.registrationDeadline)}</TableCell>
                                            <TableCell>
                                                {currentUser.isLeaderOfAnyTeam() && (
                                                    <>
                                                        {event.isTeamRegistered ? (
                                                            <Button variant="contained" color="secondary" onClick={() => deRegister(event)}>
                                                                Jelentkezés törlése
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                onClick={() => setContactInfoNeededFor(event)}
                                                            >
                                                                Csapatos jelentkezés
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </Table>
                        </MyPaper>
                    )}
                </>
            )}
        </Container>
    );
};

export default Index;
