import fs from 'node:fs';
import packageJson from './package.json' with { type: 'json' };

const data = { ...packageJson };
delete data.engines;

fs.renameSync('./package.json', './package.txt');

fs.writeFileSync('./package.json', JSON.stringify(data), {
  flag: 'w',
  encoding: 'utf8',
});

fs.rmSync('./package.txt', { force: true });
