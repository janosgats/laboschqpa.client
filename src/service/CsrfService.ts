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
    return !!csrfToken;
}

export async function getCsrfToken(): Promise<string> {
    if (!isCsrfTokenLoaded()) {
        await loadCsrfToken();
    }
    return csrfToken;
}

