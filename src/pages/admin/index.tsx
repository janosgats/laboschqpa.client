import Head from 'next/head'
import {NextPage} from "next";
import React from "react";
import AdminNavBar from "~/components/nav/AdminNavBar";


const Index: NextPage = () => {
    return (
        <>
            <Head>
                <title>Admin</title>
            </Head>

            <AdminNavBar/>

            <p>Admin home</p>

        </>
    )
};

export default Index;
