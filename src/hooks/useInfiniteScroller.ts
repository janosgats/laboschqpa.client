import {useState} from "react";

export interface UseInfiniteScrollerCommand {
    startingShowCount: number;
}

export interface InfiniteScroller {
    shownCount: number;
    canShownCountBeIncreased: boolean;

    setMaxLength: (maxLength: number) => void;
    increaseShownCount: (incrementBy: number) => void;
    setCurrentShownCount: (count: number) => void;
    resetCurrentShownCount: () => void;
}

/**
 * This is a browser-only infinite scroller. It's only useful to defer the loading of images.
 */
const useInfiniteScroller = (
    {startingShowCount}: UseInfiniteScrollerCommand
): InfiniteScroller => {
    const [maxLength, setMaxLength] = useState<number>(0)
    const [shownCount, setShownCount] = useState<number>(startingShowCount)

    function increaseShownCount(incrementBy: number) {
        setShownCount(shownCount + incrementBy);
    }
    function setCurrentShownCount(count: number) {
        setShownCount(count);
    }
    function resetCurrentShownCount() {
        setShownCount(startingShowCount);
    }

    return {
        shownCount: shownCount,
        canShownCountBeIncreased: shownCount < maxLength,
        setMaxLength: setMaxLength,
        increaseShownCount: increaseShownCount,
        setCurrentShownCount: setCurrentShownCount,
        resetCurrentShownCount: resetCurrentShownCount,
    };
};

export default useInfiniteScroller;
