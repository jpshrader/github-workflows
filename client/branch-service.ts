import { Octokit } from 'octokit';
import { getResponse, GithubApiResponse } from './github-api-client.js';

/**
 * Creates a branch.
 *
 * @param {Octokit} client Github Octokit client.
 * @param {string} ownerName Owner of the repository.
 * @param {string} repoName Name of the repository.
 * @param {string} sha Commit sha to create from.
 * @param {string} ref Fully qualified branch name (ex. `refs/head/{branch_name}`).
 */
export const createBranch = async (client: Octokit, ownerName: string, repoName: string, sha: string, ref: string): Promise<GithubApiResponse<any>> => {
  return getResponse(async () => await client.request('POST /repos/{owner}/{repo}/git/refs', {
    owner: ownerName,
    repo: repoName,
    ref: ref,
    sha: sha,
  }));
};

/**
 * Gets a branch.
 *
 * @param {Octokit} client Github Octokit client.
 * @param {string} ownerName Owner of the repository.
 * @param {string} repoName Name of the repository.
 * @param {string} branchName Branch name to fetch
 */
export const getBranch = async (client: Octokit, ownerName: string, repoName: string, branchName: string): Promise<GithubApiResponse<any>> => {
  return getResponse(async () => await client.request('GET /repos/{owner}/{repo}/branches/{branch}', {
    owner: ownerName,
    repo: repoName,
    branch: branchName,
  }));
};

/**
 * Merges one branch into another.
 *
 * @param {Octokit} client Github Octokit client.
 * @param {string} ownerName Owner of the repository.
 * @param {string} repoName Name of the repository.
 * @param {string} from_branch Branch to merge from.
 * @param {string} to_branch Branch to merge into.
 * @param {string} message Commit message.
 */
export const mergeBranches = async (client: Octokit, ownerName: string, repoName: string, from_branch: string, to_branch: string, message: string): Promise<GithubApiResponse<any>> => {
  return getResponse(async () => await client.request('POST /repos/{owner}/{repo}/merges', {
    owner: ownerName,
    repo: repoName,
    base: to_branch,
    head: from_branch,
    commit_message: message
  }));
};

/**
 * Merges one branch into another.
 *
 * @param {Octokit} client Github Octokit client.
 * @param {string} ownerName Owner of the repository.
 * @param {string} repoName Name of the repository.
 * @param {string} from_branch Branch to compare from.
 * @param {string} to_branch Branch to compare into.
 */
export const compareBranches = async (client: Octokit, ownerName: string, repoName: string, from_branch: string, to_branch: string): Promise<GithubApiResponse<any>> => {
  return getResponse(async () => await client.request('GET /repos/{owner}/{repo}/compare/{basehead}', {
    owner: ownerName,
    repo: repoName,
    basehead: `${to_branch}...${from_branch}`,
  }));
};