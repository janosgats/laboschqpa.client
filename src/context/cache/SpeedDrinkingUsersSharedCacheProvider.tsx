import React, {createContext, FunctionComponent, ReactNode, useContext, useState} from 'react';
import {UserInfo} from '~/model/UserInfo';
import SharedCache from "~/context/cache/SharedCache";

const SpeedDrinkingUsersSharedCacheContext = createContext<SharedCache<UserInfo[]>>({
    data: null,
    isSet: false,
    setData: () => null,
    clear: () => null,
});

interface Props {
    children: ReactNode;
}

const SpeedDrinkingUsersSharedCacheProvider: FunctionComponent = ({children}: Props): JSX.Element => {
    const [cacheData, setCacheData] = useState(null);

    function setData(newData: UserInfo[]) {
        setCacheData(newData);
    }

    function clear() {
        setCacheData(null);
    }

    const contextValue: SharedCache<UserInfo[]> = {
        data: cacheData,
        setData: setData,
        clear: clear,
        isSet: cacheData !== null,
    };

    return (
        <SpeedDrinkingUsersSharedCacheContext.Provider value={contextValue}>
            {children}
        </SpeedDrinkingUsersSharedCacheContext.Provider>
    );
};

export function useSpeedDrinkingUsersSharedCache(): SharedCache<UserInfo[]> {
    return useContext(SpeedDrinkingUsersSharedCacheContext);
}

export default SpeedDrinkingUsersSharedCacheProvider;
