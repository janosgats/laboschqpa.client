import React from "react";
import EventDisplayContainer from "~/components/eventDisplay/EventDisplayContainer";
import CurrentUserProvider from "~/context/CurrentUserProvider";
import NavBar from "~/components/nav/NavBar";
import Head from "next/head";
import { createMuiTheme, Paper, ThemeProvider } from '@material-ui/core';
import { useState } from 'react';

function MyApp({ Component, pageProps }): JSX.Element {

    const [darkMode, setDarkMode] = useState(false);

    const theme = createMuiTheme({
        palette: {
            type: darkMode ? "dark" : "light"
                }
    });

    return (
        <>
            <ThemeProvider theme={theme} >
                <Paper>
                    <Head>
                        <title>Qpa</title>
                        <link rel="icon" href="/favicon.ico" />
                        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
                    </Head>
                    <EventDisplayContainer />
                    <CurrentUserProvider>
                        <NavBar darkMode={darkMode} setDarkMode={setDarkMode}>
                            <Component {...pageProps} />  
                        </NavBar>
                    </CurrentUserProvider>
                </Paper>
            </ThemeProvider>
        </>
    );
}

export default MyApp
