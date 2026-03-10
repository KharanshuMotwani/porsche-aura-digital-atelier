const fs = require('fs');
const buffer = fs.readFileSync('/Users/lavesh/Documents/porsche_modified/porsche-aura-digital-atelier/public/source/2014_-_porsche_918_spyder_rigged__mid-poly.glb');
const chunkLength = buffer.readUInt32LE(12);
const json = JSON.parse(buffer.subarray(20, 20 + chunkLength).toString('utf8'));
const names = json.nodes.map(n => n.name).filter(Boolean);
const wheelNames = names.filter(n => n.toLowerCase().includes('wheel') || n.toLowerCase().includes('tire') || n.toLowerCase().includes('tyre') || n.toLowerCase().includes('rim') || n.toLowerCase().includes('spoke') || n.toLowerCase().includes('hub') || n.toLowerCase().includes('disc') || n.toLowerCase().includes('alloy'));
console.log("Matching names:", wheelNames);
console.log("All names sample:", names.slice(0, 30));
