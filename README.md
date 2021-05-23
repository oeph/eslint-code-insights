[![npm](https://img.shields.io/npm/v/eslint-code-insights?style=for-the-badge)](https://npmjs.com/package/eslint-code-insights)
[![npm](https://img.shields.io/npm/dy/eslint-code-insights?style=for-the-badge)](https://npmjs.com/package/eslint-code-insights)
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/oeph/eslint-code-insights?style=for-the-badge)](https://github.com/oeph/eslint-code-insights)
[![License](https://img.shields.io/npm/l/eslint-code-insights?style=for-the-badge)](https://github.com/oeph/eslint-code-insights/blob/main/LICENSE)

# Bitbucket Code Insights for ESLint

Create [Code Insights](https://confluence.atlassian.com/bitbucketserver/code-insights-966660485.html) on your Bitbucket Server for your [ESLint](https://eslint.org) issues.

## Installation

```sh
npm install eslint-code-insights
```

## Usage

```javascript
await addESLintInsights(
    {
        url: 'https://your-bitbucket-server.example.org',
        accessToken: 'gp762nuuoqcoxypju8c569th9wz7q5',
        project: 'projectKey',
        repo: 'repositorySlug',
        commitId: '84eb815afaea6923b08a5514b978d0a404aaf121',
        // or use a custom path in order to create a relative path for bitbucket
        repositoryRootPath: process.cwd(),
    },
    ['lib/**/*.js']
);
```
