import React, {FC} from "react";
import EventBus, {EventType} from "~/utils/EventBus";
import 'react-notifications/lib/notifications.css';
import ApiErrorDescriptorException from "~/exception/ApiErrorDescriptorException";
import UnauthorizedApiCallException from "~/exception/UnauthorizedApiCallException";
import {ApiErrorDescriptor} from "~/utils/api/ApiErrorDescriptorUtils";
import {upload_STREAM_LENGTH_LIMIT_EXCEEDED} from "~/enums/ApiErrors";

EventBus.subscribe(EventType.EXCEPTION, "ExceptionEventDisplay", (event => {
    //TODO: Display exceptions
    if (event instanceof ApiErrorDescriptorException) {
        displayApiErrorDescriptor(event.apiErrorDescriptor);
    } else if (event instanceof UnauthorizedApiCallException) {
        EventBus.notifyError("TODO: display UnauthorizedApiCallException", "Dev TODO");
    } else {
        EventBus.notifyError("TODO: display various types of other exceptions", "Dev TODO");
    }
}));

function displayApiErrorDescriptor(descriptor: ApiErrorDescriptor) {
    if (upload_STREAM_LENGTH_LIMIT_EXCEEDED.is(descriptor)) {
        EventBus.notifyError(descriptor.message, "File is too large");
    } else {
        EventBus.notifyError("TODO: display ApiErrorDescriptors", "Dev TODO");
    }
}

const ExceptionEventDisplay: FC = () => {
    return (<></>);
};

export default ExceptionEventDisplay;
