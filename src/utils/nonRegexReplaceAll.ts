/**
 * This function is here because string.replaceAll() is not supported in all browsers.
 * @param ms
 */
import {isValidNonEmptyString} from "~/utils/CommonValidators";

export default function nonRegexReplaceAll(subject: string, searchValue: string, replaceValue: string): string {
    if (!isValidNonEmptyString(subject)) {
        return '';
    }
    //TODO: this has a bug that breaks speeddrinking user slection. Fix it later. now just "reverting" it with a quick github edit
return subject.replaceAll(searchValue,replaceValue);
    let processed = subject;

    while (processed.includes(searchValue)) {
        processed = processed.replace(searchValue, replaceValue);
    }

    return processed;
}
