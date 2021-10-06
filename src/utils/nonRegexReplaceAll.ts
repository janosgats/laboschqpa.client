/**
 * This function is here because string.replaceAll() is not supported in all browsers.
 * @param ms
 */
import {isValidNonEmptyString} from "~/utils/CommonValidators";

export default function nonRegexReplaceAll(subject: string, searchValue: string, replaceValue: string): string {
    if (!isValidNonEmptyString(subject)) {
        return '';
    }

    let replaced = '';

    const searchLength: number = searchValue.length;
    if (searchLength === 0) {
        return subject;
    }

    for (let i = 0; i < subject.length;) {
        if (i < subject.length - searchLength + 1 && subject.substring(i, i + searchLength) === searchValue) {
            replaced += replaceValue;
            i += searchLength;
        } else {
            replaced += subject[i];
            ++i;
        }
    }

    return replaced;
}
