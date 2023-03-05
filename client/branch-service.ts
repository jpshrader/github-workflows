import { Octokit } from 'octokit';
import { getResponse, GithubApiResponse } from './github-api-client.js';

/**
 * Creates a branch.
 *
 * @param {Octokit} client  Github Octokit client.
 * @param {string}  owner   Owner of the repository.
 * @param {string}  slug    Name of the repository.
 * @param {string}  sha     Commit sha to create from.
 * @param {string}  ref     Fully qualified branch name (ex. `refs/head/{branch_name}`).
 */
export const createBranch = async (client: Octokit, owner: string, slug: string, sha: string, ref: string): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('POST /repos/{owner}/{repo}/git/refs', {
        owner: owner,
        repo: slug,
        ref: ref,
        sha: sha,
    }));
};

/**
 * Gets a branch.
 *
 * @param {Octokit} client      Github Octokit client.
 * @param {string}  owner       Owner of the repository.
 * @param {string}  slug        Name of the repository.
 * @param {string}  branchName  Branch name to fetch
 */
export const getBranch = async (client: Octokit, owner: string, slug: string, branchName: string): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('GET /repos/{owner}/{repo}/branches/{branch}', {
        owner: owner,
        repo: slug,
        branch: branchName,
    }));
};

/**
 * Merges one branch into another.
 *
 * @param {Octokit} client      Github Octokit client.
 * @param {string}  owner       Owner of the repository.
 * @param {string}  slug        Name of the repository.
 * @param {string}  from_branch Branch to merge from.
 * @param {string}  to_branch   Branch to merge into.
 * @param {string}  message     Commit message.
 */
export const mergeBranches = async (client: Octokit, owner: string, slug: string, from_branch: string, to_branch: string, message: string): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('POST /repos/{owner}/{repo}/merges', {
        owner: owner,
        repo: slug,
        base: to_branch,
        head: from_branch,
        commit_message: message
    }));
};

/**
 * Merges one branch into another.
 *
 * @param {Octokit} client      Github Octokit client.
 * @param {string}  owner       Owner of the repository.
 * @param {string}  slug        Name of the repository.
 * @param {string}  from_branch Branch to compare from.
 * @param {string}  to_branch   Branch to compare into.
 */
export const compareBranches = async (client: Octokit, owner: string, slug: string, from_branch: string, to_branch: string): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('GET /repos/{owner}/{repo}/compare/{basehead}', {
        owner: owner,
        repo: slug,
        basehead: `${to_branch}...${from_branch}`,
    }));
};