import React, {FC} from "react";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import {auth_OAUTH2_AUTHORIZATION_REQUEST_FROM_ALREADY_LOGGED_IN_USER} from "~/enums/ApiErrors";
import {useRouter} from "next/router";

const OAUTH2_REDIRECTION_OVERWRITTEN_RESPONSE_CODE = 299;
const OAUTH2_OVERWRITE_REDIRECTION_REQUEST_HEADER_NAME = "Return-Api-Oauth-Redirection-Response";

type loginOauthProvider = "google" | "github";

//TODO: Replace with MUI
const LoginForm: FC = () => {
    const router = useRouter();

    function doLogin(oauthProvider: loginOauthProvider) {
        callJsonEndpoint({
                url: `/server/login/oauth2/${oauthProvider}`,
                method: "GET",
                headers: {
                    [OAUTH2_OVERWRITE_REDIRECTION_REQUEST_HEADER_NAME]: "true"
                }
            },
            true,
            [OAUTH2_REDIRECTION_OVERWRITTEN_RESPONSE_CODE]
        ).then(res => {
            const redirectLocation = res.headers["location"];
            if (!redirectLocation) {
                EventBus.notifyError("Please try a different login provider. There are problems with the login response.",
                    "Cannot redirect to login provider :/");
                return;
            }
            EventBus.notifyInfo(`Redirecting you to ${oauthProvider}`, "Logging in")
            router.push(redirectLocation);
        }).catch((reason) => {
            //TODO: more messages based on the ApiErrorDescriptor
            if (auth_OAUTH2_AUTHORIZATION_REQUEST_FROM_ALREADY_LOGGED_IN_USER.is(reason.apiErrorDescriptor)) {
                EventBus.notifyWarning(`Click here to get back home`, "You are already logged in", 60000, () => {
                    router.push("/");
                });
                return;
            }
            EventBus.notifyError("Please try a different login provider", "We cannot log you in :/")
        });
    }

    return (
        <div>
            <h3>Choose a login method</h3>
            <button onClick={() => doLogin("google")}>Google</button>
            <button onClick={() => doLogin("github")}>GitHub</button>
        </div>
    )
};

export default LoginForm;
