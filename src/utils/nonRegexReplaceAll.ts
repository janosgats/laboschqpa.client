/**
 * This function is here because string.replaceAll() is not supported in all browsers.
 * @param ms
 */
import {isValidNonEmptyString} from "~/utils/CommonValidators";

export default function nonRegexReplaceAll(subject: string, searchValue: string, replaceValue: string): string {
    if (!isValidNonEmptyString(subject)) {
        return '';
    }

    let processed = subject;

    while (processed.includes(searchValue)) {
        processed = processed.replace(searchValue, replaceValue);
    }

    return processed;
}