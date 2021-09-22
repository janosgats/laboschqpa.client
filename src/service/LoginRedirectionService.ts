import {isValidNonEmptyString} from "~/utils/CommonValidators";

const STORAGE_KEY_REDIRECTION_URL = "login.redirection.url";

function peekRedirectionUrl(defaultUrlIfNothingIsSaved: string = null): string | null {
    const loadedUrl = localStorage.getItem(STORAGE_KEY_REDIRECTION_URL);
    if (isValidNonEmptyString(loadedUrl)) {
        return loadedUrl;
    }
    return defaultUrlIfNothingIsSaved;
}

function popRedirectionUrl(defaultUrlIfNothingIsSaved: string = null): string {
    const loadedUrl = localStorage.getItem(STORAGE_KEY_REDIRECTION_URL);
    if (isValidNonEmptyString(loadedUrl)) {
        localStorage.removeItem(STORAGE_KEY_REDIRECTION_URL);
        console.log('Popped redirection url: ' + loadedUrl);
        return loadedUrl;
    }
    return defaultUrlIfNothingIsSaved;
}

function saveRedirectionUrl(url: string): void {
    localStorage.setItem(STORAGE_KEY_REDIRECTION_URL, url);
    console.log('Saved redirection url: ' + url);
}

const LoginRedirectionService = {
    popRedirectionUrl,
    saveRedirectionUrl,
    peekRedirectionUrl,
};

export default LoginRedirectionService;