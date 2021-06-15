import Head from 'next/head'
import {NextPage} from "next";
import React from "react";
import RiddleEditorPanel from "~/components/panel/RiddleEditorPanel";

const Index: NextPage = () => {
    return (
        <div>
            <Head>
                <title>Riddle Editor</title>
            </Head>

            <RiddleEditorPanel/>
        </div>
    )
};

export default Index;
