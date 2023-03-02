import { Octokit } from 'octokit';
import { getResponse, GithubApiResponse } from './github-api-client.js';

/**
 * Creates a PR that merges two branches together.`
 *
 * @param {Octokit} client Github Octokit client.
 * @param {string}  ownerName Owner of the repository.
 * @param {string}  repoName Name of the repository.
 * @param {string}  title Title of the pull request.
 * @param {string}  body Description of the pull request.
 * @param {string}  fromBranch The origin branch to merge from.
 * @param {string}  toBranch The destination branch to merge into.
 */
export const createPullRequest = async (client: Octokit, ownerName: string, repoName: string, title: string, body: string, fromBranch: string, toBranch: string): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('POST /repos/{owner}/{repo}/pulls', {
        owner: ownerName,
        repo: repoName,
        title: title,
        body: body,
        head: fromBranch,
        base: toBranch,
    }));
};

/**
 * Adds reviewers to a PR.`
 *
 * @param {Octokit}  client Github Octokit client.
 * @param {string}   ownerName Owner of the repository.
 * @param {string}   repoName Name of the repository.
 * @param {string}   pullRequestNumber Number Id of the pull request.
 * @param {string[]} reviewers List of usernames to add as reviewers.
 * @param {string[]} teamReviewers List of teams to add as reviewers.
 */
export const addReviewers = async (client: Octokit, ownerName: string, repoName: string, pullRequestNumber: number, reviewers: string[], teamReviewers: string[]): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers', {
        owner: ownerName,
        repo: repoName,
        pull_number: pullRequestNumber,
        reviewers: reviewers,
        team_reviewers: teamReviewers,
    }));
};

/**
 * Adds reviewers to a PR.`
 *
 * @param {Octokit}  client Github Octokit client.
 * @param {string}   ownerName Owner of the repository.
 * @param {string}   repoName Name of the repository.
 * @param {string}   pullRequestNumber Number Id of the pull request.
 * @param {string[]} labels List of labels to add to the PR.
 */
export const addLabels = async (client: Octokit, ownerName: string, repoName: string, pullRequestNumber: number, labels: string[]): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('POST /repos/{owner}/{repo}/issues/{issue_number}/labels', {
        owner: ownerName,
        repo: repoName,
        issue_number: pullRequestNumber,
        labels: labels
    }));
};