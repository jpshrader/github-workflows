import { Octokit } from 'octokit';
import { createBranch, getBranch } from '../../client/branch-service.js';
import { addLabels, addReviewers, createPullRequest } from '../../client/pull-request-service.js';

export const mergeBranch = async (client: Octokit, ins: any): Promise<boolean> => {
    if (!ins.title) {
        ins.title = `Merge ${ins.from_branch} into ${ins.to_branch} (${ins.repo.owner}/${ins.repo.name})`;
    }
    if (!ins.body) {
        ins.body = `Generated with the [api-workflows](https://github.com/jpshrader/github-workflows) tool.`;
    }

    const fromBranchResponse = await getBranch(client, ins.repo.owner, ins.repo.name, ins.from_branch);
    if (!fromBranchResponse.isSuccess()) {
        console.error(`failed to get branch: ${fromBranchResponse.data}`);
        return true;
    }

    const toBranchResponse = await getBranch(client, ins.repo.owner, ins.repo.name, ins.from_branch);
    if (!toBranchResponse.isSuccess()) {
        console.error(`failed to get branch (${ins.to_branch}): ${toBranchResponse.data}`);
        return true;
    }

    const timeStamp = Math.floor(Date.now() / 1000);
    const newBranchName = `merge-${ins.from_branch}-into-${ins.to_branch}-${timeStamp}`;
    const newBranch = await createBranch(client, ins.repo.owner, ins.repo.name, toBranchResponse.data.commit.sha, `refs/heads/${newBranchName}`);
    if (!newBranch.isSuccess()) {
        console.error(`failed to create branch: ${newBranch.data}`);
        return true;
    }

    const pullRequest = await createPullRequest(client, ins.repo.owner, ins.repo.name, ins.title, ins.body, ins.from_branch, newBranchName);
    if (!pullRequest.isSuccess()) {
        console.error(`failed to create pull request: ${pullRequest.data}`);
        return true;
    }

    const prNum = pullRequest.data.number;
    if (ins.reviewers || ins.team_reviewers) {
        const reviewers = await addReviewers(client, ins.repo.owner, ins.repo.name, prNum, ins.reviewers, ins.team_reviewers);
        if (!reviewers.isSuccess()) {
            console.error(`failed to add reviewers: ${reviewers.data}`);
            return true;
        }
    }

    if (ins.labels) {
        const labels = await addLabels(client, ins.repo.owner, ins.repo.name, prNum, ins.labels);
        if (!labels.isSuccess()) {
            console.error(`failed to add labels: ${labels.data}`);
            return true;
        }
    }

    return false;
};