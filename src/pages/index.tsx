import Head from 'next/head'
import {NextPage} from "next";
import React from "react";
import NotTeamMemberBanner from "~/components/banner/NotTeamMemberBanner";
import NotAcceptedByEmailBanner from "~/components/banner/NotAcceptedByEmailBanner";
import NewsFeedPanel from "~/components/panel/NewsFeedPanel";

const Index: NextPage = () => {
    return (
        <div>
            <Head>
                <title>Home</title>
            </Head>

            <NotTeamMemberBanner/>
            <NotAcceptedByEmailBanner/>
            
            <NewsFeedPanel/>

        </div>
    )
};

export default Index;
