// This hook will return false for a specified amunt of time, even if the state is set to true

import React, {useEffect} from 'react';

export function useDelayedToggle(initialValue: boolean, delay = 250): [boolean, React.Dispatch<boolean>] {
    const [realState, setRealState] = React.useState<boolean>(initialValue);
    const [returnedState, setReturnedState] = React.useState<boolean>(false);

    useEffect(() => {
        if (realState && delay) {
            let timeout = setTimeout(() => {
                setReturnedState(realState);
            }, delay);
            return () => timeout && clearTimeout(timeout);
        }

        setReturnedState(realState);
    }, [realState, delay]);

    return [returnedState, setRealState];
}
