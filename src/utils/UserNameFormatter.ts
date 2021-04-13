import {isValidNonEmptyString} from "~/utils/CommonValidators";
import {UserNameContainer} from "~/model/UserInfo";

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
    if (!userNameContainer) {
        return defaultName;
    }

    if (isValidNonEmptyString(userNameContainer.nickName)
        && (isValidNonEmptyString(userNameContainer.firstName) || isValidNonEmptyString(userNameContainer.lastName))) {
        return userNameContainer.nickName + "_" + userNameContainer.firstName + "_" + userNameContainer.lastName;
    }

    if (isValidNonEmptyString(userNameContainer.nickName)) {
        return userNameContainer.nickName;
    }
    if (isValidNonEmptyString(userNameContainer.firstName) || isValidNonEmptyString(userNameContainer.lastName)) {
        return userNameContainer.firstName + "_" + userNameContainer.lastName;
    }

    return defaultName;
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