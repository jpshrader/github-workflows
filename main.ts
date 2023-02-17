import { getGithubApiClient } from './client/github-api-client';

console.log('yes')

const apiToken = '123';
const githubClient = getGithubApiClient(apiToken);

const repos = await githubClient.rest.repos.listForAuthenticatedUser();
repos.data.forEach(repo => {
    console.log(repo.name)
});