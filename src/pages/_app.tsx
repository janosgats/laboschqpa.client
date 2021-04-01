import '../styles/globals.css'
import React from "react";
import EventDisplayContainer from "~/components/eventDisplays/EventDisplayContainer";
import CurrentUserProvider from "~/context/CurrentUserProvider";

function MyApp({Component, pageProps}): JSX.Element {
    return (
        <>
            <EventDisplayContainer/>
            <CurrentUserProvider>
                <Component {...pageProps} />
            </CurrentUserProvider>
        </>
    );
}

export default MyApp
