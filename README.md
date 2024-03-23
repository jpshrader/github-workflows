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

### Inline Instructions:

```
on:
  workflow_dispatch:
    inputs:
      repo:
        description: 'Repo name'
        type: string
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
          instructions:
            - action: merge_branch
                repo:
                  owner: jpshrader
                  slug: ${{ github.event.inputs.repo }}
                origin: test
                destination: main
                title: release workflows
                body: testing
                labels:
                  - bug
                reviewers:
                  - jpshrader
```

### Referencing Yaml File Instructions:

```
on:
  workflow_dispatch:
    inputs:
      instructions:
        description: 'GitHub instruction set to use'
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

In your consuming consuming workflow, you may accept the access token as a parameter or store it as a [secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#about-encrypted-secrets).

#### Token Permissions

This will of course vary on the types of operations you're performing, but at the least your token will probably need these permissions:
- repo
- user

### Merge Branches

The `merge_branch` instruction checks whether there are changes to merge from `origin` to `destination`. If there are, it creates a new branch (`merge-{origin}-to-{destination}-{timestamp}`) off of `destination`, merges `origin` into that new branch, and then opens a pull request targeting `destination`. The title, description, labels, and reviewers of the resulting PR can also be passed to this instruction.

Examples:
```
- action: merge_branch
  repo:
    owner:jpshrader
    slug: github-workflows
  origin: main
  destination: test
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
| `origin`         | name of the origin branch                      | `main`                           | `true`   | `N/A`                                |
| `destination`    | name of the destination branch                 | `main`                           | `true`   | `N/A`                                |
| `title`          | title of the resulting PR                      | `merge branch`                   | `false`  | `Merge {origin} to {destination}`    |
| `description`    | description of the resulting PR                | `merge branch`                   | `false`  | ` `                                  |
| `auto_merge`     | auto-merges the PR if there are no conflicts   | `true`                           | `false`  | `false`                              |
| `labels`         | a list of label names to add to the PR         | `bug`                            | `false`  | `[]`                                 |
| `reviewers`      | a list of user logins to request reviews from  | `jpshrader`                      | `false`  | `[]`                                 |
| `team_reviewers` | a list of teams to request reviews from        | `dev_ops`                        | `false`  | `[]`                                 |

### Update Package

The `update_package` instruction updates a specific npm package to a specific version on a given branch. It creates a new branch (`update-{name}-{timeStamp}`) off of `branch`, fetches the file at the given `path` and updates the package (`name`). It then commits this change to the aforementioned branch and opens a PR into the original branch. The title, labels, and reviewers of the resulting PR can also be passed to this instruction.

Examples:
```
- action: update_package
  repo:
    owner:jpshrader
    slug: github-workflows
  branch: main
  path: package.json
  name: js-yaml
  version: 1.2.3.4
  indent: 4
  title: 'update'
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
| `branch`         | name of the origin branch                      | `main`                           | `true`   | `N/A`                                |
| `name`           | name of the package to update                  | `octokit`                        | `true`   | `N/A`                                |
| `version`        | version of the package to update to            | `1.2.3.4`                        | `true`   | `N/A`                                |
| `indent`         | numbers of spaces to indent your package file  | `4`                              | `false`  | `2`                                  |
| `title`          | title of the resulting PR                      | ` `                              | `false`  | `Update {name} to {version}`         |
| `description`    | description of the resulting PR                | ` `                              | `false`  | ` `                                  |
| `labels`         | a list of label names to add to the PR         | `bug`                            | `false`  | `[]`                                 |
| `reviewers`      | a list of user logins to request reviews from  | `jpshrader`                      | `false`  | `[]`                                 |
| `team_reviewers` | a list of teams to request reviews from        | `dev_ops`                        | `false`  | `[]`                                 |

### Create PR

The `merge_pr` instruction opens a Pull Request from `origin` into `destination`. Title, description, labels, and reviewers can also be passed to this instruction.

Examples:
```
- action: create_pr
  repo:
    owner:jpshrader
    slug: github-workflows
  origin: main
  destination: test
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
| `origin`         | name of the origin branch                      | `main`                           | `true`   | `N/A`                                |
| `destination`    | name of the destination branch                 | `main`                           | `true`   | `N/A`                                |
| `title`          | title of the resulting PR                      | `merge branch`                   | `false`  | `Merge {origin} to {destination}`    |
| `description`    | description of the resulting PR                | `merge branch`                   | `false`  | ` `                                  |
| `labels`         | a list of label names to add to the PR         | `bug`                            | `false`  | `[]`                                 |
| `reviewers`      | a list of user logins to request reviews from  | `jpshrader`                      | `false`  | `[]`                                 |
| `team_reviewers` | a list of teams to request reviews from        | `dev_ops`                        | `false`  | `[]`                                 |

### Create Label

The `create_label` instruction creates a given label across a list of repos.

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