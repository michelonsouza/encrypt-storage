/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const currentYear = new Date().getFullYear();

const licensePath = path.resolve('LICENSE');

try {
  const licenseContent = fs.readFileSync(licensePath, 'utf8');
  let oldYear = 0;

  const updatedContent = licenseContent.replace(
    /(\bCopyright\b.*\b)(\d{4})(?!.*\d{4})/,
    (match, prefix, year) => {
      oldYear = parseInt(year, 10);

      if (parseInt(year, 10) !== currentYear) {
        console.log(`Updating year from ${year} to ${currentYear}`);
        return `${prefix}${currentYear}`;
      }
      return match; // No change needed
    },
  );

  if (oldYear !== 0 && oldYear !== currentYear) {
    fs.writeFileSync(licensePath, updatedContent, 'utf-8');
    console.log('LICENSE file updated successfully.');

    execSync('git add LICENSE', { stdio: 'inherit' });
    execSync('git commit -m "chore(license): update LICENSE file"', {
      stdio: 'inherit',
    });

    console.log('LICENSE file committed successfully.');
  }
} catch {
  console.error('LICENSE file not found.');
  process.exit(1);
}
