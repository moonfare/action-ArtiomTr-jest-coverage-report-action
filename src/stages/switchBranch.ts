import { exec } from '@actions/exec';

import { GithubRef } from '../typings/Options';

export const switchBranch = async (branch: string) => {
    try {
        await exec(`git fetch --all --depth=1`);
    } catch (err) {
        console.warn('Error fetching git repository', err);
    }

    await exec(`git checkout -f ${branch}`);
};

export const checkoutRef = async (
    ref: GithubRef,
    remoteName: string,
    newBranchName: string
) => {
    if (!ref.ref || !ref.repo || !ref.repo.clone_url || !ref.sha) {
        throw new Error('Invalid ref in context - cannot checkout branch');
    }

    await exec(`git remote add ${remoteName} ${ref.repo.clone_url}`);

    try {
        await exec(`git fetch --depth=1 ${remoteName}`);
    } catch (err) {
        console.warn('Error fetching git repository', err);
    }

    await exec(
        `git checkout -b ${newBranchName} --track ${remoteName}/${ref.ref} -f`
    );
};

export const getCurrentBranch = async () => {
    try {
        let branchStr = '';
        await exec('git rev-parse --abbrev-ref HEAD', undefined, {
            listeners: {
                stdout: (data) => {
                    branchStr += data.toString();
                },
            },
        });

        return branchStr.trim();
    } catch (err) {
        console.warn('Failed to get current branch', err);
    }

    return undefined;
};
