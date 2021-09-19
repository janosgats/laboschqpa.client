import React, {FC, useState} from "react";
import {getSurelyDate, isDateTextInputValid} from "~/utils/DateHelpers";

interface TempDatetimePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    disabled: boolean;
}

function padToTwoChars(num: number): string {
    if (num >= 10) {
        return num.toString();
    }
    return "0" + num.toString();
}

/**
 * TODO: Replace this ugliness with a MUI component
 */
const TempDatetimePicker: FC<TempDatetimePickerProps> = ({value, onChange, disabled}) => {
    const valueDate = getSurelyDate(value);
    const [internalValue, setInternalValue] = useState<string>(
        valueDate
            ? `${valueDate.getFullYear()}-${padToTwoChars(valueDate.getMonth() + 1)}-${padToTwoChars(valueDate.getDate())} ` +
            `${padToTwoChars(valueDate.getHours())}:${padToTwoChars(valueDate.getMinutes())}:${padToTwoChars(valueDate.getSeconds())}`
            : ""
    );
    const [isError, setIsError] = useState<boolean>(!isDateTextInputValid(internalValue));

    return (
        <>
            <input
                value={internalValue}
                onChange={(e) => {
                    setInternalValue(e.target.value);
                    if (isDateTextInputValid(e.target.value)) {
                        setIsError(false);
                        onChange(new Date(e.target.value));
                    } else {
                        setIsError(true);
                    }
                }}
                disabled={disabled}
            />
            {isError && "datetime error TODO: use MUI"}
        </>
    );
};

export default TempDatetimePicker;