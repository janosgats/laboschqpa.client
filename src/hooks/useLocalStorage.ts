import {Dispatch, SetStateAction, useState} from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
    const [state, _setState] = useState<{isInitialized: boolean; value: T}>(() => {
        if (!process.browser) return {isInitialized: false, value: null};
        let s = initialValue;
        try {
            const ss = localStorage.getItem(key);

            if (ss) s = JSON.parse(ss);
            else localStorage.setItem(key, JSON.stringify(s));
        } catch {
            localStorage.setItem(key, JSON.stringify(s));
        }
        return {isInitialized: true, value: s};
    });

    const setState = (newState) => {
        if (!Object.is(state.value, newState)) {
            localStorage.setItem(key, JSON.stringify(newState));
            _setState({...state, value: newState});
        }
    };

    return [state.value, setState];
}

export default useLocalStorage;
