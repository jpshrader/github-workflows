import { Octokit } from 'octokit';
import { compareBranches, createBranch, getBranch, mergeBranches } from '../../client/branch-service.js';
import { addLabels, addReviewers, createPullRequest } from '../../client/pull-request-service.js';
import { argToList } from '../instructions-parser.js';
import { createOrUpdateFile } from '../../client/repo-service.js';

/**
 * Processes a `merge_branch` instruction.
 *
 * @param {Octokit} client  Github Octokit client.
 * @param {any}     ins     A `merge_branch` instruction set.
 */
export const mergeBranch = async (client: Octokit, ins: any): Promise<Error> => {
    if (!ins.title) {
        ins.title = `Merge ${ins.origin} into ${ins.destination} (${ins.repo.owner}/${ins.repo.slug})`;
    }
    if (!ins.body) {
        ins.body = `Generated with the [github-workflows](https://github.com/jpshrader/github-workflows) tool.`;
    }

    const fromBranchResponse = await getBranch(client, ins.repo.owner, ins.repo.slug, ins.origin);
    if (!fromBranchResponse.isSuccess()) {
        console.log(`SKIPPING: failed to find branch (${ins.origin}): ${fromBranchResponse.data.message}`);
        return null;
    }

    const toBranchResponse = await getBranch(client, ins.repo.owner, ins.repo.slug, ins.destination);
    if (!toBranchResponse.isSuccess()) {
        console.log(`SKIPPING: failed to find branch (${ins.destination}): ${toBranchResponse.data.message}`);
        return null;
    }

    const branchComparison = await compareBranches(client, ins.repo.owner, ins.repo.slug, ins.origin, ins.destination);
    if (!branchComparison.isSuccess()) {
        return new Error(`failed to compare branches: ${branchComparison.data.message}`);
    }

    const comparison = branchComparison.data;
    if (comparison.ahead_by === 0 || comparison.files.length === 0) {
        console.log(`SKIPPING: no changes found from ${ins.origin} => ${ins.destination} (${ins.repo.owner}/${ins.repo.slug})`);
        return null;
    }

    const timeStamp = Math.floor(Date.now() / 1000);
    const newBranchName = `merge-${ins.origin}-into-${ins.destination}-${timeStamp}`;
    const newBranch = await createBranch(client, ins.repo.owner, ins.repo.slug, toBranchResponse.data.commit.sha, `refs/heads/${newBranchName}`);
    if (!newBranch.isSuccess()) {
        return new Error(`failed to create intermediate branch (${newBranchName}): ${newBranch.data.message}`);
    }

    var isDraft = false;
    const mergeResult = await mergeBranches(client, ins.repo.owner, ins.repo.slug, ins.origin, newBranchName, ins.title);
    if (!mergeResult.isSuccess()) {
        if (mergeResult.statusCode !== 409) {
            return new Error(`failed to merge branches: ${mergeResult.data.message}`);
        }
        console.warn(`WARNING: merge conflict detected for ${ins.origin} => ${ins.destination} (${ins.repo.owner}/${ins.repo.slug})`);

        const placeholderFile = `This is a temporary placeholder file to enable PR creation. Merge in ${ins.origin}, resolve the conflicts and remove this file before merging.`
        const createFileResult = await createOrUpdateFile(client, ins.repo.owner, ins.repo.slug, newBranchName, `${newBranchName}.txt`, placeholderFile, 'add placeholder file to resolve merge conflict');
        if (!createFileResult.isSuccess()) {
            return new Error(`failed to create placeholder file: ${createFileResult.data.message}`);
        }

        ins.title = `[MERGE CONFLICT] ${ins.title}}`
        ins.body = `Merge conflicts were detected when merging ${ins.origin} to ${ins.destination} - you will need to resolve these conflicts manually.<br/>
        \`git checkout origin/${newBranchName}\`<br/>
        \`git merge origin/${ins.origin}\`<br/>
        Remove the \`placeholder.txt\` file<br/>
        ${ins.body}`
        isDraft = true;
    }

    const pullRequest = await createPullRequest(client, ins.repo.owner, ins.repo.slug, ins.title, ins.body, newBranchName, ins.destination, isDraft);
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
};