import '../styles/globals.css'
import React from "react";
import EventDisplayContainer from "~/components/eventDisplays/EventDisplayContainer";

function MyApp({Component, pageProps}): JSX.Element {
    return (
        <>
            <EventDisplayContainer/>
            <Component {...pageProps} />
        </>
    );
}

export default MyApp
