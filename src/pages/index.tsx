import {Box, Grid} from '@material-ui/core';
import {NextPage} from 'next';
import Head from 'next/head';
import React from 'react';
import NotAcceptedByEmailBanner from '~/components/banner/NotAcceptedByEmailBanner';
import NotTeamMemberBanner from '~/components/banner/NotTeamMemberBanner';
import NewsFeedPanel from '~/components/panel/NewsFeedPanel';

const Index: NextPage = () => {
    return (
        <Box>
            <Head>
                <title>Home</title>
            </Head>
            <Box mb={2}>
                <Grid container direction="column" spacing={2}>
                    <NotTeamMemberBanner />
                    <NotAcceptedByEmailBanner />
                </Grid>
            </Box>
            <NewsFeedPanel/>
        </Box>
    );
};

export default Index;
