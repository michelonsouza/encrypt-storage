const fs = require('fs');

const data = fs.readFileSync('./package.txt', {encoding:'utf8', flag:'r'});

fs.writeFileSync('./package.json', data, {
  flag: 'w',
  encoding: "utf8"
});
