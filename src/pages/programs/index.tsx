import {Button, Container, Dialog, DialogContent, DialogTitle, Grid} from '@material-ui/core';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import {NextPage} from 'next';
import Head from 'next/head';
import React, {useContext, useRef, useState} from 'react';
import {ProgramDisplayContainer} from '~/components/fetchableDisplay/FetchableDisplayContainer';
import ProgramCalendar from '~/components/program/ProgramCalendar';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {Authority} from '~/enums/Authority';

const Index: NextPage = () => {
    const currentUser = useContext(CurrentUserContext);

    const [wasCreateNewProgramClicked, setWasCreateNewProgramClicked] = useState<boolean>(false);

    const reloaderRef = useRef<() => void>();

    return (
        <Container maxWidth="xl">
            <Head>
                <title>Programok</title>
            </Head>

            {wasCreateNewProgramClicked && (
                <Dialog open={true} onClose={() => setWasCreateNewProgramClicked(false)}>
                    <DialogTitle>Program létrehozás</DialogTitle>
                    <DialogContent>
                        <ProgramDisplayContainer
                            shouldCreateNew={true}
                            onCreatedNew={() => {
                                setWasCreateNewProgramClicked(false);
                                reloaderRef.current();
                            }}
                            onCancelledNewCreation={() => setWasCreateNewProgramClicked(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}

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
                <Grid item>
                    <ProgramCalendar reloaderRef={reloaderRef} startDate={new Date('2021-09-25T00:00:00')} count={15} shouldScrollToToday={true}/>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Index;
