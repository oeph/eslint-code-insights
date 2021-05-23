import { CodeInsights } from 'bbs-code-insights';
import { Annotation } from 'bbs-code-insights/dist/types';
import { ESLint } from 'eslint';

interface Config {
    /**
     * URL to the Bitbucket Server
     */
    url: string,
    /**
     * Access Token for the Bitbucket Server
     */
    accessToken: string,
    /**
     * Project Key for the Bitbucket repository
     */
    project: string,
    /** 
     * Repository Slug for the Bitbucket repository
     */
    repo: string,
    /**
     * Full Commit Id of the Commit that should be used to add Code Insights
     */
    commitId: string,
    /**
     * Root path of repository on the client.
     * 
     * This is used to create relative paths for Bitbucket
     */
    repositoryRootPath: string,
}

/**
 * Returns the ESLint calculateConfigForFile function.
 * 
 * Used for debugging purposes to check the eslint config. 
 */
function getCalculateConfigForFile(
    filePath: string,
    eslintOptions?: ESLint.Options
): Promise<Record<string, unknown>> {
    const eslint = new ESLint(eslintOptions);
    return eslint.calculateConfigForFile(filePath);
}

/**
 * Executes ESLint and adds the results as Code Insights
 * 
 * @param config config for the code insights
 * @param files files that should be linted
 * @param eslintOptions options for ESLint
 * @returns Promise to the action that creates the code insights
 */
async function addESLintInsights(
    config: Config,
    files: string | string[],
    eslintOptions?: ESLint.Options
): Promise<void> {
    const codeInsights = new CodeInsights({
        url: config.url,
        accessToken: config.accessToken
    }, {
        project: config.project,
        repo: config.repo,
        commitId: config.commitId,
        reportKey: 'oeph.code-insights.eslint',
    });

    const eslint = new ESLint(eslintOptions);
    const results = await eslint.lintFiles(files);
    let errors = 0;
    let fixableErrors = 0;
    let warnings = 0;
    let fixableWarnings = 0;
    const annotations: Array<Annotation> = [];

    results.forEach(result => {
        errors += result.errorCount;
        fixableErrors += result.fixableErrorCount;
        warnings += result.warningCount;
        fixableWarnings += result.fixableWarningCount;

        const path = result.filePath.replace(config.repositoryRootPath, '');

        result.messages.forEach(message => {
            annotations.push({
                path,
                line: message.line,
                message: message.message,
                severity: message.fatal || message.fix === undefined
                    ? 'HIGH'
                    : message.severity === 2
                        ? 'MEDIUM'
                        : 'LOW',
                externalId: `${path}-${message.line}-${message.column}-${message.ruleId}`
            });
        });
    });

    const createdDate = new Date().getTime();
    if (results.length === 0 || errors === 0) {
        return codeInsights.createReport({
            title: 'ESLint Report',
            reporter: 'ESLint Code Insight',
            logoUrl: 'https://eslint.org/img/logo.svg',
            result: 'PASS',
            createdDate,
            data: [{
                title: 'Warning Count',
                type: 'NUMBER',
                value: warnings,
            }, {
                title: 'Fixable Warning Count',
                type: 'NUMBER',
                value: fixableWarnings,
            }]
        });
    } else {
        return codeInsights.createReport({
            title: 'ESLint Report',
            reporter: 'ESLint Code Insight',
            logoUrl: 'https://eslint.org/img/logo.svg',
            result: 'FAIL',
            createdDate,
            data: [{
                title: 'Error Count',
                type: 'NUMBER',
                value: errors,
            }, {
                title: 'Warning Count',
                type: 'NUMBER',
                value: warnings,
            }, {
                title: 'Fixable Error Count',
                type: 'NUMBER',
                value: fixableErrors,
            }, {
                title: 'Fixable Warning Count',
                type: 'NUMBER',
                value: fixableWarnings,
            }]
        }, annotations);
    }
}

export default addESLintInsights;
export { addESLintInsights, getCalculateConfigForFile };