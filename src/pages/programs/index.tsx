import { Button, Container, Grid } from '@material-ui/core';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import { NextPage } from 'next';
import Head from 'next/head';
import React, { useContext, useState } from 'react';
import { ProgramDisplayContainer } from '~/components/fetchableDisplay/FetchableDisplayContainer';
import MyPaper from '~/components/mui/MyPaper';
import ProgramCalendar from '~/components/program/ProgramCalendar';
import { CurrentUserContext } from '~/context/CurrentUserProvider';
import { Authority } from '~/enums/Authority';

const Index: NextPage = () => {
    const currentUser = useContext(CurrentUserContext);

    const [wasCreateNewProgramClicked, setWasCreateNewProgramClicked] = useState<boolean>(false);

    return (
        <Container maxWidth="lg">
            <Head>
                <title>Programok</title>
            </Head>
            <Grid container spacing={6} direction="column" justify="flex-end" wrap="nowrap">
                {!wasCreateNewProgramClicked && currentUser.hasAuthority(Authority.ProgramEditor) && (
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            endIcon={<AddCircleOutlineOutlinedIcon />}
                            onClick={() => setWasCreateNewProgramClicked(true)}
                            fullWidth
                        >
                            Új program
                        </Button>

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

                {/*usedEndpoint.succeeded &&
                    TimeSpan.asDate(TimeSpan.range('2021-09-20T00:00:00', 14, TimeSpan.day)).map((date, i) => (
                        <Grid item>
                            <DayProgramsDisplay key={i} programs={usedEndpoint.data} date={date} />
                        </Grid>
                    ))*/}
                <Grid item>
                    <ProgramCalendar startDate={new Date('2021-09-25T00:00:00')} count={15} />
                </Grid>
            </Grid>
        </Container>
    );
};

export default Index;
