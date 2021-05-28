import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";

interface GetCsrfTokenResponse {
    csrfToken: string;
}

let csrfToken: string;
let isCsrfLoadingPending: boolean = false;

function sleep(ms: number): Promise<number> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadCsrfToken() {
    for (let i = 0; i < 20 && isCsrfLoadingPending; ++i) {
        await sleep(250);
    }

    isCsrfLoadingPending = true;
    await callJsonEndpoint<GetCsrfTokenResponse>({
            conf: {
                url: "/api/up/server/api/currentUser/csrfToken"
            },
            acceptedResponseCodes: [200, 403]
        }
    ).then((res) => {
        console.log("loadCsrfToken response", [res.status, res.data]);
        if (res.status === 200) {
            csrfToken = res.data.csrfToken;
        }
    }).catch(reason => {
        let message = undefined;
        if (reason instanceof Error) {
            message = reason.message;
        }
        EventBus.notifyError(message, 'Could not retrieve CSRF token');
    }).finally(() => {
        isCsrfLoadingPending = false;
    });
}

export function isCsrfTokenLoaded(): boolean {
    return csrfToken && typeof csrfToken === 'string' && csrfToken.length > 0;
}

export async function getCsrfToken(): Promise<string> {
    if (!isCsrfTokenLoaded()) {
        await loadCsrfToken();
    }
    return csrfToken;
}

export async function reloadCsrfToken() {
    await loadCsrfToken();
}