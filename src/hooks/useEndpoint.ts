import React from "react";
import {AxiosRequestConfig, AxiosResponse} from "axios";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";

export interface UseEndpointCommand<T, R = T> {
    conf: AxiosRequestConfig;
    deps?: ReadonlyArray<any>;
    customSuccessProcessor?: (axiosResponse: AxiosResponse<T>) => R;
    onSuccess?: (axiosResponse: AxiosResponse<T>) => void;
    onError?: (err: any) => void;
    enableRequest?: boolean;
    keepOldDataWhileFetchingNew?: boolean;
}

export interface UsedEndpoint<R> {
    data: R;

    pending: boolean;
    succeeded: boolean;
    failed: boolean;

    reloadEndpoint: () => void;
}

const useEndpoint = <T, R = T>(
    {conf, deps = [], customSuccessProcessor, enableRequest = true, keepOldDataWhileFetchingNew = false, onError, onSuccess}: UseEndpointCommand<T, R>
): UsedEndpoint<R> => {
    const [data, setData] = React.useState<R>(null);
    const [error, setError] = React.useState(false);
    const [pending, setPending] = React.useState(true);
    const [succeeded, setSucceeded] = React.useState(false);

    const refreshOnChange = () => {
        setPending(true);
        setSucceeded(false);
        setError(false);
        if (!keepOldDataWhileFetchingNew) {
            setData(null);
        }
        callJsonEndpoint<T>({conf: conf})
            .then((axiosResponse) => {
                if (customSuccessProcessor) {
                    setData(customSuccessProcessor(axiosResponse));
                } else {
                    setData(axiosResponse.data as unknown as R);
                }

                if (onSuccess) {
                    onSuccess(axiosResponse);
                }

                setError(false);
                setSucceeded(true);
            })
            .catch((err) => {
                setError(true);
                setSucceeded(false);
                setData(null);
                if (onError) {
                    onError(err);
                }
            })
            .finally(() => setPending(false));
    };

    React.useEffect(() => {
        if (enableRequest) {
            refreshOnChange();
        }
    }, [...deps, enableRequest]);

    return {
        data: data,
        pending: pending,
        succeeded: succeeded,
        failed: error,
        reloadEndpoint: refreshOnChange
    };
};

export default useEndpoint;
