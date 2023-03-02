import { Octokit } from 'octokit';
import { getResponse, GithubApiResponse } from './github-api-client.js';

/**
 * Creates a label.
 *
 * @param {Octokit} client Github Octokit client.
 * @param {string} ownerName Owner of the repository.
 * @param {string} repoName Name of the repository.
 * @param {string} name Name of the label.
 * @param {string} description Description of the label.
 * @param {string} color Hex color of the label (without '#').
 */
export const createLabel = async (client: Octokit, ownerName: string, repoName: string, name: string, description: string, color: string): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('POST /repos/{owner}/{repo}/labels', {
        owner: ownerName,
        repo: repoName,
        name: name,
        description: description,
        color: color
    }));
}

/**
 * Gets a label.
 *
 * @param {Octokit} client Github Octokit client.
 * @param {string} ownerName Owner of the repository.
 * @param {string} repoName Name of the repository.
 * @param {string} name Name of the label.
 */
export const getLabel = async (client: Octokit, ownerName: string, repoName: string, name: string): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('POST /repos/{owner}/{repo}/labels/{name}', {
        owner: ownerName,
        repo: repoName,
        name: name
    }));
}
