export enum GlobalCacheKey {
    SPEED_DRINKING_USERS = 'speedDrinkingUsers',
}

const cacheMap: Map<GlobalCacheKey, any> = new Map<GlobalCacheKey, any>();

export interface GlobalCache<T> {
    key: GlobalCacheKey;
    data: T;
    isSet: boolean;
    setData: (newData: T) => void;
    clear: () => void;
}

function useGlobalCache<T>(key: GlobalCacheKey): GlobalCache<T> {
    function setData(newData: T) {
        cacheMap.set(key, newData);
    }

    function clear() {
        cacheMap.delete(key);
    }

    return {
        key: key,
        data: cacheMap.get(key),
        setData: setData,
        clear: clear,
        isSet: cacheMap.has(key),
    };
}

export default useGlobalCache;
