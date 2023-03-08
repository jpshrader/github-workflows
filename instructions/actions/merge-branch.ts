import { Octokit } from 'octokit';
import { compareBranches, createBranch, getBranch, mergeBranches } from '../../client/branch-service.js';
import { addLabels, addReviewers, createPullRequest } from '../../client/pull-request-service.js';
import { argToList } from '../instructions-parser.js';

/**
 * Processes a `merge_branch` instruction.
 *
 * @param {Octokit} client  Github Octokit client.
 * @param {any}     ins     A `merge_branch` instruction set.
 */
export const mergeBranch = async (client: Octokit, ins: any): Promise<Error> => {
    if (!ins.title) {
        ins.title = `Merge ${ins.from_branch} into ${ins.to_branch} (${ins.repo.owner}/${ins.repo.slug})`;
    }
    if (!ins.body) {
        ins.body = `Generated with the [api-workflows](https://github.com/jpshrader/github-workflows) tool.`;
    }

    const fromBranchResponse = await getBranch(client, ins.repo.owner, ins.repo.slug, ins.from_branch);
    if (!fromBranchResponse.isSuccess()) {
        console.log(`SKIPPING: failed to find branch (${ins.from_branch}): ${fromBranchResponse.data}`);
        return null;
    }

    const toBranchResponse = await getBranch(client, ins.repo.owner, ins.repo.slug, ins.from_branch);
    if (!toBranchResponse.isSuccess()) {
        console.log(`SKIPPING: failed to find branch (${ins.to_branch}): ${toBranchResponse.data}`);
        return null;
    }

    const branchComparison = await compareBranches(client, ins.repo.owner, ins.repo.slug, ins.from_branch, ins.to_branch);
    if (!branchComparison.isSuccess()) {
        return new Error(`failed to compare branches: ${branchComparison.data}`);
    }

    if (branchComparison.data.ahead_by === 0 || branchComparison.data.files === 0) {
        return new Error(`SKIPPING: no changes found from ${ins.from_branch} => ${ins.to_branch} (${ins.repo.owner}/${ins.repo.slug})`);
    }

    const timeStamp = Math.floor(Date.now() / 1000);
    const newBranchName = `merge-${ins.from_branch}-into-${ins.to_branch}-${timeStamp}`;
    const newBranch = await createBranch(client, ins.repo.owner, ins.repo.slug, toBranchResponse.data.commit.sha, `refs/heads/${newBranchName}`);
    if (!newBranch.isSuccess()) {
        return new Error(`failed to create intermediate branch (${newBranchName}): ${newBranch.data}`);
    }

    var prOriginBranch = newBranchName;
    const mergeResult = await mergeBranches(client, ins.repo.owner, ins.repo.slug, ins.from_branch, newBranchName, ins.title);
    if (!mergeResult.isSuccess()) {
        if (mergeResult.statusCode !== 409) {
            return new Error(`failed to merge branches: ${mergeResult.data}`);
        }
        console.warn(`WARNING: merge conflict detected for ${ins.from_branch} => ${ins.to_branch} (${ins.repo.owner}/${ins.repo.slug})`);
        prOriginBranch = ins.to_branch;
        ins.title  = `[CONFLICT] ${ins.title}}`
        ins.body = `Merge conflicts were detected when merging ${ins.from_branch} to ${ins.to_branch} - these will need to be resolved manually.<br/>${ins.body}`
    }

    const pullRequest = await createPullRequest(client, ins.repo.owner, ins.repo.slug, ins.title, ins.body, prOriginBranch, ins.to_branch);
    if (!pullRequest.isSuccess()) {
        return new Error(`failed to create pull request: ${pullRequest.data}`);
    }

    const prNum = pullRequest.data.number;
    if (ins.reviewers || ins.team_reviewers) {
        const prAuthor: string = pullRequest.data.user.login;
        const reviewers = [];
        const reviewerList = argToList(ins.reviewers);
        for (const reviewer of reviewerList) {
            if (reviewer.toLowerCase().trim() !== prAuthor.toLowerCase().trim()) {
                reviewers.push(reviewer);
            }
        }

        const teamReviewers = argToList(ins.team_reviewers);
        const reviewerResult = await addReviewers(client, ins.repo.owner, ins.repo.slug, prNum, reviewers, teamReviewers);
        if (!reviewerResult.isSuccess()) {
            return new Error(`failed to add reviewers: ${reviewerResult.data}`);
        }
    }

    if (ins.labels) {
        const labels = argToList(ins.labels);
        const labelResult = await addLabels(client, ins.repo.owner, ins.repo.slug, prNum, ins.labels);
        if (!labelResult.isSuccess()) {
            return new Error(`failed to add labels: ${labelResult.data}`);
        }
    }

    const prUrl = pullRequest.data.html_url;
    console.log(`SUCCESS: Created Pull Request: ${prUrl}`);
    return null;
};