import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import waitFor from "~/utils/waitFor";

interface GetCsrfTokenResponse {
    csrfToken: string;
}

let csrfToken: string;
let isCsrfLoadingPending: boolean = false;
let countOfQueuedWaitingLoadTokenRequests: number = 0;

async function loadCsrfToken() {
    if (countOfQueuedWaitingLoadTokenRequests > 0) {
        await waitFor(() => !isCsrfLoadingPending && countOfQueuedWaitingLoadTokenRequests == 0, 40, 250);
        return;
    }

    ++countOfQueuedWaitingLoadTokenRequests;
    await waitFor(() => isCsrfLoadingPending, 20, 250);
    --countOfQueuedWaitingLoadTokenRequests;

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