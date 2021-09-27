import {isValidNonEmptyString} from "~/utils/CommonValidators";
import {UserNameContainer} from "~/model/UserInfo";
import getUrlFriendlyString from "~/utils/getUrlFriendlyString";

function getBasicDisplayName(userNameContainer: UserNameContainer, defaultName: string = 'N/A'): string {
    if (!userNameContainer) {
        return defaultName;
    }

    if (isValidNonEmptyString(userNameContainer.nickName)
        && (isValidNonEmptyString(userNameContainer.firstName) || isValidNonEmptyString(userNameContainer.lastName))) {
        return userNameContainer.nickName + " - " + userNameContainer.firstName + " " + userNameContainer.lastName;
    }

    if (isValidNonEmptyString(userNameContainer.nickName)) {
        return userNameContainer.nickName;
    }
    if (isValidNonEmptyString(userNameContainer.firstName) || isValidNonEmptyString(userNameContainer.lastName)) {
        return userNameContainer.firstName + " " + userNameContainer.lastName;
    }
    return defaultName;
}

function getUrlName(userNameContainer: UserNameContainer, defaultName: string = 'u'): string {
    let unsafeUrlPart = defaultName;

    if (!userNameContainer) {
        unsafeUrlPart = defaultName;
    } else if (isValidNonEmptyString(userNameContainer.nickName)
        && (isValidNonEmptyString(userNameContainer.firstName) || isValidNonEmptyString(userNameContainer.lastName))) {
        unsafeUrlPart = userNameContainer.nickName + "_" + userNameContainer.firstName + "_" + userNameContainer.lastName;
    } else if (isValidNonEmptyString(userNameContainer.nickName)) {
        unsafeUrlPart = userNameContainer.nickName;
    } else if (isValidNonEmptyString(userNameContainer.firstName) || isValidNonEmptyString(userNameContainer.lastName)) {
        unsafeUrlPart = userNameContainer.firstName + "_" + userNameContainer.lastName;
    }

    return getUrlFriendlyString(unsafeUrlPart);
}

function getFullName(userNameContainer: UserNameContainer, defaultName: string = 'N/A'): string {
    if (!userNameContainer) {
        return defaultName;
    }

    if (isValidNonEmptyString(userNameContainer.firstName) || isValidNonEmptyString(userNameContainer.lastName)) {
        return userNameContainer.firstName + " " + userNameContainer.lastName;
    }

    return defaultName;
}

function getNickName(userNameContainer: UserNameContainer, defaultName: string = 'N/A'): string {
    if (!userNameContainer) {
        return defaultName;
    }

    if (isValidNonEmptyString(userNameContainer.nickName)) {
        return userNameContainer.nickName;
    }

    return defaultName;
}

export default {
    getBasicDisplayName,
    getFullName,
    getNickName,
    getUrlName
};