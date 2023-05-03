import { Octokit } from 'octokit';
import { createBranch, getBranch } from '../../client/branch-service.js';
import { addLabels, addReviewers, createPullRequest } from '../../client/pull-request-service.js';
import { argToList } from '../instructions-parser.js';
import { createOrUpdateFile, getFile } from '../../client/repo-service.js';

/**
 * Processes a `update_package` instruction.
 *
 * @param {Octokit} client  Github Octokit client.
 * @param {any}     ins     A `update_package` instruction set.
 */
export const updatePackage = async (client: Octokit, ins: any): Promise<Error> => {
    if (!ins.title) {
        ins.title = `Update ${ins.name} to ${ins.version} (${ins.repo.owner}/${ins.repo.slug})`;
    }
    if (!ins.body) {
        ins.body = `Generated with the [github-workflows](https://github.com/jpshrader/github-workflows) tool.`;
    }
    if (!ins.indent) {
        ins.indent = 2;
    }

    const branchResponse = await getBranch(client, ins.repo.owner, ins.repo.slug, ins.branch);
    if (!branchResponse.isSuccess()) {
        console.log(`SKIPPING: failed to find branch ${ins.branch} (${ins.repo.owner}/${ins.repo.slug}): ${branchResponse.data.message}`);
        return null;
    }

    const getFileResponse = await getFile(client, ins.repo.owner, ins.repo.slug, ins.branch, ins.path);
    if (!getFileResponse.isSuccess()) {
        return new Error(`failed to get file: ${getFileResponse.data.message}`);
    }

    const packageFile = JSON.parse(Buffer.from(getFileResponse.data.content, 'base64').toString());
    if (packageFile.dependencies[ins.name]) {
        packageFile.dependencies[ins.name] = ins.version;
    } else if (packageFile.devDependencies[ins.name]) {
        packageFile.devDependencies[ins.name] = ins.version;
    } else {
        return new Error(`failed to find package ${ins.name} in package.json`);
    }

    const timeStamp = Math.floor(Date.now() / 1000);
    const newBranchName = `update-${ins.name}-${timeStamp}`;
    const newBranch = await createBranch(client, ins.repo.owner, ins.repo.slug, branchResponse.data.commit.sha, `refs/heads/${newBranchName}`);
    if (!newBranch.isSuccess()) {
        return new Error(`failed to create intermediate branch (${newBranchName}): ${newBranch.data.message}`);
    }

    const packageFileString = JSON.stringify(packageFile, null, ins.indent);
    const updateFileResult = await createOrUpdateFile(client, ins.repo.owner, ins.repo.slug, newBranchName, ins.path, packageFileString, `update ${ins.name} to ${ins.version}`, getFileResponse.data.sha);
    if (!updateFileResult.isSuccess()) {
        return new Error(`failed to bump package version: ${updateFileResult.data.message}`);
    }

    const pullRequest = await createPullRequest(client, ins.repo.owner, ins.repo.slug, ins.title, ins.body, newBranchName, ins.branch, false);
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