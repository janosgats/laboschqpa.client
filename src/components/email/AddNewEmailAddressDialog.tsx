import React, {FC, useEffect, useState} from 'react'
import {Button, Dialog, DialogActions, DialogContent} from "@material-ui/core";
import {isValidEmail} from "~/utils/CommonValidators";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import ApiErrorDescriptorException from "~/exception/ApiErrorDescriptorException";
import {emailAddress_EMAIL_ALREADY_BELONGS_TO_A_USER} from "~/enums/ApiErrors";


interface Props {
    onClose: () => void;
    isOpen: boolean;
}

export const AddNewEmailAddressDialog: FC<Props> = (props) => {
    const [email, setEmail] = useState<string>();
    const [isApiCallPending, setApiCallPending] = useState<boolean>(false);

    useEffect(() => {
        if (props.isOpen) {
            setEmail('');
            setApiCallPending(false);
        }
    }, [props.isOpen])

    function submitNewAddress() {
        setApiCallPending(true);
        callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/emailAddress/submitNewAddress",
                method: "POST",
                params: {
                    "email": email
                }
            },
        }).then(() => {
            EventBus.notifySuccess("We sent you a verification e-mail", "Check your mailbox", 60000);
            props.onClose();
        }).catch(reason => {
            //TODO: more messages based on the ApiErrorDescriptor
            if (reason instanceof ApiErrorDescriptorException) {
                if (emailAddress_EMAIL_ALREADY_BELONGS_TO_A_USER.is(reason.apiErrorDescriptor)) {
                    EventBus.notifyWarning("This e-mail already belongs to a user", "Email is already taken", 60000);
                    return;
                }
            }
            EventBus.notifyError("We couldn't send you the mail", "Something went wrong :/");
        }).finally(() => setApiCallPending(false));
    }

    return (
        <Dialog open={props.isOpen} onClose={props.onClose}>
            <DialogContent>
                <label>E-mail: </label>
                <input value={email} onChange={(e) => setEmail(e.target.value)}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={submitNewAddress}
                        color="primary"
                        disabled={!isValidEmail(email) || isApiCallPending}>
                    Add new address
                </Button>
            </DialogActions>
        </Dialog>
    )
}