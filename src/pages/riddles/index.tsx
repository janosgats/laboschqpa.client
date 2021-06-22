import Head from 'next/head'
import {NextPage} from "next";
import React, {useContext} from "react";
import RiddlesPanel from "~/components/panel/RiddlesPanel";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import NotTeamMemberBanner from "~/components/banner/NotTeamMemberBanner";

const Index: NextPage = () => {
    const currentUser = useContext(CurrentUserContext);

    return (
        <div>
            <Head>
                <title>Riddles</title>
            </Head>

            <NotTeamMemberBanner/>

            {currentUser.isMemberOrLeaderOfAnyTeam() && (
                <RiddlesPanel/>
            )}
        </div>
    )
};

export default Index;
