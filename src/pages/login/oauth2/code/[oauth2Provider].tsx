import Head from 'next/head'
import {NextPage} from "next";
import React, {useContext, useEffect, useState} from "react";
import EventBus from "~/utils/EventBus";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import {useRouter} from "next/router";
import {CurrentUserContext} from "~/context/CurrentUserProvider";


const nextPage: NextPage = () => {
    const router = useRouter();
    const currentUser = useContext(CurrentUserContext);
    const [isLoginInProgress, setLoginInProgress] = useState<boolean>(true);
    const [isLoginSucceeded, setLoginSucceeded] = useState<boolean>(false);

    useEffect(() => {
            if (!router.isReady) {
                /* Query is not parsed yet.
                We silently skip this round, and wait for a render where the query is parsed. */
                return;
            }
            doLogin();
        }, [router.isReady]
    );

    function doLogin() {
        callJsonEndpoint({
            url: `/server/login/oauth2/code/${router.query.oauth2Provider}`,
            method: "GET",
            params: router.query
        }).then(res => {
            currentUser.setLoggedInState(true);
            EventBus.notifySuccess("You just logged in", "Hello there");
            setLoginSucceeded(true);
            router.push("/");
        }).catch((reason) => {
            //TODO: more messages based on the ApiErrorDescriptor
            EventBus.notifyError("We cannot log you in", "Something went wrong :/")
        }).finally(() => setLoginInProgress(false));
    }

    return (
        <div>
            <Head>
                <title>TODO: Fill the head, etc...</title>
            </Head>
            {
                isLoginInProgress && (
                    <p>Logging you in</p>
                )
            }
            {
                isLoginSucceeded && (
                    <>
                        <p>You are logged in</p>
                    </>
                )
            }
        </div>
    )
};

export default nextPage;
