import React, {FC} from "react";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import {useRouter} from "next/router";

//TODO: Replace with MUI
const LogoutForm: FC = () => {
    const router = useRouter();

    function doLogout() {
        callJsonEndpoint({
                url: "/server/logout",
                method: "POST"
            }
        ).then(res => {
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
