import {NextRouter} from "next/router";


/**
 * Fill this array with QrTag IDs that should be diverted.
 */
const deferredQrTagIds = [];

/**
 * This function lets us "turn off" leftover old QrTags so new Users won't hit the registration/login interface
 * and won't be lead through the registration process unnecessarily. This protects against ORGANIC DDoS.
 */
function shouldDivertRequest(router: NextRouter): boolean {
    if(!router.pathname.startsWith('/qrFight/submitTag')){
        return false;
    }

    return deferredQrTagIds.includes(Number.parseInt(router.query['tagId'] as string));
}

export function applyOrganicDDoSProtection(router: NextRouter) {
    if (shouldDivertRequest(router)) {
        location.replace('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    }
}