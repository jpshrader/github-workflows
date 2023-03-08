import { argToList } from '../instructions-parser.js';

/**
 * Processes a `dry_run` instruction.
 *
 * @param {any} ins A `dry_run` instruction set.
 */
export const dryRun = async (ins: any): Promise<Error> => {
    console.log('received instructions: ', ins);

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

    return null;
};