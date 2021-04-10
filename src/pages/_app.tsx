import '../styles/globals.css'
import React from "react";
import EventDisplayContainer from "~/components/eventDisplays/EventDisplayContainer";
import CurrentUserProvider from "~/context/CurrentUserProvider";
import NavBar from "~/components/nav/NavBar";
import Head from "next/head";

function MyApp({Component, pageProps}): JSX.Element {
    return (
        <>
            <Head>
                <title>Qpa</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <EventDisplayContainer/>
            <CurrentUserProvider>
                <NavBar/>
                <Component {...pageProps} />
            </CurrentUserProvider>
        </>
    );
}

export default MyApp
