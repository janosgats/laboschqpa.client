import React, {FC, useState} from "react";
import callJsonEndpoint, {CsrfSendingCommand} from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import ApiErrorDescriptorException from "~/exception/ApiErrorDescriptorException";
import {registration_E_MAIL_ADDRESS_IS_ALREADY_IN_THE_SYSTEM} from "~/enums/ApiErrors";


//TODO: Add e-mail validation
const RegisterForm: FC = () => {
    const [email, setEmail] = useState<string>("");
    const [isCheckYourMailDialogShown, setCheckYourMailDialogShown] = useState<boolean>(false);

    function submitRegistrationEmail() {
        callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/noAuthRequired/registerByEmail/submitEmail",
                method: "POST",
                params: {
                    "email": email
                }
            }, csrfSendingCommand: CsrfSendingCommand.DO_NOT_SEND
        }).then(() => {
            setCheckYourMailDialogShown(true);
            EventBus.notifySuccess("We sent you a registration e-mail", "Check your mailbox")
        }).catch(reason => {
            //TODO: more messages based on the ApiErrorDescriptor
            if (reason instanceof ApiErrorDescriptorException) {
                if (registration_E_MAIL_ADDRESS_IS_ALREADY_IN_THE_SYSTEM.is(reason.apiErrorDescriptor)) {
                    EventBus.notifyError(`${email} is already registered`, "Already registered", 30000);
                    return;
                }
            }
            EventBus.notifyError("We couldn't send you the mail", "Something went wrong :/");
        })
    }

    return (<>
        <input type="text" value={email} onChange={e => setEmail(e.target.value)}/>
        <button onClick={submitRegistrationEmail}>Register</button>
        {
            isCheckYourMailDialogShown &&
            (
                <p>Check your mailbox!</p>
            )
        }
    </>);
};

export default RegisterForm;
