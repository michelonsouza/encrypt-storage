const fs = require('fs');
const package = require('./package.json');

const data = {...package};
delete data.engines;

fs.renameSync('./package.json', './package.txt');

fs.writeFileSync('./package.json', JSON.stringify(data), {
  flag: 'w',
  encoding: "utf8"
});
