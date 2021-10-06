import Head from 'next/head'
import {NextPage} from "next";
import React, {useContext, useState} from "react";
import RiddlesPanel from "~/components/panel/RiddlesPanel";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import NotTeamMemberBanner from "~/components/banner/NotTeamMemberBanner";
import {RiddleCategory} from "~/enums/RiddleCategory";
import RiddleCategorySelector from "~/components/selector/RiddleCategorySelector";

const Index: NextPage = () => {
    const currentUser = useContext(CurrentUserContext);

    const [filteredCategory, setFilteredCategory] = useState<RiddleCategory>(RiddleCategory.SEVENTH_HEAVEN);

    return (
        <div>
            <Head>
                <title>Riddles</title>
            </Head>

            <NotTeamMemberBanner/>

            <RiddleCategorySelector value={filteredCategory} onChange={(category) => setFilteredCategory(category)}/>

            {currentUser.isMemberOrLeaderOfAnyTeam() && (
                <RiddlesPanel category={filteredCategory}/>
            )}
        </div>
    )
};

export default Index;
