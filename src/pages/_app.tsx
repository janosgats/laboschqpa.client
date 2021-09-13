import {ThemeProvider} from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import {createTheme} from '@material-ui/core/styles';
import Head from 'next/head';
import React, {useState} from 'react';
import EventDisplayContainer from '~/components/eventDisplay/EventDisplayContainer';
import NavBar from '~/components/nav/NavBar';
import CurrentUserProvider from '~/context/CurrentUserProvider';

function getBackgroundImageDivStyle(isDarkMode: boolean): React.CSSProperties {
    let backgroundImageUrl =
        'https://scontent-vie1-1.xx.fbcdn.net/v/t1.15752-9/241793592_3108935256056662_7491508405053799638_n.jpg?_nc_cat=110&ccb=1-5&_nc_sid=ae9488&_nc_ohc=bvGi-x_L9N8AX-cv41g&_nc_ht=scontent-vie1-1.xx&oh=be6cdd81ca0f63cd3a9c78031fd3c277&oe=6162A99D';
    if (isDarkMode) {
        backgroundImageUrl =
            'https://scontent-vie1-1.xx.fbcdn.net/v/t1.15752-9/241459278_4383096108453288_6435489509201647053_n.jpg?_nc_cat=103&ccb=1-5&_nc_sid=ae9488&_nc_ohc=CvszFgfCgu8AX8S0su0&_nc_ht=scontent-vie1-1.xx&oh=8952175e21f4b9526206fff170705a5f&oe=6162F609';
    }
    //TODO: replace the image URLs with the final images and set the appropriate style params
    return {
        minWidth: '100%',
        minHeight: '100vh',
        backgroundImage: `url("${backgroundImageUrl}")`,
        opacity: '0.5',
        position: 'fixed',
        backgroundSize: '1500px',
        zIndex: -1000,
    };
}

function MyApp({Component, pageProps}): JSX.Element {
    const [darkMode, setDarkMode] = useState(false);

    const theme = createTheme({
        palette: {
            type: darkMode ? 'dark' : 'light',
        },
    });

    console.log('theme', theme);

    return (
        <>
            <Head>
                <title>Qpa</title>
                <link rel="icon" href="/favicon.ico" />
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
