import {Box} from '@material-ui/core';
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

            <NewsFeedPanel>
                <NotTeamMemberBanner />
                <NotAcceptedByEmailBanner />
            </NewsFeedPanel>
        </Box>
    );
};

export default Index;
