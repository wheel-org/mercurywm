// usage: node append_build_number.js [number]
const build_number = Number(process.argv[2]);
console.log("Got build number: " + build_number);

const fs = require('fs');
const manifest_data = fs.readFileSync('build/manifest.json');
let manifest = JSON.parse(manifest_data);

manifest.version += '.' + build_number;

const manifest_string = JSON.stringify(manifest);

console.log('Written back to manifest.json');
fs.writeFileSync('build/manifest.json', manifest_string);
