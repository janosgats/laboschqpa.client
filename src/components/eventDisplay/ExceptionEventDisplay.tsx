import React, {FC} from "react";
import EventBus, {EventType} from "~/utils/EventBus";
import ApiErrorDescriptorException from "~/exception/ApiErrorDescriptorException";
import UnauthorizedApiCallException from "~/exception/UnauthorizedApiCallException";
import {ApiErrorDescriptor} from "~/utils/api/ApiErrorDescriptorUtils";
import {fieldValidationFailed_FIELD_VALIDATION_FAILED, upload_STREAM_LENGTH_LIMIT_EXCEEDED} from "~/enums/ApiErrors";
import TooManyRequestsRateLimitException from "~/exception/TooManyRequestsRateLimitException";

EventBus.subscribe(EventType.EXCEPTION, "ExceptionEventDisplay", (event => {
    //TODO: Display exceptions
    if (event instanceof ApiErrorDescriptorException) {
        displayApiErrorDescriptor(event.apiErrorDescriptor);
    } else if (event instanceof UnauthorizedApiCallException) {
        EventBus.notifyError("You are not authorized for the requested operation.", "Unauthorized");
    } else if (event instanceof TooManyRequestsRateLimitException) {
        EventBus.notifyError("We received too many requests from your IP, so you were limited. If you think this is a mistake, contact the devs.", "You were rate limited");
    } else {
        EventBus.notifyError("TODO: display various types of other exceptions", "Dev TODO");
    }
}));

function displayApiErrorDescriptor(descriptor: ApiErrorDescriptor) {
    if (upload_STREAM_LENGTH_LIMIT_EXCEEDED.is(descriptor)) {
        EventBus.notifyError(descriptor.message, "File is too large");
    } else if (fieldValidationFailed_FIELD_VALIDATION_FAILED.is(descriptor)) {
        EventBus.notifyError(JSON.stringify(descriptor.payload), "Invalid input");
    } else {
        const title = `${descriptor.apiErrorCategory} > ${formatApiErrorName(descriptor)}`
        const message = descriptor.message;
        EventBus.notifyError(message, title);
    }
}

function formatApiErrorName(descriptor: ApiErrorDescriptor) {
    let name = descriptor.apiErrorName;
    name = String(name).replaceAll('_', ' ');
    name = name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase();
    return name;
}

const ExceptionEventDisplay: FC = () => {
    return (<></>);
};

export default ExceptionEventDisplay;
