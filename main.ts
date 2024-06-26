import { exit, argv } from 'process';
import yargs from 'yargs';

import { getGithubApiClient } from './client/github-api-client.js';
import { processInstructions } from './instructions/instruction-processor.js';
import { parseInstructions } from './instructions/instructions-parser.js';

const args = await yargs(argv.slice(2)).options({
    instructions: {
        alias: 'instructions',
        type: 'string',
        demandOption: true
    },
    accessToken: {
        alias: 'access_token',
        type: 'string',
        demandOption: true
    }
}).argv;

const instructions = parseInstructions(args.instructions);
const client = getGithubApiClient(args.accessToken);

const err = await processInstructions(client, instructions);
if (err) {
    console.error('encountered error processing instructions: ', err);
    exit(1);
}

console.log('instructions completed successfully');
