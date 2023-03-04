import { Octokit } from 'octokit';
import { getResponse, GithubApiResponse } from './github-api-client.js';

/**
 * Creates a label.
 *
 * @param {Octokit} client Github Octokit client.
 * @param {string} owner Owner of the repository.
 * @param {string} slug Name of the repository.
 * @param {string} name Name of the label.
 * @param {string} description Description of the label.
 * @param {string} color Hex color of the label (without '#').
 */
export const createLabel = async (client: Octokit, owner: string, slug: string, name: string, description: string, color: string): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('POST /repos/{owner}/{repo}/labels', {
        owner: owner,
        repo: slug,
        name: name,
        description: description,
        color: color
    }));
}

/**
 * Gets a label.
 *
 * @param {Octokit} client Github Octokit client.
 * @param {string} owner Owner of the repository.
 * @param {string} slug Name of the repository.
 * @param {string} name Name of the label.
 */
export const getLabel = async (client: Octokit, owner: string, slug: string, name: string): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('POST /repos/{owner}/{repo}/labels/{name}', {
        owner: owner,
        repo: slug,
        name: name
    }));
}
