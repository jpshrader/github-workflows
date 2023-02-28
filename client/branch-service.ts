import { Octokit } from 'octokit';
import { getResponse, GithubApiResponse } from './github-api-client.js';

/**
 * Creates a PR that merges two branches together. Creates an intermediate branch `merge-{fromBranch}-to-{toBranch}-{timestamp}`
 *
 * @param {Octokit} client Github Octokit client.
 * @param {string} ownerName Owner of the repository.
 * @param {string} repoName Name of the repository.
 * @param {string} sha Commit sha to create from.
 * @param {string} newBranch The new branch to create.
 */
export const createBranch = async (client: Octokit, ownerName: string, repoName: string, sha: string, newBranch: string): Promise<GithubApiResponse<any>> => {
    return getResponse(await client.request('POST /repos/{owner}/{repo}/git/refs', {
        owner: ownerName,
        repo: repoName,
        ref: newBranch,
        sha: sha,
      }));
};

/**
 * Creates a PR that merges two branches together. Creates an intermediate branch `merge-{fromBranch}-to-{toBranch}-{timestamp}`
 *
 * @param {Octokit} client Github Octokit client.
 * @param {string} ownerName Owner of the repository.
 * @param {string} repoName Name of the repository.
 * @param {string} fromBranch The origin branch to merge from.
 * @param {string} toBranch The destination branch to merge into.
 */
export const mergeBranches = async (client: Octokit, ownerName: string, repoName: string, fromBranch: string, toBranch: string): Promise<GithubApiResponse<any>> => {
    return getResponse(await client.request('POST /repos/{owner}/{repo}/merges', {
        owner: ownerName,
        repo: repoName,
        base: fromBranch,
        head: toBranch,
        commit_message: `Merge ${fromBranch} into ${toBranch}`
      }));
};