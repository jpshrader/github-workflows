import { Octokit } from 'octokit'
import { getBranch } from '../../client/branch-service.js';
import { argToList } from '../instructions-parser.js';
import { addLabels, addReviewers, createPullRequest } from '../../client/pull-request-service.js';

/**
 * Processes a `create_pr` instruction.
 *
 * @param {Octokit} client  Github Octokit client.
 * @param {any}     ins     A `create_pr` instruction set.
 */
export const createPr = async (client: Octokit, ins: any) => {
    if (!ins.title) {
        ins.title = `Merge ${ins.origin} into ${ins.destination} (${ins.repo.owner}/${ins.repo.slug})`;
    }
    if (!ins.body) {
        ins.body = `Generated with the [github-workflows](https://github.com/jpshrader/github-workflows) tool.`;
    }

    const fromBranchResponse = await getBranch(client, ins.repo.owner, ins.repo.slug, ins.origin);
    if (!fromBranchResponse.isSuccess()) {
        const message = `failed to find branch ${ins.origin} (${ins.repo.owner}/${ins.repo.slug}): ${fromBranchResponse.data.message}`;
        console.log(message);
        return new Error(message);
    }

    const toBranchResponse = await getBranch(client, ins.repo.owner, ins.repo.slug, ins.destination);
    if (!toBranchResponse.isSuccess()) {
        const message = `failed to find branch ${ins.destination} (${ins.repo.owner}/${ins.repo.slug}): ${toBranchResponse.data.message}`;
        console.log(message);
        return new Error(message);
    }

    const pullRequest = await createPullRequest(client, ins.repo.owner, ins.repo.slug, ins.title, ins.body, ins.origin, ins.destination, ins.draft);
    if (!pullRequest.isSuccess()) {
        return new Error(`failed to create pull request: ${pullRequest.data.message}`);
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
            return new Error(`failed to add reviewers: ${reviewerResult.data.message}`);
        }
    }

    if (ins.labels) {
        const labels = argToList(ins.labels);
        const labelResult = await addLabels(client, ins.repo.owner, ins.repo.slug, prNum, labels);
        if (!labelResult.isSuccess()) {
            return new Error(`failed to add labels: ${labelResult.data.message}`);
        }
    }

    const prUrl = pullRequest.data.html_url;
    console.log(`SUCCESS: Created Pull Request: ${prUrl}`);
    return null;
}