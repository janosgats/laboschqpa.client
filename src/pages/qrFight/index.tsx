import Head from 'next/head'
import {NextPage} from "next";
import React from "react";
import QrFightResultsPanel from "~/components/panel/QrFightResultsPanel";
import {Typography} from "@material-ui/core";
import MyPaper from "~/components/mui/MyPaper";


const Index: NextPage = () => {

    return (
        <>
            <Head>
                <title>QR Fight Report</title>
            </Head>
            <MyPaper>
                <Typography variant="h2">
                    QR Fight
                </Typography>
                <Typography variant="h5">
                    <b>Scannelj</b> elrejtett <b>QR kódokat</b> és növeld a csapatod befolyását <b>az egyes
                    területeken!</b>
                </Typography>
            </MyPaper>
            <br/>
            <QrFightResultsPanel/>
        </>
    )
};

export default Index;
