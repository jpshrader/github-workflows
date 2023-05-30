import { Octokit } from 'octokit';
import { createLabel } from './actions/create-label.js';
import { dryRun } from './actions/dry-run.js';
import { mergeBranch } from './actions/merge-branch.js';
import { updatePackage } from './actions/update-package.js';
import { createPr } from './actions/create-pr.js';

const MERGE_BRANCH   = 'merge_branch';
const CREATE_LABEL   = 'create_label';
const UPDATE_PACKAGE = 'update_package';
const CREATE_PR      = 'create_pr'
const DRY_RUN        = 'dry_run';

const instructionHandler = Array<(client: Octokit, ins: any) => Promise<Error>>
instructionHandler[MERGE_BRANCH]    = async (client: Octokit, ins: any): Promise<Error> => await mergeBranch(client, ins);
instructionHandler[CREATE_LABEL]    = async (client: Octokit, ins: any): Promise<Error> => await createLabel(client, ins);
instructionHandler[UPDATE_PACKAGE]  = async (client: Octokit, ins: any): Promise<Error> => await updatePackage(client, ins);
instructionHandler[CREATE_PR]       = async (client: Octokit, ins: any): Promise<Error> => await createPr(client, ins);
instructionHandler[DRY_RUN]         = async (client: Octokit, ins: any): Promise<Error> => await dryRun(client, ins);

export const processInstructions = async (client: Octokit, instructions: any[]): Promise<Error> => {
    var err: Error = null;
    for (const instruction of instructions) {
        if (err) {
            return err;
        }

        const handler = instructionHandler[instruction.action];
        if (!handler) {
            err = new Error(`unknown action: ${instruction.action}`);
            continue;
        }
        err = await handler(client, instruction)
    }

    return err
}
