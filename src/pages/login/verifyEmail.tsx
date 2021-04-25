import Head from 'next/head'
import {NextPage} from "next";
import React, {useEffect, useState} from "react";
import EventBus from "~/utils/EventBus";
import callJsonEndpoint, {CsrfSendingCommand} from "~/utils/api/callJsonEndpoint";
import {useRouter} from "next/router";
import LoginForm from "~/components/join/LoginForm";

interface EmailVerificationParams {
    id: number;
    key: string;
    successfullyExtracted: boolean;
}

const nextPage: NextPage = () => {
    const router = useRouter();
    const [isEmailVerificationInProgress, setEmailVerificationInProgress] = useState<boolean>(true);
    const [isEmailVerificationSucceeded, setEmailVerificationSucceeded] = useState<boolean>(false);

    useEffect(() => {
            if (!router.isReady) {
                /* Query is not parsed yet.
                We silently skip this round, and wait for a render where the query is parsed. */
                return;
            }
            doEmailVerification();
        }, [router.isReady]
    );

    function doEmailVerification() {
        const registrationParams: EmailVerificationParams = extractEmailVerificationParams();
        if (!registrationParams.successfullyExtracted) {
            EventBus.notifyError("We couldn't extract your registration data from the URL", "Missing registration data")
            return;
        }

        callJsonEndpoint({
            conf:{
                url: "/api/up/server/api/noAuthRequired/registerByEmail/verifyEmail",
                method: "POST",
                params: {
                    id: registrationParams.id,
                    key: registrationParams.key
                }
            },csrfSendingCommand:CsrfSendingCommand.DO_NOT_SEND
        }).then(res => {
            EventBus.notifySuccess("Your e-mail is verified", "Welcome");
            setEmailVerificationSucceeded(true);
        }).catch((reason) => {
            //TODO: more messages based on the ApiErrorDescriptor
            EventBus.notifyError("We cannot verify your e-mail", "Something went wrong :/")
        }).finally(() => setEmailVerificationInProgress(false));
    }

    function extractEmailVerificationParams(): EmailVerificationParams {
        const id: number = parseInt(router.query['id'] as string);
        if (isNaN(id)) {
            return {
                successfullyExtracted: false,
                id: null,
                key: null
            }
        }

        return {
            id: id,
            key: router.query['key'] as string,
            successfullyExtracted: true
        };
    }

    return (
        <div>
            <Head>
                <title>Email verification</title>
            </Head>
            {
                isEmailVerificationInProgress && (
                    <p>Verification in progress</p>
                )
            }
            {
                isEmailVerificationSucceeded && (
                    <LoginForm/>
                )
            }
        </div>
    )
};

export default nextPage;
