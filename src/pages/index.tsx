import {Box, Container, Grid} from '@material-ui/core';
import {NextPage} from 'next';
import Head from 'next/head';
import React from 'react';
import NotAcceptedByEmailBanner from '~/components/banner/NotAcceptedByEmailBanner';
import NotTeamMemberBanner from '~/components/banner/NotTeamMemberBanner';
import NewsFeedPanel from '~/components/panel/NewsFeedPanel';
import ProgramCalendar from '~/components/program/ProgramCalendar';
import TimeSpan from '~/utils/TimeSpan';

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
                    <ProgramCalendar startDate={new Date(TimeSpan.dateOf(new Date()))} count={2} />
                </Grid>

                <Grid item>
                    <NewsFeedPanel />
                </Grid>
            </Grid>
        </Container>
    );
};

export default Index;
