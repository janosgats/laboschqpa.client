import React, {FC} from "react";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import {auth_OAUTH2_AUTHORIZATION_REQUEST_FROM_ALREADY_LOGGED_IN_USER} from "~/enums/ApiErrors";
import {useRouter} from "next/router";

const OAUTH2_REDIRECTION_OVERWRITTEN_RESPONSE_CODE = 299;
export const OAUTH2_OVERWRITE_REDIRECTION_REQUEST_HEADER_NAME = "Return-Api-Oauth-Redirection-Response";
export const OAUTH2_OVERRIDE_REDIRECTION_ORIGIN_HEADER_NAME = "X-Oauth2-Override-Redirection-Origin";

type loginOauthProvider = "google" | "github";

function getOverriddenOauth2RedirectionOrigin() {
    return location.origin;
}

const LoginForm: FC = () => {
    const router = useRouter();

    function doStartLogin(oauthProvider: loginOauthProvider) {
        callJsonEndpoint({
                url: `/api/up/server/login/oauth2/${oauthProvider}`,
                method: "GET",
                headers: {
                    [OAUTH2_OVERWRITE_REDIRECTION_REQUEST_HEADER_NAME]: "true",
                    [OAUTH2_OVERRIDE_REDIRECTION_ORIGIN_HEADER_NAME]: getOverriddenOauth2RedirectionOrigin(),
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
            <button onClick={() => doStartLogin("google")}>Google</button>
            <button onClick={() => doStartLogin("github")}>GitHub</button>
        </div>
    )
};

export default LoginForm;
