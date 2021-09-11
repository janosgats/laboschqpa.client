import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import Head from "next/head";
import React, { useState } from "react";
import EventDisplayContainer from "~/components/eventDisplay/EventDisplayContainer";
import NavBar from "~/components/nav/NavBar";
import CurrentUserProvider from "~/context/CurrentUserProvider";

function MyApp({ Component, pageProps }): JSX.Element {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createMuiTheme({
    palette: {
      type: darkMode ? "dark" : "light",
    },
  });

  return (
    <>
      <Head>
        <title>Qpa</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
