import {ThemeProvider} from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import {createTheme} from '@material-ui/core/styles';
import Head from 'next/head';
import {useRouter} from 'next/router';
import React, {CSSProperties, useEffect, useMemo} from 'react';
import ClientRender from '~/components/ClientRender';
import EventDisplayContainer from '~/components/eventDisplay/EventDisplayContainer';
import NavBar from '~/components/nav/NavBar';
import CurrentUserProvider from '~/context/CurrentUserProvider';
import useLocalStorage from '~/hooks/useLocalStorage';
import {applyOrganicDDoSProtection} from '~/utils/DDoSProtector';
import '../components/eventDisplay/style/reactNotifications.css';

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
    const [darkMode, setDarkMode] = useLocalStorage('darkMode', true);

    const theme = createTheme({
        palette: {
            type: darkMode ? 'dark' : 'light',
        },
    });

    const router = useRouter();

    useEffect(() => {
        if (router.isReady) {
            applyOrganicDDoSProtection(router);
        }
    }, [router.isReady]);

    const backgrundStyle = useMemo(() => getBackgroundImageDivStyle(darkMode), [darkMode]);

    return (
        <>
            <Head>
                <title>Qpa</title>
                <link rel="icon" href="https://laboschqpa-public.s3.pl-waw.scw.cloud/static/frontend/favicon/yellow.svg" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
            </Head>

            <ThemeProvider theme={theme}>
                <CssBaseline />
                <ClientRender>{() => <div style={getBackgroundImageDivStyle(darkMode)} />}</ClientRender>
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
