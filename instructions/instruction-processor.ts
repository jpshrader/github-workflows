import { Octokit } from 'octokit';
import { createLabel } from './actions/create-label.js';
import { dryRun } from './actions/dry-run.js';
import { mergeBranch } from './actions/merge-branch.js';
import { updatePackage } from './actions/update-package.js';
import { createPr } from './actions/create-pr.js';

const instructionHandler = Array<(client: Octokit, ins: any) => Promise<Error>>
instructionHandler['merge_branch']    = async (client: Octokit, ins: any): Promise<Error> => await mergeBranch(client, ins);
instructionHandler['create_label']    = async (client: Octokit, ins: any): Promise<Error> => await createLabel(client, ins);
instructionHandler['update_package']  = async (client: Octokit, ins: any): Promise<Error> => await updatePackage(client, ins);
instructionHandler['create_pr']       = async (client: Octokit, ins: any): Promise<Error> => await createPr(client, ins);
instructionHandler['dry_run']         = async (client: Octokit, ins: any): Promise<Error> => await dryRun(client, ins);

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
