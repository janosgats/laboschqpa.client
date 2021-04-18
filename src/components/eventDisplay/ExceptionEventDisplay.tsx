import React, {FC} from "react";
import EventBus, {EventType} from "~/utils/EventBus";
import 'react-notifications/lib/notifications.css';
import ApiErrorDescriptorException from "~/exception/ApiErrorDescriptorException";
import UnauthorizedApiCallException from "~/exception/UnauthorizedApiCallException";

EventBus.subscribe(EventType.EXCEPTION, "ExceptionEventDisplay", (event => {
    //TODO: Display exceptions
    if (event instanceof ApiErrorDescriptorException) {
        EventBus.notifyError("TODO: display ApiErrorDescriptors", "Dev TODO");
    } else if (event instanceof UnauthorizedApiCallException) {
        EventBus.notifyError("TODO: display UnauthorizedApiCallException", "Dev TODO");
    } else {
        EventBus.notifyError("TODO: display various types of other exceptions", "Dev TODO");
    }
}));

const ExceptionEventDisplay: FC = () => {
    return (<></>);
};

export default ExceptionEventDisplay;
