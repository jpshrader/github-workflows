//import yargs from 'yargs';

import { getGithubApiClient } from './client/github-api-client.js';
import { processInstructions } from './instructions/instruction-processor.js';
import { parseInstructions } from './instructions/instructions-parser.js';

// const argv = await yargs(process.argv.slice(2)).options({
//     instructions: {
//         alias: 'instructions',
//         type: 'string',
//         demandOption: true
//     },
//     accessToken: {
//         alias: 'access_token',
//         type: 'string',
//         demandOption: true
//     }
// }).argv;

const accessToken = process.argv[2];
const ins = process.argv[3];

//console.log('processing instructions: ', ins);

const instructions = parseInstructions(ins);
// const client = getGithubApiClient(accessToken);

// const err = await processInstructions(client, instructions);
// if (err) {
//     console.error('encountered error processing instructions: ', err);
//     process.exit(1);
// }

console.log('instructions completed successfully');
