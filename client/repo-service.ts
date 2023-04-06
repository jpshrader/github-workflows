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

/**
 * Returns all repositories for the authenticated user.
 *
 * @param   {Octokit} client                    Github Octokit client.
 * @param   {string}  owner                     Owner of the repository.
 * @param   {string}  slug                      Name of the repository.
 * @param   {string}  branch                    Branch name to add/update file.
 * @param   {string}  filePath                  Path to add the file.
 * @param   {string}  content                   Contents of the file.
 * @param   {string}  message                   Commit message.
 * @returns {Promise<GithubApiResponse<any>>}   All repositories for the currently authenticated user.
 */
export const createOrUpdateFile = async (client: Octokit, owner: string, slug: string, branch: string, filePath: string, content: string, message: string): Promise<GithubApiResponse<any>> => {
    const encodedContent = Buffer.from(content, 'base64').toString('base64');
    return getResponse(async () => await client.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: owner,
        repo: slug,
        path: filePath,
        message: message,
        content: encodedContent,
        branch: branch,
    }));
};