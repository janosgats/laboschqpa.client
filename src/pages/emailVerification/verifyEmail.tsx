import Head from 'next/head'
import {NextPage} from "next";
import React, {useEffect, useState} from "react";
import EventBus from "~/utils/EventBus";
import callJsonEndpoint, {CsrfSendingCommand} from "~/utils/api/callJsonEndpoint";
import {useRouter} from "next/router";
import ApiErrorDescriptorException from "~/exception/ApiErrorDescriptorException";
import {
    emailAddress_EMAIL_ALREADY_BELONGS_TO_A_USER,
    emailAddress_VERIFICATION_REQUEST_PHASE_IS_INVALID
} from "~/enums/ApiErrors";

interface EmailVerificationParams {
    id: number;
    key: string;
    successfullyExtracted: boolean;
}

const nextPage: NextPage = () => {
    const router = useRouter();
    const [isEmailVerificationInProgress, setEmailVerificationInProgress] = useState<boolean>(true);

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
            EventBus.notifyError("We couldn't extract your verification data from the URL", "Malformed verification URL")
            return;
        }

        callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/noAuthRequired/emailVerification/verify",
                method: "POST",
                params: {
                    id: registrationParams.id,
                    key: registrationParams.key
                }
            }, csrfSendingCommand: CsrfSendingCommand.DO_NOT_SEND
        }).then(res => {
            EventBus.notifySuccess("Your e-mail is verified", "Nice");
        }).catch((reason) => {
            //TODO: more messages based on the ApiErrorDescriptor
            if (reason instanceof ApiErrorDescriptorException) {
                if (emailAddress_VERIFICATION_REQUEST_PHASE_IS_INVALID.is(reason.apiErrorDescriptor)) {
                    EventBus.notifyError(
                        "Maybe just expired. Try to submit your e-mail address one more time!",
                        "Your mail verification is invalid",
                        90000);
                    return;
                }
                if (emailAddress_EMAIL_ALREADY_BELONGS_TO_A_USER.is(reason.apiErrorDescriptor)) {
                    EventBus.notifyWarning("This e-mail already belongs to a user", "Email is already taken", 60000);
                    return;
                }
            }
            EventBus.notifyError("We cannot verify your e-mail", "Something went wrong :/");
        }).finally(() => {
            router.push('/');
            setEmailVerificationInProgress(false);
        });
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
        </div>
    )
};

export default nextPage;
