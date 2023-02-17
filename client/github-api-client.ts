import { Octokit } from "octokit";

export const getGithubApiClient = (apiToken: string): Octokit => {
    return new Octokit({ 
        auth: apiToken 
    });
};
