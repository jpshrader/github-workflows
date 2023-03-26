import yargs from 'yargs';

import { getGithubApiClient } from './client/github-api-client.js';
import { processInstructions } from './instructions/instruction-processor.js';
import { parseInstructions } from './instructions/instructions-parser.js';

const argv = await yargs(process.argv.slice(2)).options({
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

console.log('processing instructions: ', argv);

const instructions = parseInstructions(argv.instructions);
const client = getGithubApiClient(argv.accessToken);

const err = await processInstructions(client, instructions);
if (err) {
    console.error('encountered error processing instructions: ', err);
    process.exit(1);
}

console.log('instructions completed successfully');
