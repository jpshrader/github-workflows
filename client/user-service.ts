import { Octokit } from 'octokit';
import { getResponse, GithubApiResponse } from './github-api-client.js';

/**
 * Returns the authenticated user.
 *
 * @param   {Octokit} client                  Github Octokit client.
 * @returns {Promise<GithubApiResponse<any>>} The authenticated user
 */
export const getCurrentUser = async (client: Octokit): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('GET /user'));
};

/**
 * Returns a given user.
 *
 * @param   {Octokit} client                  Github Octokit client.
 * @returns {Promise<GithubApiResponse<any>>} The specified user
 */
export const getUser = async (client: Octokit, userName: string): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('GET /users/{username}', {
        username: userName
    }));
};