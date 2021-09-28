import Head from 'next/head'
import {NextPage} from "next";
import React from "react";
import QrFightResultsPanel from "~/components/panel/QrFightResultsPanel";


const Index: NextPage = () => {

    return (
        <>
            <Head>
                <title>QR Fight Report</title>
            </Head>
            <h1>QR Fight - Csapatok befolyásossága egyes területeken</h1>
            <QrFightResultsPanel/>
        </>
    )
};

export default Index;
