import { Octokit } from 'octokit';
import { getResponse, GithubApiResponse } from './github-api-client.js';

/**
 * Creates a PR that merges two branches together.`
 *
 * @param {Octokit} client Github Octokit client.
 * @param {string} ownerName Owner of the repository.
 * @param {string} repoName Name of the repository.
 * @param {string} sha Commit sha to create from.
 * @param {string} ref Fully qualified branch name (ex. `refs/head/{branch_name}`).
 */
export const createBranch = async (client: Octokit, ownerName: string, repoName: string, sha: string, ref: string): Promise<GithubApiResponse<any>> => {
    return getResponse(await client.request('POST /repos/{owner}/{repo}/git/refs', {
        owner: ownerName,
        repo: repoName,
        ref: ref,
        sha: sha,
      }));
};