import {Button, Container, Grid} from '@material-ui/core';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import {NextPage} from 'next';
import Head from 'next/head';
import React, {useContext, useState} from 'react';
import {ProgramDisplayContainer} from '~/components/fetchableDisplay/FetchableDisplayContainer';
import MyPaper from '~/components/mui/MyPaper';
import DayProgramsDisplay from '~/components/program/DayProgramsDisplay';
import Spinner from '~/components/Spinner';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {Authority} from '~/enums/Authority';
import useEndpoint from '~/hooks/useEndpoint';
import {Program} from '~/model/usergeneratedcontent/Program';
import TimeSpan from '~/utils/TimeSpan';

const Index: NextPage = () => {
    const currentUser = useContext(CurrentUserContext);

    const [wasCreateNewProgramClicked, setWasCreateNewProgramClicked] = useState<boolean>(false);

    const usedEndpoint = useEndpoint<Program[]>({
        conf: {
            url: '/api/up/server/api/program/listAll',
        },
    });

    return (
        <Container maxWidth="lg">
            <Head>
                <title>Programok</title>
            </Head>
            <Grid container spacing={6} direction="column" justifyContent="flex-end" wrap="nowrap">
                {!wasCreateNewProgramClicked && currentUser.hasAuthority(Authority.ProgramEditor) && (
                    <Grid item>
                        <MyPaper>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="large"
                                endIcon={<AddCircleOutlineOutlinedIcon />}
                                onClick={() => setWasCreateNewProgramClicked(true)}
                            >
                                Új program
                            </Button>
                        </MyPaper>
                    </Grid>
                )}

                {wasCreateNewProgramClicked && (
                    <Grid item>
                        <MyPaper>
                            <ProgramDisplayContainer
                                shouldCreateNew={true}
                                onCancelledNewCreation={() => setWasCreateNewProgramClicked(false)}
                            />
                        </MyPaper>
                    </Grid>
                )}

                {usedEndpoint.pending && (
                    <MyPaper>
                        <Spinner />{' '}
                    </MyPaper>
                )}

                {usedEndpoint.failed && (
                    <MyPaper>
                        <p>Couldn't load programs :'(</p>
                        <button
                            onClick={() => {
                                usedEndpoint.reloadEndpoint();
                            }}
                        >
                            Retry
                        </button>
                    </MyPaper>
                )}

                {usedEndpoint.succeeded &&
                    TimeSpan.asDate(TimeSpan.range('2021-09-20T00:00:00', 14, TimeSpan.day)).map((date, i) => (
                        <Grid item>
                            <DayProgramsDisplay key={i} programs={usedEndpoint.data} date={date} />
                        </Grid>
                    ))}
            </Grid>
        </Container>
    );
};

export default Index;
