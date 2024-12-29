// standard-version-updater.js
const stringifyPackage = require('stringify-package');
const detectIndent = require('detect-indent');
const detectNewline = require('detect-newline');

module.exports.readVersion = contents => {
  return JSON.parse(contents).tracker.package.version;
};

module.exports.writeVersion = (contents, version) => {
  const json = JSON.parse(contents);
  const { indent } = detectIndent(contents);
  const newline = detectNewline(contents);
  json.tracker.package.version = version;
  return stringifyPackage(json, indent, newline);
};
