/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
let content = fs.readFileSync('eslint.json', 'utf16le');
if (!content) { console.log('empty eslint.json'); process.exit(0); }
content = content.replace(/^\uFEFF/, '');
const json = JSON.parse(content);
let out = '';
json.filter(f => f.messages.length > 0).forEach(f => {
    out += '--- ' + f.filePath + '\n';
    f.messages.forEach(m => out += m.line + ':' + m.column + ' - ' + m.message + ' (' + m.ruleId + ')\n');
});
fs.writeFileSync('lint-readable.txt', out);
