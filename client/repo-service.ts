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
 * Gets a file at a given path.
 *
 * @param   {Octokit} client                    Github Octokit client.
 * @param   {string}  owner                     Owner of the repository.
 * @param   {string}  slug                      Name of the repository.
 * @param   {string}  branch                    Branch name to fetch file.
 * @param   {string}  filePath                  Path to find the file.
 * @returns {Promise<GithubApiResponse<any>>}
 */
export const getFile = async (client: Octokit, owner: string, slug: string, branch: string, filePath: string): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: owner,
        repo: slug,
        path: filePath,
        ref: branch,
    }));
};

/**
 * Creates a file at a given path.
 *
 * @param   {Octokit} client                    Github Octokit client.
 * @param   {string}  owner                     Owner of the repository.
 * @param   {string}  slug                      Name of the repository.
 * @param   {string}  branch                    Branch name to add/update file.
 * @param   {string}  filePath                  Path to add the file.
 * @param   {string}  content                   Contents of the file.
 * @param   {string}  message                   Commit message.
 * @param   {string}  sha                       Sha of the blob being replaced.
 * @returns {Promise<GithubApiResponse<any>>}
 */
export const createOrUpdateFile = async (client: Octokit, owner: string, slug: string, branch: string, filePath: string, content: string, message: string, sha: string): Promise<GithubApiResponse<any>> => {
    const encodedContent = Buffer.from(content).toString('base64');
    return getResponse(async () => await client.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: owner,
        repo: slug,
        path: filePath,
        message: message,
        content: encodedContent,
        branch: branch,
        sha: sha,
    }));
};

/**
 * Deletes a file at a given path.
 *
 * @param   {Octokit} client                    Github Octokit client.
 * @param   {string}  owner                     Owner of the repository.
 * @param   {string}  slug                      Name of the repository.
 * @param   {string}  branch                    Branch name to add/update file.
 * @param   {string}  sha                       The blob SHA of the file being deleted.
 * @param   {string}  filePath                  Path to add the file.
 * @param   {string}  message                   Commit message.
 * @returns {Promise<GithubApiResponse<any>>}
 */
export const deleteFile = async (client: Octokit, owner: string, slug: string, branch: string, filePath: string, sha: string, message: string): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
        owner: owner,
        repo: slug,
        path: filePath,
        message: message,
        sha: sha,
        branch: branch,
    }));
};