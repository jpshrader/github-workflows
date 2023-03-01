import { Octokit } from "octokit";
import { mergeBranch } from "./actions/merge-branch";

const MERGE_BRANCH = 'merge_branch';

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
            default:
                console.log(`unknown action: ${instruction.action}`);
        }
    }
}