import { Octokit } from 'octokit';
import { createBranch } from '../../client/branch-service.js';
import { addLabels, addReviewers, createPullRequest } from '../../client/pull-request-service.js';

export const mergeBranch = async (client: Octokit, instruction: any): Promise<boolean> => {
    if (!instruction.title) {
        instruction.title = `Merge ${instruction.from_branch} into ${instruction.to_branch} (${instruction.repo.owner}/${instruction.repo.name})`;
    }
    if (!instruction.body) {
        instruction.body = `Generated with the [api-workflows](https://github.com/jpshrader/github-workflows) tool.`;
    }

    const newBranch = await createBranch(
        client,
        instruction.repo.owner,
        instruction.repo.name,
        instruction.sha,
        instruction.from_branch
    );

    const pullRequest = await createPullRequest(
        client,
        instruction.repo.owner,
        instruction.repo.name,
        instruction.title,
        instruction.body,
        instruction.from_branch,
        instruction.to_branch
    );
    if (!pullRequest.isSuccess()) {
        console.log(`failed to create pull request: ${pullRequest.data}`);
        return true;
    }

    const pullRequestNumber = pullRequest.data.number;
    if (instruction.reviewers || instruction.team_reviewers) {
        const reviewers = await addReviewers(
            client,
            instruction.repo.owner,
            instruction.repo.name,
            pullRequestNumber,
            instruction.reviewers,
            instruction.team_reviewers
        );
        if (!reviewers.isSuccess()) {
            console.log(`failed to add reviewers: ${reviewers.data}`);
            return true;
        }
    }

    if (instruction.labels) {
        const labels = await addLabels(
            client,
            instruction.repo.owner,
            instruction.repo.name,
            pullRequestNumber,
            instruction.labels
        );
        if (!labels.isSuccess()) {
            console.log(`failed to add labels: ${labels.data}`);
            return true;
        }
    }

    return false;
};