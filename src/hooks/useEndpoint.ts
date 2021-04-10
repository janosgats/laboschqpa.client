import React from "react";
import {AxiosRequestConfig, AxiosResponse} from "axios";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";

export interface UseEndpointCommand<T, R = T> {
    config: AxiosRequestConfig;
    deps?: ReadonlyArray<any>;
    reloadEndpointData?: number;
    customSuccessProcessor?: (axiosResponse: AxiosResponse<T>) => R;
    enableRequest?: boolean;
}

const useEndpoint = <T, R = T>(
    {config, deps = [], reloadEndpointData, customSuccessProcessor, enableRequest = true}: UseEndpointCommand<T, R>
): [R, boolean, boolean] => {
    const [data, setData] = React.useState<R>(null);
    const [error, setError] = React.useState(false);
    const [pending, setPending] = React.useState(false);

    const refreshOnChange = () => {
        setPending(true);
        setData(null);
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
    }, [...deps, reloadEndpointData, enableRequest]);

    return [data, error, pending];
};

export default useEndpoint;
