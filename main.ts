import yargs from 'yargs';

import { getGithubApiClient } from './client/github-api-client.js';
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

const instructions = parseInstructions(argv.instructions);
console.log('parsed instructions: ', instructions);

const client = getGithubApiClient(argv.accessToken);

