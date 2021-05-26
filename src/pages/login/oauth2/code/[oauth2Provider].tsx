import Head from 'next/head'
import {NextPage} from "next";
import React, {useContext, useEffect, useState} from "react";
import EventBus from "~/utils/EventBus";
import callJsonEndpoint, {CsrfSendingCommand} from "~/utils/api/callJsonEndpoint";
import {useRouter} from "next/router";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import ApiErrorDescriptorException from "~/exception/ApiErrorDescriptorException";
import {
    auth_AUTH_EMAIL_GOT_FROM_OAUTH2_RESPONSE_BELONGS_TO_ANOTHER_ACCOUNT,
    auth_AUTH_EXTERNAL_ACCOUNT_GOT_FROM_OAUTH2_RESPONSE_BELONGS_TO_ANOTHER_ACCOUNT,
    auth_CANNOT_FIND_EXISTING_ACCOUNT_TO_LOG_IN
} from "~/enums/ApiErrors";


const nextPage: NextPage = () => {
    const router = useRouter();
    const currentUser = useContext(CurrentUserContext);
    const [isLoginInProgress, setLoginInProgress] = useState<boolean>(true);
    const [isAccountCreationInProgress, setAccountCreationInProgress] = useState<boolean>(false);
    const [isLoginSucceeded, setLoginSucceeded] = useState<boolean>(false);
    const [isCannotFindExistingAccountToLogIn, setCannotFindExistingAccountToLogIn] = useState<boolean>(false);

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
            conf: {
                url: `/api/up/server/login/oauth2/code/${router.query.oauth2Provider}`,
                method: "GET",
                params: router.query
            },
            publishExceptionEvents: false
        }).then(res => {
            EventBus.notifySuccess("You just logged in", "Hello there");
            setLoginSucceeded(true);
            currentUser
                .reload()
                .finally(() => router.push("/"));
        }).catch((reason) => {
            //TODO: more messages based on the ApiErrorDescriptor
            if (reason instanceof ApiErrorDescriptorException) {
                if (auth_CANNOT_FIND_EXISTING_ACCOUNT_TO_LOG_IN.is(reason.apiErrorDescriptor)) {
                    setCannotFindExistingAccountToLogIn(true);
                    return;
                }
                if (auth_AUTH_EMAIL_GOT_FROM_OAUTH2_RESPONSE_BELONGS_TO_ANOTHER_ACCOUNT.is(reason.apiErrorDescriptor)) {
                    EventBus.notifyError(
                        "E-mail got from OAuth2 response is saved in the system as a different User's e-mail address",
                        'E-mail is already taken',
                        60000);
                    return;
                }
                if (auth_AUTH_EXTERNAL_ACCOUNT_GOT_FROM_OAUTH2_RESPONSE_BELONGS_TO_ANOTHER_ACCOUNT.is(reason.apiErrorDescriptor)) {
                    EventBus.notifyError(
                        "External account got from OAuth2 response is saved in the system as a different User's external account",
                        'External account is already taken',
                        60000);
                    return;
                }
            }
            EventBus.notifyError("We cannot log you in", "Something went wrong :/");
            EventBus.publishException(reason);
        }).finally(() => setLoginInProgress(false));
    }

    function createNewAccount() {
        setAccountCreationInProgress(true);
        callJsonEndpoint({
            conf: {
                url: '/api/up/server/api/noAuthRequired/register/createNewAccountFromSessionOAuthInfo',
                method: "POST",
            }, csrfSendingCommand: CsrfSendingCommand.DO_NOT_SEND
        }).then(res => {
            EventBus.notifySuccess("You just joined", "Welcome");
            setLoginSucceeded(true);
            currentUser
                .reload()
                .finally(() => router.push("/"));
        }).catch((reason) => {
            //TODO: more messages based on the ApiErrorDescriptor
            EventBus.notifyError("We cannot create your account", "Something went wrong :/");
        }).finally(() => setAccountCreationInProgress(false));
    }

    return (
        <div>
            <Head>
                <title>Almost there...</title>
            </Head>
            {isLoginInProgress && (
                <p>Logging you in...</p>
            )}
            {isLoginSucceeded && (
                <>
                    <p>You are logged in</p>
                </>
            )}
            {isCannotFindExistingAccountToLogIn && (
                <>
                    <h3>Cannot find existing account</h3>
                    <button onClick={() => router.push('/')}>Try another login method</button>
                    <button onClick={() => createNewAccount()}>Create new account</button>
                </>
            )}
            {isAccountCreationInProgress && (
                <p>Creating your account...</p>
            )}
        </div>
    )
};

export default nextPage;
