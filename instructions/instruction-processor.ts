import { Octokit } from 'octokit';
import { createLabel } from './actions/create-label.js';
import { dryRun } from './actions/dry-run.js';
import { mergeBranch } from './actions/merge-branch.js';

const MERGE_BRANCH = 'merge_branch';
const CREATE_LABEL = 'create_label';
const DRY_RUN      = 'dry_run';

export const processInstructions = async (client: Octokit, instructions: any[]): Promise<Error> => {
    var err: Error = null;
    for (const instruction of instructions) {
        if (err) {
            return err;
        }

        switch (instruction.action) {
            case MERGE_BRANCH:
                err = await mergeBranch(client, instruction);
                break;
            case CREATE_LABEL:
                err = await createLabel(client, instruction);
                break;
            case DRY_RUN:
                err = await dryRun(instruction);
                break;
            default:
                console.error(`unknown action: ${instruction.action}`);
        }
    }

    return err
}