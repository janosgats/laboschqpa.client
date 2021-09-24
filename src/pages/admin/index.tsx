import Head from 'next/head'
import {NextPage} from "next";
import React from "react";
import AdminNavBar from "~/components/nav/AdminNavBar";
import NavigateAwayIfUserIsNotAdmin from "~/components/admin/NavigateAwayIfUserIsNotAdmin";


const Index: NextPage = () => {
    return (
        <>
            <Head>
                <title>Admin</title>
            </Head>

            <NavigateAwayIfUserIsNotAdmin/>
            <AdminNavBar/>

            <p>Admin home</p>

        </>
    )
};

export default Index;
