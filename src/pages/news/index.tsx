import {Container} from '@material-ui/core';
import {NextPage} from 'next';
import Head from 'next/head';
import React from 'react';
import NewsFeedPanel from '~/components/panel/NewsFeedPanel';

const Index: NextPage = () => {
    return (
        <Container maxWidth="lg">
            <Head>
                <title>News</title>
            </Head>

            <NewsFeedPanel />
        </Container>
    );
};

export default Index;
