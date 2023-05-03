import { Octokit } from 'octokit';
import { createLabel } from './actions/create-label.js';
import { dryRun } from './actions/dry-run.js';
import { mergeBranch } from './actions/merge-branch.js';
import { updatePackage } from './actions/update-package.js';

const MERGE_BRANCH   = 'merge_branch';
const CREATE_LABEL   = 'create_label';
const UPDATE_PACKAGE = 'update_package';
const DRY_RUN        = 'dry_run';

export const processInstructions = async (client: Octokit, instructions: any[]): Promise<Error> => {
    var err: Error = null;
    console.log('processing instructions: ', instructions);
    for (const instruction of instructions) {
        if (err) {
            return err;
        }

        err = await processInstruction(client, instruction);
    }

    return err
}

async function processInstruction(client: Octokit, instruction: any) {
    var err: Error = null;
    console.log('processing instruction: ', instruction);
    switch (instruction.action) {
        case MERGE_BRANCH:
            err = await mergeBranch(client, instruction);
            break;
        case CREATE_LABEL:
            err = await createLabel(client, instruction);
            break;
        case UPDATE_PACKAGE:
            err = await updatePackage(client, instruction);
            break;
        case DRY_RUN:
            err = await dryRun(client, instruction);
            break;
        default:
            console.error(`unknown action: ${instruction.action}`);
    }
    return err;
}
