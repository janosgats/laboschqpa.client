import {ThemeProvider} from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import {createTheme} from '@material-ui/core/styles';
import Head from 'next/head';
import React, {CSSProperties, useState} from 'react';
import EventDisplayContainer from '~/components/eventDisplay/EventDisplayContainer';
import NavBar from '~/components/nav/NavBar';
import CurrentUserProvider from '~/context/CurrentUserProvider';

function getBackgroundImageDivStyle(isDarkMode: boolean): CSSProperties {
    let backgroundImageUrl = 'https://laboschqpa-public.s3.pl-waw.scw.cloud/static/frontend/background/light-1.svg';
    let backgroundSize = '1600px';
    if (isDarkMode) {
        backgroundImageUrl = 'https://laboschqpa-public.s3.pl-waw.scw.cloud/static/frontend/background/dark-1.svg';
        backgroundSize = '2000px';
    }

    return {
        minWidth: '100%',
        minHeight: '100vh',
        backgroundImage: `url("${backgroundImageUrl}")`,
        opacity: '0.66',
        position: 'fixed',
        backgroundSize: backgroundSize,
        zIndex: -1000,
    };
}

function MyApp({Component, pageProps}): JSX.Element {
    const [darkMode, setDarkMode] = useState(true);

    const theme = createTheme({
        palette: {
            type: darkMode ? 'dark' : 'light',
        },
    });

    return (
        <>
            <Head>
                <title>Qpa</title>
                <link rel="icon" href="https://laboschqpa-public.s3.pl-waw.scw.cloud/static/frontend/favicon/yellow.svg" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
            </Head>

            <ThemeProvider theme={theme}>
                <CssBaseline />
                <div style={getBackgroundImageDivStyle(darkMode)} />
                <EventDisplayContainer />
                <CurrentUserProvider>
                    <NavBar darkMode={darkMode} setDarkMode={setDarkMode}>
                        <Component {...pageProps} />
                    </NavBar>
                </CurrentUserProvider>
            </ThemeProvider>
        </>
    );
}

export default MyApp;
