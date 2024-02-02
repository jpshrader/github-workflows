import { Octokit } from 'octokit';
import { getResponse, GithubApiResponse } from './github-api-client.js';

/**
 * Creates a PR that merges two branches together.
 *
 * @param {Octokit} client      Github Octokit client.
 * @param {string}  owner       Owner of the repository.
 * @param {string}  slug        Name of the repository.
 * @param {string}  title       Title of the pull request.
 * @param {string}  body        Description of the pull request.
 * @param {string}  fromBranch  The origin branch to merge from.
 * @param {string}  toBranch    The destination branch to merge into.
 * @param {boolean} isDraft     Whether the PR is opened as a 'Draft'. Defaults to `false`.
 */
export const createPullRequest = async (client: Octokit, owner: string, slug: string, title: string, body: string, fromBranch: string, toBranch: string, isDraft: boolean = false): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('POST /repos/{owner}/{repo}/pulls', {
        owner: owner,
        repo: slug,
        title: title,
        body: body,
        head: fromBranch,
        base: toBranch,
        draft: isDraft,
    }));
};

/**
 * Adds reviewers to a PR.
 *
 * @param {Octokit}  client             Github Octokit client.
 * @param {string}   owner              Owner of the repository.
 * @param {string}   slug               Name of the repository.
 * @param {number}   pullRequestNumber  Number Id of the pull request.
 * @param {string[]} reviewers          List of usernames to add as reviewers.
 * @param {string[]} teamReviewers      List of teams to add as reviewers.
 */
export const addReviewers = async (client: Octokit, owner: string, slug: string, pullRequestNumber: number, reviewers: string[], teamReviewers: string[]): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers', {
        owner: owner,
        repo: slug,
        pull_number: pullRequestNumber,
        reviewers: reviewers,
        team_reviewers: teamReviewers
    } as any));
};

/**
 * Adds reviewers to a PR.
 *
 * @param {Octokit}  client             Github Octokit client.
 * @param {string}   owner              Owner of the repository.
 * @param {string}   slug               Name of the repository.
 * @param {string}   pullRequestNumber  Number Id of the pull request.
 * @param {string[]} labels             List of labels to add to the PR.
 */
export const addLabels = async (client: Octokit, owner: string, slug: string, pullRequestNumber: number, labels: string[]): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('POST /repos/{owner}/{repo}/issues/{issue_number}/labels', {
        owner: owner,
        repo: slug,
        issue_number: pullRequestNumber,
        labels: labels
    }));
};

/**
 * Merges a PR.
 *
 * @param {Octokit}  client             Github Octokit client.
 * @param {string}   owner              Owner of the repository.
 * @param {string}   slug               Name of the repository.
 * @param {string}   pullRequestNumber  Number Id of the pull request.
 */
export const mergePullRequest = async (client: Octokit, owner: string, slug: string, pullRequestNumber: number): Promise<GithubApiResponse<any>> => {
    return getResponse(async () => await client.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
        owner: owner,
        repo: slug,
        pull_number: pullRequestNumber,
    }));
};