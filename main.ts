import yargs from 'yargs';

import { getGithubApiClient } from './client/github-api-client.js';
import { getUser } from './client/user-service.js';

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

console.log('received instructions: ', argv.instructions)
console.log('received access_key: ', argv.access_token)

const client = getGithubApiClient(argv.accessToken);

const user = await getUser(client, 'jpshrader');

console.log(user);