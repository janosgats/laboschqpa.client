import axios, {AxiosPromise, AxiosRequestConfig, AxiosResponse} from "axios";
import ApiErrorDescriptorUtils, {ApiErrorDescriptor} from "~/utils/api/ApiErrorDescriptorUtils";
import EventBus from "~/utils/EventBus";
import ApiErrorDescriptorException from "~/exception/ApiErrorDescriptorException";
import UnauthorizedApiCallException from "~/exception/UnauthorizedApiCallException";
import FrontendApiCallException from "~/exception/FrontendApiCallException";
import Exception from "~/exception/Exception";
import * as CsrfService from "~/service/CsrfService";

const CSRF_TOKEN_HEADER_NAME = "X-CSRF-TOKEN";

export enum CsrfSendingCommand {
    AUTO = 1,
    SEND = 2,
    DO_NOT_SEND = 3
}

const extractExceptionFromResponse = (
    wasResponseReceived: boolean,
    axiosResponse: AxiosResponse | null,
    axiosRequestConfig: AxiosRequestConfig | null,
    payload: any
): Exception => {
    console.error("Error in callJsonEndpoint! wasResponseReceived: " + wasResponseReceived, [axiosResponse, axiosRequestConfig, payload]);

    if (!wasResponseReceived) {
        return new FrontendApiCallException("Cannot reach the servers.", axiosRequestConfig);
    }

    let apiErrorDescriptor: ApiErrorDescriptor = null;
    if (axiosResponse) {
        apiErrorDescriptor = ApiErrorDescriptorUtils.getApiErrorDescriptorIfPossible(axiosResponse.status, axiosResponse.data);
    }

    if (apiErrorDescriptor) {
        console.error("ApiErrorDescriptor received in callJsonEndpoint!", [apiErrorDescriptor,]);
        return new ApiErrorDescriptorException("ApiErrorDescriptor received", apiErrorDescriptor, payload);
    }

    if (axiosResponse) {
        if (axiosResponse.status === 401 || axiosResponse.status === 403) {
            return new UnauthorizedApiCallException(`You are not authorized to access this resource. (${axiosResponse.status})`, payload);
        }

        if (axiosResponse.status >= 500 && axiosResponse.status < 600) {
            return new FrontendApiCallException("Error received form the servers. Internal server error: " + axiosResponse.status, payload);
        }
    }

    return new FrontendApiCallException(
        "Error response received from the servers. Response code is not success!",
        {
            wasResponseReceived,
            axiosResponse,
            axiosRequestConfig,
            payload,
        }
    );
};

async function prepareRequestConfig(axiosRequestConfig: AxiosRequestConfig, csrfSendingCommand: CsrfSendingCommand) {
    if (!axiosRequestConfig.method) {
        axiosRequestConfig.method = "GET";
    }

    if (axiosRequestConfig.headers) {
        axiosRequestConfig.headers["Content-type"] = "application/json";
        axiosRequestConfig.headers["accept"] = "application/json";
    } else {
        axiosRequestConfig.headers = {
            "Content-type": "application/json",
            accept: "application/json",
        };
    }

    async function setCsrf() {
        axiosRequestConfig.headers[CSRF_TOKEN_HEADER_NAME] = await CsrfService.getCsrfToken();
    }

    switch (csrfSendingCommand) {
        case CsrfSendingCommand.AUTO:
            let uppercaseHttpMethod = axiosRequestConfig.method.toUpperCase();
            if (!(["GET", "HEAD", "TRACE", "OPTIONS"].includes(uppercaseHttpMethod))) {
                await setCsrf();
            }
            break;
        case CsrfSendingCommand.SEND:
            await setCsrf();
            break;
        case CsrfSendingCommand.DO_NOT_SEND:
            //Not setting the csrf
            break;
    }

    axiosRequestConfig.validateStatus = (status: number) => {
        return true; // Always returning true to handle all HTTP response codes and be able to extract the bodies
    };
}

/**
 * Use this function for every call made by the client-side code. This takes care of the proper global error handling.
 * @param axiosRequestConfig
 * @param acceptedResponseCodes response codes counted as success
 * @param publishExceptionEvents set this to false to disable publishing errors onto the EventBus
 * @param csrfSendingCommand
 *
 * @return If the API call succeeds AND the statusCode is contained by acceptedResponseCodes: Fulfilled promise with the response. Otherwise: rejected promise.
 */
const callJsonEndpoint = async <ReturnType>(
    axiosRequestConfig: AxiosRequestConfig,
    publishExceptionEvents: boolean = true,
    acceptedResponseCodes: Array<number> = [200],
    csrfSendingCommand: CsrfSendingCommand = CsrfSendingCommand.AUTO,
): Promise<AxiosResponse<ReturnType>> => {
    await prepareRequestConfig(axiosRequestConfig, csrfSendingCommand);

    const axiosPromise: AxiosPromise<ReturnType> = axios(axiosRequestConfig);

    return axiosPromise
        .catch((err) => {
            //This catch clause is intentionally put before the then clause to not to catch exceptions thrown there (there = then clause)
            const extractedException = extractExceptionFromResponse(false, null, axiosRequestConfig, err);

            if (publishExceptionEvents) {
                EventBus.publishException(extractedException);
            }
            throw extractedException;
        })
        .then((response) => {
            if (acceptedResponseCodes.includes(response.status)) {
                return response;
            }

            const extractedException = extractExceptionFromResponse(true, response, axiosRequestConfig, null);

            if (publishExceptionEvents) {
                EventBus.publishException(extractedException);
            }
            throw extractedException;
        });
};

export default callJsonEndpoint;