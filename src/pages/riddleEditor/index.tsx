import Head from 'next/head'
import {NextPage} from "next";
import React, {useState} from "react";
import RiddleEditorPanel from "~/components/panel/RiddleEditorPanel";
import {RiddleCategory} from "~/enums/RiddleCategory";
import RiddleCategorySelector from "~/components/selector/RiddleCategorySelector";

const Index: NextPage = () => {
    const [filteredCategory, setFilteredCategory] = useState<RiddleCategory>(RiddleCategory.SEVENTH_HEAVEN);

    return (
        <div>
            <Head>
                <title>Riddle Editor</title>
            </Head>

            <RiddleCategorySelector value={filteredCategory} onChange={(category) => setFilteredCategory(category)}/>

            <RiddleEditorPanel category={filteredCategory}/>
        </div>
    )
};

export default Index;
