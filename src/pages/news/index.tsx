import Head from 'next/head'
import {NextPage} from "next";
import React from "react";
import NewsFeedPanel from "~/components/NewsFeedPanel";

const Index: NextPage = () => {
    return (
        <div>
            <Head>
                <title>News</title>
            </Head>

            <NewsFeedPanel/>
        </div>
    )
};

export default Index;
