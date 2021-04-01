export function isValidTzFormattedDateTime(toValidate: string): boolean {
    const dateTimeRegx = /^\d{4}[-][0|1]\d[-][0-3]\d[T][0-2]\d[:][0-5]\d[:][0-5](\d\.)?\d+[Z]$/;

    return !!String(toValidate).match(dateTimeRegx);
}

export function isValidBoolean(toValidate: string | boolean): boolean {
    const validValues = ["true", true, "false", false];
    return validValues.includes(toValidate);
}

export function isValidNonNegativeNumber(toValidate: number | string): boolean {
    if (typeof toValidate === "string") {
        toValidate = Number.parseFloat(toValidate);
    }

    return toValidate !== null && !isNaN(toValidate) && (toValidate >= 0);
}

export function isValidNumber(toValidate: number | string): boolean {
    if (typeof toValidate === "string") {
        toValidate = Number.parseFloat(toValidate);
    }

    return toValidate !== null && !isNaN(toValidate);
}


export function isValidNonEmptyString(toValidate: string): boolean {
    return typeof toValidate === "string" && toValidate.length > 0;
}
