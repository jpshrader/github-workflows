import { Octokit } from 'octokit';
import { argToList } from '../instructions-parser.js';
import { compareBranches } from '../../client/branch-service.js';

/**
 * Processes a `dry_run` instruction.
 *
 * @param {Octokit} client  GitHub api client.
 * @param {any}     ins     A `dry_run` instruction set.
 */
export const dryRun = async (client: Octokit, ins: any): Promise<Error> => {
    console.log('received instructions: ', ins);

    if (ins.type === 'info') {
        printInfo(ins);
    }

    if (ins.type === 'compare') {
        getBranchComparison(client, ins);
    }

    return null;
};

const getBranchComparison = async (client: Octokit, ins: any) => {
    if (!ins.repo) {
        return;
    }

    const branchComparison = await compareBranches(client, ins.repo.owner, ins.repo.slug, ins.origin, ins.destination);
    if (!branchComparison.isSuccess()) {
        console.log(`failed to compare branches: ${branchComparison.data.message}`);
    }

    console.log('branch comparison: ', branchComparison.data);
};

const printInfo = (ins: any) => {
    if (ins.reviewers) {
        const reviewers = [];
        const reviewerList = argToList(ins.reviewers);
        for (const reviewer of reviewerList) {
            reviewers.push(reviewer);
        }

        console.log('reviewers: ', reviewers);
    }

    if (ins.team_reviewers) {
        const teamReviewers = [];
        const teamReviewerList = argToList(ins.team_reviewers);
        for (const reviewer of teamReviewerList) {
            teamReviewers.push(reviewer);
        }

        console.log('team reviewers: ', teamReviewers);
    }

    if (ins.labels) {
        const labels = argToList(ins.labels);

        console.log('labels: ', labels);
    }
};