import simpleGit from 'simple-git';
import chalk from "chalk";
import {logError, logInfo, logSuccess} from "./logger.js";
import {COMMIT_TYPES} from "./constants.js";

const options = {
    baseDir: process.cwd(),
    binary: 'git',
}

const git = simpleGit(options);

export async function getBranchName() {
    try {
        const status = await git.status()
        logInfo(chalk.bold('  Current Branch : ') + chalk(status.current))
        return status.current;
    } catch (error) {
        logError('Could not get current branch');
    }
}

export async function getDefaults() {
    const branch = await getBranchName();

    const match = branch.match(/^([a-zA-Z]+)\/(\d+)?-?(.+)?/);

    if (!match) {
        return {
            scope: '',
            id: ''
        }
    }

    const [branchname, scope, id, title] = match;

    if (COMMIT_TYPES.includes(scope)) {
        return {
            branchname,
            scope,
            id: id || '',
            title: title || ''
        }
    }

    return {
        scope: '',
        id: ''
    }
}

export async function appendFiles() {
    try {
        await git.add(['.'])
    } catch (error) {
        logError(error);
    }
}

export async function commitMessage(message) {
    try {
        const commit = await git.commit(message);
        logSuccess()

        return commit
    } catch (error) {
        logError(error);
    }
}

export async function appendToCommit() {
    try {
        await git.add('.')
        await git.raw(['commit', '--amend', '--no-edit']);


        logSuccess('Append files to latest commit')
    } catch (error) {
        if (error instanceof Error && error.name === 'ExitPromptError') {
            console.log('👋 until next time!');
            return
        }

        logError(error);
    }
}

export async function newBranch(name) {
    try {
        const branch = await git.checkoutLocalBranch(name);

        logSuccess(`created new branch: ` + chalk.bold(name));
    } catch (error) {
        logError(error);
    }
}

async function getDefaultBranch() {
    try {
        const branches = await git.branch();
        logInfo(chalk.bold('  Current branch : ') + chalk(branches.current));

        const remoteBranches = await git.listRemote(['--symref', 'origin', 'HEAD'])

        const lines = remoteBranches.split('\n');
        const headLine = lines.find(line => line.includes('ref: refs/heads/'))

        if (headLine) {
            // Ekstraher branch-navnet fra linjen
            const match = headLine.match(/refs\/heads\/(\S+)/);
            if (match) {
                const defaultBranch = match[1];
                logInfo(chalk.bold('  Default branch : ') + chalk(defaultBranch));
                return defaultBranch;
            }
        }
        logError('No default branches found.');
        process.exit(0)

    } catch (error) {
        logError(error);
    }
}

export async function goHome() {
    try {
        const defaultBranch = await getDefaultBranch();

        logInfo(chalk.bold('  Checkout to : ') + chalk(defaultBranch));
        await git.checkout(defaultBranch);

        logInfo(chalk.bold('  Fetching updates...'));
        await git.pull()

        logSuccess()

    } catch (error) {
        logError(error);
    }
}