import { OctokitResponse, ResponseHeaders, Url } from '@octokit/types';
import { Octokit } from 'octokit';

export const getGithubApiClient = (apiToken: string): Octokit => {
    return new Octokit({
        auth: apiToken
    });
};

export function getResponse<T>(octokitResponse: OctokitResponse<T>): GithubApiResponse<T> {
    return new GithubApiResponse(
        octokitResponse.url,
        octokitResponse.data,
        octokitResponse.headers,
        octokitResponse.status);
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
     * 
     * @returns 
     */
    isSuccess(): boolean {
        return this.statusCode >= 200 && this.statusCode <= 299;
    }
}
