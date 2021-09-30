import {AxiosRequestConfig, AxiosResponse} from 'axios';
import React from 'react';
import callJsonEndpoint from '~/utils/api/callJsonEndpoint';
import {useDelayedToggle} from './useDelayedToggle';

export interface UseEndpointCommand<T, R = T> {
    conf: AxiosRequestConfig;
    deps?: ReadonlyArray<any>;
    customSuccessProcessor?: (axiosResponse: AxiosResponse<T>) => R;
    onSuccess?: (axiosResponse: AxiosResponse<T>) => void;
    onFailure?: (err: any) => void;
    onError?: (err: any) => void;
    enableRequest?: boolean;
    keepOldDataWhileFetchingNew?: boolean;
    delayPendingState?: boolean;
    mockConfig?: MockResponseConfig<T>
}

export interface UsedEndpoint<R> {
    data: R;

    pending: boolean;
    succeeded: boolean;
    failed: boolean;
    error: any;

    reloadEndpoint: () => void;
}

export interface MockResponseConfig<R> {
    shouldMock: boolean;
    mockData?: R;
}

const defaultMockConfig: MockResponseConfig<any> = {shouldMock: false}

const useEndpoint = <T, R = T>({
    conf,
    deps = [],
    customSuccessProcessor,
    enableRequest = true,
    keepOldDataWhileFetchingNew = false,
    onError,
    onSuccess,
    onFailure,
    delayPendingState = true,
    mockConfig = defaultMockConfig,
}: UseEndpointCommand<T, R>): UsedEndpoint<R> => {
    const [data, setData] = React.useState<R>(null);
    const [failed, setFailed] = React.useState(false);
    const [pending, setPending] = useDelayedToggle(false, delayPendingState ? 250 : 0);
    const [succeeded, setSucceeded] = React.useState(false);
    const [error, setError] = React.useState<any>(null);


    function getResponsePromiseProvider() {
        if (mockConfig.shouldMock) {
            return new Promise<AxiosResponse<T>>(resolve => {
                resolve({
                    data: mockConfig.mockData
                } as AxiosResponse<T>);
            });
        }
        return callJsonEndpoint<T>({conf: conf});

    }

    const refreshOnChange = () => {
        setPending(true);
        setSucceeded(false);
        setFailed(false);
        if (!keepOldDataWhileFetchingNew) {
            setData(null);
            setError(null);
        }

        getResponsePromiseProvider()
            .then((axiosResponse) => {
                if (customSuccessProcessor) {
                    setData(customSuccessProcessor(axiosResponse));
                } else {
                    setData(axiosResponse.data as unknown as R);
                }

                if (onSuccess) {
                    onSuccess(axiosResponse);
                }

                setFailed(false);
                setError(null);
                setSucceeded(true);
            })
            .catch((err) => {
                if (onFailure) {
                    onFailure(err);
                }

                setFailed(true);
                setSucceeded(false);
                setData(null);
                setError(err);
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
        failed: failed,
        error: error,
        reloadEndpoint: refreshOnChange,
    };
};

export default useEndpoint;
