import { getCalculateConfigForFile, addESLintInsights } from '../src/index';
import configSnapshot from './config-snapshot';

const createReportMock = jest.fn(async () => {
    return Promise.resolve();
});

jest.mock('bbs-code-insights', () => {
    return {
        CodeInsights: jest.fn().mockImplementation(() => {
            return {
                createReport: createReportMock
            };
        })
    };
});

const url = process.env.BBS_HOST || 'https://local-test.example.org';
const accessToken = process.env.BBS_TOKEN || 'super-secret-token';
const repo = process.env.REPO || 'repo';
const project = process.env.PROJECT || 'some-project';
const commitId = process.env.COMMIT_ID || 'e69494baf07d6277393051cabece2ba56bad2a3a';

describe('getCalculateConfigForFile', () => {
    test('standard config', async () => {
        const config = await getCalculateConfigForFile('./index.test.ts');
        expect(config).toMatchObject(configSnapshot);
    });
});

describe('addESLintInsights', () => {
    test('should send report', async () => {
        await addESLintInsights({
            url,
            accessToken,
            project,
            repo,
            commitId,
            repositoryRootPath: process.cwd(),
        }, 'test/file-to-be-linted.js');

        expect(createReportMock).toBeCalledTimes(1);
    });

    test('should send pass report on clean file', async () => {
        await addESLintInsights({
            url,
            accessToken,
            project,
            repo,
            commitId,
            repositoryRootPath: process.cwd(),
        }, 'test/file-to-be-linted.js');

        expect(createReportMock).toBeCalledTimes(1);
        const call: [] = createReportMock.mock.calls[0];
        expect(call).not.toBeUndefined();
        expect(call.length).toBe(1);
        const argument = call.pop();
        expect(argument).toMatchObject({
            title: 'ESLint Report',
            reporter: 'ESLint Code Insight',
            logoUrl: 'https://eslint.org/img/logo.svg',
            result: 'PASS',
            data: [{
                title: 'Warning Count',
                type: 'NUMBER',
                value: 0,
            }, {
                title: 'Fixable Warning Count',
                type: 'NUMBER',
                value: 0,
            }]
        });
    });

    test('should send fail report on file with errors', async () => {
        await addESLintInsights({
            url,
            accessToken,
            project,
            repo,
            commitId,
            repositoryRootPath: process.cwd(),
        }, 'test/file-to-be-linted-w-errors.js');

        expect(createReportMock).toBeCalledTimes(1);
        const call: [] = createReportMock.mock.calls[0];
        expect(call).not.toBeUndefined();
        expect(call.length).toBe(2);
        const annotationArgument = call.pop();
        const reportArgument = call.pop();
        expect(reportArgument).toMatchObject({
            title: 'ESLint Report',
            reporter: 'ESLint Code Insight',
            logoUrl: 'https://eslint.org/img/logo.svg',
            result: 'FAIL',
            data: [{
                title: 'Error Count',
                type: 'NUMBER',
                value: 2,
            }, {
                title: 'Warning Count',
                type: 'NUMBER',
                value: 2,
            }, {
                title: 'Fixable Error Count',
                type: 'NUMBER',
                value: 1,
            }, {
                title: 'Fixable Warning Count',
                type: 'NUMBER',
                value: 0,
            }]
        });

        expect(annotationArgument).toEqual(
            expect.arrayContaining([{
                'externalId': '/test/file-to-be-linted-w-errors.js-1-7-@typescript-eslint/no-unused-vars',
                'line': 1,
                'message': '\'someVar\' is assigned a value but never used.',
                'path': '/test/file-to-be-linted-w-errors.js',
                'severity': 'HIGH'
            }, {
                'externalId': '/test/file-to-be-linted-w-errors.js-3-10-@typescript-eslint/no-unused-vars',
                'line': 3,
                'message': '\'aFunction\' is defined but never used.',
                'path': '/test/file-to-be-linted-w-errors.js',
                'severity': 'HIGH'
            }, {
                'externalId': '/test/file-to-be-linted-w-errors.js-4-1-no-undef',
                'line': 4,
                'message': '\'console\' is not defined.',
                'path': '/test/file-to-be-linted-w-errors.js',
                'severity': 'HIGH'
            }, {
                'externalId': '/test/file-to-be-linted-w-errors.js-4-20-semi',
                'line': 4,
                'message': 'Missing semicolon.',
                'path': '/test/file-to-be-linted-w-errors.js',
                'severity': 'MEDIUM'
            }])
        );
    });
});