import { Octokit } from 'octokit';
import { compareBranches, createBranch, getBranch, mergeBranches } from '../../client/branch-service.js';
import { addLabels, addReviewers, createPullRequest } from '../../client/pull-request-service.js';

/**
 * Processes a `merge_branch` instruction.
 *
 * @param {Octokit} client Github Octokit client.
 * @param {any} ins A `merge_branch` instruction set.
 */
export const mergeBranch = async (client: Octokit, ins: any): Promise<boolean> => {
    if (!ins.title) {
        ins.title = `Merge ${ins.from_branch} into ${ins.to_branch} (${ins.repo.owner}/${ins.repo.slug})`;
    }
    if (!ins.body) {
        ins.body = `Generated with the [api-workflows](https://github.com/jpshrader/github-workflows) tool.`;
    }

    const fromBranchResponse = await getBranch(client, ins.repo.owner, ins.repo.slug, ins.from_branch);
    if (!fromBranchResponse.isSuccess()) {
        console.error(`failed to get branch: ${fromBranchResponse.data}`);
        return true;
    }

    const toBranchResponse = await getBranch(client, ins.repo.owner, ins.repo.slug, ins.from_branch);
    if (!toBranchResponse.isSuccess()) {
        console.error(`failed to get branch (${ins.to_branch}): ${toBranchResponse.data}`);
        return true;
    }

    const branchComparison = await compareBranches(client, ins.repo.owner, ins.repo.slug, ins.from_branch, ins.to_branch);
    if (!branchComparison.isSuccess()) {
        console.error(`failed to compare branches: ${branchComparison.data}`);
        return true;
    }

    if (branchComparison.data.ahead_by === 0 || branchComparison.data.files === 0) {
        console.log(`SKIPPING: no update from ${ins.from_branch} needed`);
        return false;
    }

    const timeStamp = Math.floor(Date.now() / 1000);
    const newBranchName = `merge-${ins.from_branch}-into-${ins.to_branch}-${timeStamp}`;
    const newBranch = await createBranch(client, ins.repo.owner, ins.repo.slug, toBranchResponse.data.commit.sha, `refs/heads/${newBranchName}`);
    if (!newBranch.isSuccess()) {
        console.error(`failed to create branch: ${newBranch.data}`);
        return true;
    }

    const mergeResult = await mergeBranches(client, ins.repo.owner, ins.repo.slug, ins.from_branch, newBranchName, ins.title);
    if (!mergeResult.isSuccess()) {
        console.error(`failed to merge branches: ${mergeResult.data}`);
        return true;
    }

    const pullRequest = await createPullRequest(client, ins.repo.owner, ins.repo.slug, ins.title, ins.body, newBranchName, ins.to_branch);
    if (!pullRequest.isSuccess()) {
        console.error(`failed to create pull request: ${pullRequest.data}`);
        return true;
    }

    const prNum = pullRequest.data.number;
    if (ins.reviewers || ins.team_reviewers) {
        const prAuthor: string = pullRequest.data.user.login;
        const reviewers = [];
        for (const reviewer of ins.reviewers) {
            if (reviewer.toLowerCase().trim() !== prAuthor.toLowerCase().trim()) {
                reviewers.push(reviewer);
            }
        }


        const reviewerResult = await addReviewers(client, ins.repo.owner, ins.repo.slug, prNum, reviewers, ins.team_reviewers);
        if (!reviewerResult.isSuccess()) {
            console.error(`failed to add reviewers: ${reviewerResult.data}`);
            return true;
        }
    }

    if (ins.labels) {
        const labels = await addLabels(client, ins.repo.owner, ins.repo.slug, prNum, ins.labels);
        if (!labels.isSuccess()) {
            console.error(`failed to add labels: ${labels.data}`);
            return true;
        }
    }

    const prUrl = pullRequest.data.html_url;
    console.log(`SUCCESS: Created Pull Request: ${prUrl}`);
    return false;
};