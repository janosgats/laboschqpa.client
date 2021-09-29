import {Box, Container, Grid, Typography} from '@material-ui/core';
import {NextPage} from 'next';
import Head from 'next/head';
import React from 'react';
import NotAcceptedByEmailBanner from '~/components/banner/NotAcceptedByEmailBanner';
import NotTeamMemberBanner from '~/components/banner/NotTeamMemberBanner';
import NewsFeedPanel from '~/components/panel/NewsFeedPanel';
import ProgramCalendar from '~/components/program/ProgramCalendar';
import TimeSpan from '~/utils/TimeSpan';
import MyPaper from "~/components/mui/MyPaper";

const Index: NextPage = () => {
    return (
        <Container maxWidth="xl">
            <Head>
                <title>HQ - 49. Aki másnak vermet ás SCH QPA</title>
            </Head>
            <Box mb={2}>
                <Grid container direction="column" spacing={2}>
                    <NotTeamMemberBanner />
                    <NotAcceptedByEmailBanner />
                </Grid>
            </Box>

            <Grid container spacing={6} direction="column" justify="flex-end" wrap="nowrap">
                <Grid item>
                    <NewsFeedPanel />
                </Grid>

                <Grid item>
                    <MyPaper p={1}>
                        <Typography variant="h3">Programok</Typography>
                    </MyPaper>
                </Grid>
                <Grid item>
                    <ProgramCalendar startDate={new Date(TimeSpan.dateOf(new Date()))} count={2} />
                </Grid>
            </Grid>
        </Container>
    );
};

export default Index;
