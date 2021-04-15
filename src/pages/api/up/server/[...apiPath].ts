import {NextApiHandler, NextApiRequest, NextApiResponse} from "next";
import axios, {AxiosResponse} from "axios";
import {HttpMethod} from "~/utils/Types";

//TODO: This concept is really, really bad... but quick

const allowedTargetEndpoints: Record<string, Array<HttpMethod>> = {
    "/login/oauth2/code/google": ["GET"],
    "/login/oauth2/code/github": ["GET"],
    "/logout": ["POST"],
    "/api/noAuthRequired/registerByEmail/submitEmail": ["POST"],
    "/api/noAuthRequired/registerByEmail/verifyEmail": ["POST"],
    "/api/currentUser/userInfo": ["GET"],
    "/api/currentUser/csrfToken": ["GET"],
    "/api/profileInfo/currentProfileInfo": ["GET"],
    "/api/team/listActiveTeamsWithScores": ["GET"],
    "/api/team/info": ["GET"],
    "/api/team/listMembers": ["GET"],
    "/api/user/info": ["GET"],
    "/api/user/setInfo": ["POST"],
    "/api/newsPost/newsPost": ["GET"],
    "/api/newsPost/listAllWithAttachments": ["GET"],
    "/api/newsPost/edit": ["POST"],
    "/api/newsPost/createNew": ["POST"],
    "/api/newsPost/delete": ["DELETE"],

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
    setRequestHeader('x-csrf-token');

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
        response.json("This endpoint is only accessible for teapots.")
    }
};

export default nextApiHandler;