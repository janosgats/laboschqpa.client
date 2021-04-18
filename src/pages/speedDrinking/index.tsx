import Head from 'next/head'
import {NextPage} from "next";
import React, {useContext, useState} from "react";
import {SpeedDrinkingCategory} from "~/enums/SpeedDrinkingCategory";
import SpeedDrinkingPanel from "~/components/panel/SpeedDrinkingPanel";
import SpeedDrinkingCategorySelector from "~/components/selector/SpeedDrinkingCategorySelector";
import {CurrentUserContext} from "~/context/CurrentUserProvider";

const Index: NextPage = () => {
    const currentUser = useContext(CurrentUserContext);
    const [filteredCategory, setFilteredCategory] = useState<SpeedDrinkingCategory>(SpeedDrinkingCategory.BEER);

    return (
        <div>
            <Head>
                <title>Speed Drinking</title>
            </Head>

            <SpeedDrinkingCategorySelector
                value={filteredCategory}
                onChange={category => setFilteredCategory(category)}
            />

            <SpeedDrinkingPanel filteredCategory={filteredCategory}/>

        </div>
    )
};

export default Index;
