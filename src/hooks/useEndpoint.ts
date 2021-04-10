import React from "react";
import {AxiosRequestConfig, AxiosResponse} from "axios";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";

export interface UseEndpointCommand<T, R = T> {
    config: AxiosRequestConfig;
    deps?: ReadonlyArray<any>;
    customSuccessProcessor?: (axiosResponse: AxiosResponse<T>) => R;
    enableRequest?: boolean;
}

export interface UsedEndpoint<R> {
    data: R;
    error: boolean;
    pending: boolean;
    reloadEndpoint: () => void;
}

const useEndpoint = <T, R = T>(
    {config, deps = [], customSuccessProcessor, enableRequest = true}: UseEndpointCommand<T, R>
): UsedEndpoint<R> => {
    const [data, setData] = React.useState<R>(null);
    const [error, setError] = React.useState(false);
    const [pending, setPending] = React.useState(false);

    const refreshOnChange = () => {
        setPending(true);
        setData(null);
        setError(false);
        callJsonEndpoint<T>(config)
            .then((axiosResponse) => {
                if (customSuccessProcessor) {
                    setData(customSuccessProcessor(axiosResponse));
                } else {
                    setData(axiosResponse.data as unknown as R);
                }
                setError(false);
            })
            .catch((err) => {
                setError(true);
                setData(null);
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
        error: error,
        pending: pending,
        reloadEndpoint: refreshOnChange
    };
};

export default useEndpoint;
