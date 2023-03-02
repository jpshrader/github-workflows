import { Octokit } from 'octokit';
import { getLabel, createLabel as createLbl } from '../../client/label-service.js';

export const createLabel = async (client: Octokit, ins: any): Promise<boolean> => {
    var encounteredError = false;
    for (const repo of ins.repos) {
        const label = await getLabel(client, repo.owner, repo.slug, ins.name);
        if (label.isSuccess()) {
            console.log(`SKIPPING: label already exists: ${ins.name}`);
            continue;
        }

        const newLabel = await createLbl(client, repo.owner, repo.slug, ins.name, ins.description, ins.color);
        if (!newLabel.isSuccess()) {
            console.error(`failed to create label: ${newLabel.data}`);
            encounteredError = true;
            continue;
        }
        console.log(`SUCCESS: created label ${ins.name} on ${repo.owner}/${repo.slug}`);
    }
    return encounteredError;
}