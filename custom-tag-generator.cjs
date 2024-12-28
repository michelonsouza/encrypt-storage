/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable import/no-extraneous-dependencies */
const simpleGit = require('simple-git');

const git = simpleGit();

module.exports = async (pluginConfig, context) => {
  const tags = await git.tags();
  const lastTag = tags.latest;
  let newTag = '';

  const { commits } = context;
  const hasBreakingChange = commits.some(commit =>
    commit.message.includes('BREAKING CHANGE'),
  );
  const hasNewFeature = commits.some(commit => commit.message.includes('feat'));
  const hasNewBugFix = commits.some(commit => commit.message.includes('fix'));

  if (!lastTag) {
    return 'v1.0.0';
  }

  if (lastTag.includes('beta')) {
    const [versionPrefix, betaVersion] = lastTag.split('-beta.')[1];
    const newBetaVersion = parseInt(betaVersion, 10) + 1;
    newTag = `${versionPrefix}-beta.${newBetaVersion}`;
  } else {
    const [, version] = lastTag.split('v');
    const [major, minor, patch] = version.split('.');

    const newPatch = hasNewBugFix ? parseInt(patch, 10) + 1 : patch;
    const newMinor = hasNewFeature ? parseInt(minor, 10) + 1 : minor;
    const newMajor = hasBreakingChange ? parseInt(major, 10) + 1 : major;

    newTag = `v${newMajor}.${newMinor}.${newPatch}`;
  }

  // return newTag;

  return `${lastTag}${newTag}`;
};
