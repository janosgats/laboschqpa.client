import React from 'react';

export default interface SharedCache<T> {
    data: T;
    isSet: boolean;
    setData: (newData: T) => void;
    clear: () => void;
}