import { Octokit } from 'octokit';
import { getLabel, createLabel as createLbl } from '../../client/label-service.js';

/**
 * Processes a `create_label` instruction.
 *
 * @param {Octokit} client  Github Octokit client.
 * @param {any}     ins     A `create_label` instruction set.
 */
export const createLabel = async (client: Octokit, ins: any): Promise<Error> => {
    for (const repo of ins.repos) {
        const label = await getLabel(client, repo.owner, repo.slug, ins.name);
        if (label.isSuccess()) {
            console.log(`SKIPPING: label already exists: '${ins.name}' on ${repo.owner}/${repo.slug}`);
            continue;
        }

        const newLabel = await createLbl(client, repo.owner, repo.slug, ins.name, ins.description, ins.color);
        if (!newLabel.isSuccess()) {
            return new Error(`failed to create label: '${newLabel.data}' on ${repo.owner}/${repo.slug} - ${newLabel.data.message}`);
        }
        console.log(`SUCCESS: created label ${ins.name} on ${repo.owner}/${repo.slug}`);
    }
    return null;
}