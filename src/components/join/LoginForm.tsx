import React, {FC, useContext} from "react";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import {auth_OAUTH2_AUTHORIZATION_REQUEST_FROM_ALREADY_LOGGED_IN_USER} from "~/enums/ApiErrors";
import {useRouter} from "next/router";
import ApiErrorDescriptorException from "~/exception/ApiErrorDescriptorException";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Button, ButtonGroup, CardContent, Grid, Typography} from "@material-ui/core";
import GitHubIcon from '@material-ui/icons/GitHub';
import GTranslateIcon from "@material-ui/icons/GTranslate";
import LoginRedirectionService from "~/service/LoginRedirectionService";

const OAUTH2_REDIRECTION_OVERWRITTEN_RESPONSE_CODE = 299;
export const OAUTH2_OVERWRITE_REDIRECTION_REQUEST_HEADER_NAME = "Return-Api-Oauth-Redirection-Response";
export const OAUTH2_OVERRIDE_REDIRECTION_ORIGIN_HEADER_NAME = "X-Oauth2-Override-Redirection-Origin";

type loginOauthProvider = "google" | "github";

function getOverriddenOauth2RedirectionOrigin() {
    return location.origin;
}

interface Props {
    addLoginMethod?: boolean;
}

const LoginForm: FC<Props> = (props) => {
    const router = useRouter();
    const currentUser = useContext(CurrentUserContext);

    function doStartLogin(oauthProvider: loginOauthProvider) {
        const queryParams = {};
        if (props.addLoginMethod) {
            queryParams['addLoginMethod'] = 'true';
        }

        callJsonEndpoint({
            conf: {
                url: `/api/up/server/login/oauth2/${oauthProvider}`,
                method: "GET",
                params: queryParams,
                headers: {
                    [OAUTH2_OVERWRITE_REDIRECTION_REQUEST_HEADER_NAME]: "true",
                    [OAUTH2_OVERRIDE_REDIRECTION_ORIGIN_HEADER_NAME]: getOverriddenOauth2RedirectionOrigin(),
                }
            },
            acceptedResponseCodes: [OAUTH2_REDIRECTION_OVERWRITTEN_RESPONSE_CODE]
        }).then(res => {
            const redirectLocation = res.headers["location"];
            if (!redirectLocation) {
                EventBus.notifyError("Please try a different login provider. There are problems with the login response.",
                    "Cannot redirect to login provider :/");
                return;
            }
            EventBus.notifyInfo(`Redirecting you to ${oauthProvider}`, "Logging in")
            LoginRedirectionService.saveRedirectionUrl(location.pathname + location.search);

            router.push(redirectLocation);
        }).catch((reason) => {
            //TODO: more messages based on the ApiErrorDescriptor
            if (reason instanceof ApiErrorDescriptorException) {
                if (auth_OAUTH2_AUTHORIZATION_REQUEST_FROM_ALREADY_LOGGED_IN_USER.is(reason.apiErrorDescriptor)) {
                    EventBus.notifyWarning(`Click here to get back home`, "You are already logged in", 60000, () => {
                        router.push("/");
                    });
                    currentUser.reload();
                    return;
                }
            }
            if (props.addLoginMethod) {
                EventBus.notifyError("We cannot add your new login method :/");
            } else {
                EventBus.notifyError("Please try a different login provider", "We cannot log you in :/");
            }
        });
    }

    return (
        <CardContent>
            <Grid container direction="column" justify="center" alignItems="center">
                {props.addLoginMethod ? (
                    <Grid item xs={12}>
                        <Typography variant="h5">Új bejelentkezési mód hozzáadása</Typography>
                    </Grid>
                ) : (
                    <Grid item xs={12}>
                        <Typography variant="h5">Válasz bejelentkezési módot</Typography>
                    </Grid>
                )}
                <ButtonGroup variant="contained" color="primary">
                    <Button
                        variant="contained"
                        onClick={() => doStartLogin("google")}
                        endIcon={<GTranslateIcon/>}
                    >
                        Google
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => doStartLogin("github")}
                        endIcon={<GitHubIcon/>}
                    >
                        GitHub
                    </Button>
                </ButtonGroup>
            </Grid>
        </CardContent>
    )
};

export default LoginForm;
