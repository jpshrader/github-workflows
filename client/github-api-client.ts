import { OctokitResponse, ResponseHeaders, Url } from '@octokit/types';
import { Octokit } from 'octokit';

export const getGithubApiClient = (apiToken: string): Octokit => {
    return new Octokit({
        auth: apiToken
    });
};

export async function getResponse<T>(getOctokitResponse: () => Promise<OctokitResponse<T>>): Promise<GithubApiResponse<T>> {
    try {
        const res = await getOctokitResponse();
        return new GithubApiResponse(res.url, res.data, res.headers, res.status);
    } catch (e) {
        if (e.response) {
            return new GithubApiResponse(e.response.url, e.response.data, e.response.headers, e.response.status);
        }
        return new GithubApiResponse('', e, {}, 500);
    }
}

export class GithubApiResponse<T> {
    statusCode: number;
    data: T;
    headers: ResponseHeaders;
    url: Url;

    constructor(url: string, data: T, headers: ResponseHeaders, statusCode: number) {
        this.url = url;
        this.data = data;
        this.headers = headers;
        this.statusCode = statusCode;
    }

    /**
     * Returns true if the status code is between 200 and 299.
     * @returns {boolean} True if the status code is between 200 and 299.
     */
    isSuccess(): boolean {
        return this.statusCode >= 200 && this.statusCode <= 299;
    }
}
