import { Octokit } from 'octokit';
import { getLabel, createLabel as createLbl } from '../../client/label-service.js';

export const createLabel = async (client: Octokit, ins: any): Promise<boolean> => {
    const label = await getLabel(client, ins.repo.owner, ins.repo.name, ins.name);
    if (label.isSuccess()) {
        console.log(`SKIPPING: label already exists: ${ins.name}`);
        return false;
    }

    const newLabel = await createLbl(client, ins.repo.owner, ins.repo.name, ins.name, ins.description, ins.color);
    if (!newLabel.isSuccess()) {
        console.error(`failed to create label: ${newLabel.data}`);
        return true;
    }
    return false;
}