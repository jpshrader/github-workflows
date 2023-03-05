import { Octokit } from 'octokit';
import { getResponse, GithubApiResponse } from './github-api-client.js';

/**
 * Returns all repositories for the authenticated user.
 *
 * @param   {Octokit} client                    Github Octokit client.
 * @returns {Promise<GithubApiResponse<any>>}   All repositories for the currently authenticated user.
 */
export const getCurrentUserRepos = async (client: Octokit): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('GET /user/repos'));
};