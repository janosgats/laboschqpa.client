import React, {FC, useContext} from "react";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import {useRouter} from "next/router";
import {CurrentUserContext} from "~/context/CurrentUserProvider";

const LogoutForm: FC = () => {
    const router = useRouter();
    const loggedInUser = useContext(CurrentUserContext);

    function doLogout() {
        callJsonEndpoint({
                url: "/api/up/server/logout",
                method: "POST"
            }
        ).then(res => {
            loggedInUser.setLoggedInState(false);
            EventBus.notifyInfo("You just logged out", "See you soon")
            router.push("/");
        }).catch((reason) => {
            //TODO: more messages based on the ApiErrorDescriptor
            EventBus.notifyError("Please try again", "We cannot log you out :/")
        });
    }

    return (
        <div>
            <button onClick={() => doLogout()}>Logout</button>
        </div>
    )
};

export default LogoutForm;
