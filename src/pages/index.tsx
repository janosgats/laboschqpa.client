import {Box, Grid, Typography} from '@material-ui/core';
import {NextPage} from 'next';
import Head from 'next/head';
import React from 'react';
import NotAcceptedByEmailBanner from '~/components/banner/NotAcceptedByEmailBanner';
import NotTeamMemberBanner from '~/components/banner/NotTeamMemberBanner';
import MyPaper from '~/components/mui/MyPaper';
import NewsFeedPanel from '~/components/panel/NewsFeedPanel';
import ProgramCalendar from '~/components/program/ProgramCalendar';
import TimeSpan from '~/utils/TimeSpan';

const Index: NextPage = () => {
    return (
        <Box>
            <Head>
                <title>HQ</title>
            </Head>
            <Box mb={2}>
                <Grid container direction="column" spacing={2}>
                    <NotTeamMemberBanner />
                    <NotAcceptedByEmailBanner />
                </Grid>
            </Box>

            <Grid container spacing={6} direction="column" justify="flex-end" wrap="nowrap">

                <Grid item>
                    <Box mb={2}>
                        <MyPaper>
                            <Typography variant="h4">Programok</Typography>
                        </MyPaper>
                    </Box>
                    <ProgramCalendar startDate={new Date(TimeSpan.dateOf(new Date()))} count={2} />
                </Grid>

                <Grid item>
                    <NewsFeedPanel />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Index;
