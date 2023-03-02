import { Octokit } from 'octokit';
import { createLabel } from './actions/create-label.js';
import { mergeBranch } from './actions/merge-branch.js';

const MERGE_BRANCH = 'merge_branch';
const CREATE_LABEL = 'create_label';

export const processInstructions = async (client: Octokit, instructions: any[]): Promise<void> => {
    var encounteredError = false;
    for (const instruction of instructions) {
        if (encounteredError) {
            return;
        }

        switch (instruction.action) {
            case MERGE_BRANCH:
                encounteredError = await mergeBranch(client, instruction);
                break;
            case CREATE_LABEL:
                encounteredError = await createLabel(client, instruction);
                break;
            default:
                console.error(`unknown action: ${instruction.action}`);
        }
    }
}