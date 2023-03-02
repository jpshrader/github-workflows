# Github Workflows

Github Actions based utility to perform actions against the Github Api.

## Setup:
1. https://code.visualstudio.com/docs/remote/containers
2. https://code.visualstudio.com/learn/develop-cloud/containers
3. https://github.com/microsoft/vscode-remote-try-node

## Resources:
1. [Github Api Docs](https://docs.github.com/en/rest/quickstart)

## Community Resources

- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [License](LICENSE)
- [Security Policy](SECURITY.md)

## Development

TODO

## Usage

```
name: 'Run GitHub Utility'

on:
  workflow_dispatch:
    inputs:
      instructions:
        description: 'GitHub Utility instruction set to use'
        type: choice
        options:
          - './list-empty-branches.yml'
          - './list-unprotected-branches.yml'
          - './merge-branch.yml'
        required: true
      access_token:
        description: 'GitHub Api Access Token'
        type: string
        required: true

jobs:
  execute:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: jpshrader/github-workflows@main
        with:
          access_token: ${{ github.event.inputs.access_token }}
          instructions: ${{ github.event.inputs.instructions }}
```

| Argument       | Description                                    | Example Value                    | Required | Supported Value(s) |
|----------------|------------------------------------------------|----------------------------------|----------|--------------------|
| `access_token` | GitHub personal access token for user          | `N/A`                            | `true`   | `N/A`              |
| `instructions` | path to instructions file                      | `./list-empty-branches.yml`      | `true`   | `N/A`              |

### Authentication

This utility uses [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) to authenticate with the api. As a consequence, all actions performed through this utility will be 'done by' the owner of the token.

In your consuming consuming workflow, you may accept the [access token as a parameter](https://github.com/jpshrader/github-api-workflow-examples/blob/main/.github/workflows/github-utility.yml#L14-L17) or store it as a [secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#about-encrypted-secrets).

#### Token permissions

This will of course vary on the types of operations you're performing, but at the least your token will probably need these permissions:
- repo
- user

### Merge branches

The `merge_branch` instruction checks whether there are changes to merge from `from_branch` to `to_branch`. If there are, it creates a new branch (`merge-{from_branch}-to-{to_branch}-{timestamp}`) off of `to_branch`, merges `from_branch` into that new branch, and then opens a pull request targeting `to_branch`. The title, labels, and reviewers of the resulting PR can also be passed to this instruction.

Examples:
```
- action: merge_branch
  repo:
    owner:jpshrader
    slug: github-workflows
  from_branch: main
  to_branch: test
  title: 'merge'
  body: 'test'
  labels:
    - bug
    - documentation
  reviewers:
    - jpshrader
```

| Argument         | Description                                    | Example Value                    | Required | Default Value                        |
|------------------|------------------------------------------------|----------------------------------|----------|--------------------------------------|
| `repo`           | object with repo `owner`/`slug` info           | see above example                | `true`   | `N/A`                                |
| `from_branch`    | name of the origin branch                      | `main`                           | `true`   | `N/A`                                |
| `to_branch`      | name of the destination branch                 | `main`                           | `true`   | `N/A`                                |
| `title`          | title of the resulting PR                      | `merge branch`                   | `false`  | `Merge {from_branch} to {to_branch}` |
| `description`    | description of the resulting PR                | `merge branch`                   | `false`  | ` `                                  |
| `labels`         | a list of label names to add to the PR         | `bug`                            | `false`  | `[]`                                 |
| `reviewers`      | a list of user logins to request reviews from  | `jpshrader`                      | `false`  | `[]`                                 |
| `team_reviewers` | a list of teams to request reviews from        | `dev_ops`                        | `false`  | `[]`                                 |

### Create Label

The `create_label` instruction creates a given label across a list of repos. If the label already exists, it will update the existing label with the provided color/description.

Examples:
```
- action: create_label
  repos:
    -
      owner:jpshrader
      slug: github-workflows
  name: example
  color: f29513
  description: 'label for examples'
```

| Argument      | Description                                     | Example Value                    | Required | Default Value |
|---------------|-------------------------------------------------|----------------------------------|----------|---------------|
| `name`        | the name of the label                           | `example`                        | `true`   | `N/A`         |
| `color`       | hex color code of the label (not including '#') | `f29513`                         | `true`   | `N/A`         |
| `description` | description of the label                        | `label for examples`             | `false`  |               |
| `repos`       | list of repos to create the label               | see above example                | `true`   | `N/A`         |