import {NextApiHandler, NextApiRequest, NextApiResponse} from "next";
import axios, {AxiosResponse} from "axios";
import {HttpMethod} from "~/utils/Types";
import {
    OAUTH2_OVERRIDE_REDIRECTION_ORIGIN_HEADER_NAME,
    OAUTH2_OVERWRITE_REDIRECTION_REQUEST_HEADER_NAME
} from "~/components/join/LoginForm";
import {CSRF_TOKEN_HEADER_NAME} from "~/utils/api/callJsonEndpoint";

//TODO: This concept is really, really bad (and auth is pushed one layer further in)... but quick

const allowedTargetEndpoints: Record<string, Array<HttpMethod>> = {
    "/login/oauth2/google": ["GET"],
    "/login/oauth2/github": ["GET"],
    "/login/oauth2/code/google": ["GET"],
    "/login/oauth2/code/github": ["GET"],
    "/logout": ["POST"],

    "/api/noAuthRequired/register/createNewAccountFromSessionOAuthInfo": ["POST"],

    "/api/noAuthRequired/emailVerification/verify": ["POST"],

    "/api/emailAddress/listOwnAddresses": ["GET"],
    "/api/emailAddress/deleteOwnEmailAddress": ["DELETE"],
    "/api/emailAddress/submitNewAddress": ["POST"],
    "/api/emailAddress/listAddressesOfUser": ["GET"],

    "/api/currentUser/userInfoWithAuthoritiesAndTeam": ["GET"],
    "/api/currentUser/csrfToken": ["GET"],

    "/api/profileInfo/currentProfileInfo": ["GET"],

    "/api/team/editTeam": ["POST"],
    "/api/team/listActiveTeamsWithScores": ["GET"],
    "/api/team/listAll": ["GET"],
    "/api/team/info": ["GET"],
    "/api/team/listMembers": ["GET"],
    "/api/team/listApplicants": ["GET"],
    "/api/team/createNewTeam": ["POST"],
    "/api/team/applyToTeam": ["POST"],
    "/api/team/cancelApplicationToTeam": ["POST"],
    "/api/team/declineApplicationToTeam": ["POST"],
    "/api/team/approveApplicationToTeam": ["POST"],
    "/api/team/leaveTeam": ["POST"],
    "/api/team/kickFromTeam": ["POST"],
    "/api/team/archiveAndLeaveTeam": ["POST"],
    "/api/team/giveLeaderRights": ["POST"],
    "/api/team/takeAwayLeaderRights": ["POST"],
    "/api/team/resignFromLeadership": ["POST"],

    "/api/teamScore/find": ["GET"],
    "/api/teamScore/edit": ["POST"],
    "/api/teamScore/createNew": ["POST"],
    "/api/teamScore/delete": ["DELETE"],

    "/api/objectiveAcceptance/isAccepted": ["GET"],
    "/api/objectiveAcceptance/setAcceptance": ["POST"],

    "/api/user/info": ["GET"],
    "/api/user/infoWithAuthorities": ["GET"],
    "/api/user/setInfo": ["POST"],
    "/api/user/listAll": ["GET"],
    "/api/user/listAllEnabledWithTeamName": ["GET"],
    "/api/user/usersPage/listAllEnabled": ["GET"],

    "/api/newsPost/listAllWithAttachments": ["GET"],
    "/api/newsPost/newsPost": ["GET"],
    "/api/newsPost/edit": ["POST"],
    "/api/newsPost/createNew": ["POST"],
    "/api/newsPost/delete": ["DELETE"],

    "/api/objective/listAll": ["GET"],
    "/api/objective/listObjectivesBelongingToProgram": ["GET"],
    "/api/objective/listForDisplay": ["POST"],
    "/api/objective/objective": ["GET"],
    "/api/objective/edit": ["POST"],
    "/api/objective/createNew": ["POST"],
    "/api/objective/delete": ["DELETE"],

    "/api/submission/display/list": ["POST"],
    "/api/submission/submission": ["GET"],
    "/api/submission/edit": ["POST"],
    "/api/submission/createNew": ["POST"],
    "/api/submission/delete": ["DELETE"],

    "/api/speedDrinking/display/list": ["POST"],
    "/api/speedDrinking/display/get": ["GET"],
    "/api/speedDrinking/edit": ["POST"],
    "/api/speedDrinking/createNew": ["POST"],
    "/api/speedDrinking/delete": ["DELETE"],

    "/api/riddleEditor/listAll": ["GET"],
    "/api/riddleEditor/listProgressOfTeams": ["GET"],
    "/api/riddleEditor/riddle": ["GET"],
    "/api/riddleEditor/createNew": ["POST"],
    "/api/riddleEditor/edit": ["POST"],
    "/api/riddleEditor/delete": ["DELETE"],

    "/api/riddle/listAccessibleRiddles": ["GET"],
    "/api/riddle/riddle": ["GET"],
    "/api/riddle/useHint": ["POST"],
    "/api/riddle/submitSolution": ["POST"],

    "/api/admin/users/logInAsUser": ["POST"],

    "/api/file/readBulkAttachmentInfo": ["POST"],
    "/api/file/info": ["GET"],
    "/api/file/delete": ["DELETE"],

    "/api/acceptedEmail/listAll": ["GET"],
    "/api/acceptedEmail/addEmails": ["POST"],
    "/api/acceptedEmail/recalculateAll": ["POST"],
    "/api/acceptedEmail/recalculateByEmail": ["POST"],
    "/api/acceptedEmail/recalculateByUserId": ["POST"],
    "/api/acceptedEmail/delete": ["DELETE"],

    "/api/admin/authority/user/add": ["POST"],
    "/api/admin/authority/user/delete": ["DELETE"],

    "/api/event/listPersonalEventsForUser": ["GET"],
    "/api/event/listTeamEventsForUser": ["GET"],
    "/api/event/registration/personal/register": ["POST"],
    "/api/event/registration/personal/deRegister": ["POST"],
    "/api/event/registration/team/register": ["POST"],
    "/api/event/registration/team/deRegister": ["POST"],
    "/api/event/listAllRegisteredUsers": ["GET"],
    "/api/event/listAllRegisteredTeams": ["GET"],

    "/api/program/listAll": ["GET"],
    "/api/program/listAllWithTeamScore": ["GET"],
    "/api/program/teamScore": ["GET"],
    "/api/program/createNew": ["POST"],
    "/api/program/delete": ["DELETE"],
    "/api/program/edit": ["POST"],
    "/api/program/program": ["GET"],

    "/api/qrFight/fightStats": ["GET"],
    "/api/qrFight/listEnabledAreas": ["GET"],
    "/api/qrFight/submit": ["POST"],

    "/api/admin/file/listSucceededImageVariantIdsOfFile": ["GET"],
    "/api/admin/file/markImageVariantFileAsCorrupt": ["POST"],
}

function isEndpointAllowed(method: HttpMethod, url: string): boolean {
    const bareUrl: string = url.split("?")[0];

    const allowedMethods: Array<HttpMethod> = allowedTargetEndpoints[bareUrl];

    if (!allowedMethods) {
        return false;
    }
    return allowedMethods.includes(method);
}

async function proxyToServer(targetMethod: HttpMethod, targetUrl: string, request: NextApiRequest, response: NextApiResponse) {
    const headersToSend: Record<string, string | string[]> = {};

    function setRequestHeader(headerName: string) {
        if (typeof request.headers[headerName] !== 'undefined') {
            headersToSend[headerName] = request.headers[headerName];
        }
    }

    setRequestHeader('cookie');
    setRequestHeader('content-type');
    setRequestHeader('accept');
    setRequestHeader(CSRF_TOKEN_HEADER_NAME.toLowerCase());
    setRequestHeader(OAUTH2_OVERWRITE_REDIRECTION_REQUEST_HEADER_NAME.toLowerCase());
    setRequestHeader(OAUTH2_OVERRIDE_REDIRECTION_ORIGIN_HEADER_NAME.toLowerCase());

    const apiResponse: AxiosResponse = await axios({
        method: targetMethod,
        url: 'http://server-cluster-ip:8080' + targetUrl,
        headers: headersToSend,
        data: request.body,
        validateStatus: (status: number) => {
            return true;
        }
    });

    response.status(apiResponse.status);

    function setResponseHeader(headerName: string) {
        if (typeof apiResponse.headers[headerName] !== 'undefined') {
            response.setHeader(headerName, apiResponse.headers[headerName]);
        }
    }

    setResponseHeader('set-cookie');
    setResponseHeader('content-type');
    setResponseHeader('accept');
    setResponseHeader('location');

    response.send(apiResponse.data)
}

export const nextApiHandler: NextApiHandler = async (
    request: NextApiRequest,
    response: NextApiResponse
): Promise<void> => {
    const targetMethod: HttpMethod = request.method.toUpperCase() as HttpMethod;
    const targetUrl = request.url.substring("/api/up/server".length);

    if (isEndpointAllowed(targetMethod, targetUrl)) {
        await proxyToServer(targetMethod, targetUrl, request, response);
    } else {
        response.status(418)
        response.send("This endpoint is only accessible for teapots.")
    }
};

export default nextApiHandler;