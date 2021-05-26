import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import Exception from "~/exception/Exception";

let csrfToken: string;

async function loadCsrfToken() {
    await callJsonEndpoint<string>({
            conf: {
                url: "/api/up/server/api/currentUser/csrfToken"
            }
        }
    ).then((res) => {
        csrfToken = res.data;
    }).catch(reason => {
        throw new Exception("Could not retrieve CSRF token from the server", reason)
    });
}

export function isCsrfTokenLoaded(): boolean {
    return csrfToken && typeof csrfToken === 'string' && csrfToken.length > 0;
}

export async function getCsrfToken(): Promise<string> {
    if (!isCsrfTokenLoaded()) {
        await loadCsrfToken();
    }
    // We have to double-tap when new users are created. It's possible that the CSRF token comes back empty. Not sure why.
    if (!isCsrfTokenLoaded()) {
        await loadCsrfToken();
    }
    return csrfToken;
}

