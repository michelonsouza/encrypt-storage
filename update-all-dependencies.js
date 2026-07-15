import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const currentYear = new Date().getFullYear();

const packagePath = path.resolve('package.json');

try {
  const packageJSON = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  const { devDependencies, dependencies } = packageJSON;

  const parsedDependencies = Object.keys(dependencies).join(' ');
  const parsedDevDependencies = Object.keys(devDependencies).join(' ');

  execSync(`yarn add ${parsedDependencies}`, { stdio: 'inherit' });
  execSync(`yarn add -D ${parsedDevDependencies}`, { stdio: 'inherit' });
} catch (error) {
  console.error(`ERROR: ${JSON.stringify(error)}`);
}
