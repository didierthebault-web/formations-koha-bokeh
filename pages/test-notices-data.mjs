import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseISO2709,encodeISO2709} from '../lib/model-notices/iso2709.mjs';
import {importNotices} from './import-notices.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const summary=importNotices(),records=JSON.parse(fs.readFileSync(path.join(root,'data/model-notices/records.json')));
const annotations=JSON.parse(fs.readFileSync(path.join(root,'data/model-notices/annotations.json'))),teaching=JSON.parse(fs.readFileSync(path.join(root,'data/model-notices/teaching.json')));
const field=(r,t)=>r.fields.filter(f=>f.tag===t),values=(f,c)=>f.subfields.filter(s=>s.code===c).map(s=>s.value);
assert.equal(records.length,5);assert.equal(new Set(records.map(r=>r.ark)).size,5);
const muses=records.find(r=>r.id==='cb42534131r'),encyclopedia=records.find(r=>r.id==='cb48709772r');
assert.equal(values(field(muses,'200')[0],'a')[0],'Muses');assert.equal(values(field(muses,'010')[0],'a')[0],'978-2-08-123786-5');
assert.equal(field(muses,'210').length,1);assert.equal(field(muses,'214').length,0);assert.deepEqual(field(muses,'606').map(f=>values(f,'z')[0]),['XIXe siècle','XXe siècle']);
assert.equal(field(encyclopedia,'702').length,3);assert.ok(values(field(encyclopedia,'330')[0],'a')[0].length>1600);
assert.ok(records.find(r=>r.id==='cb44446096v').fields.some(f=>f.raw.includes('\u0098')&&f.raw.includes('\u009c')));
assert.deepEqual(values(field(records.find(r=>r.id==='cb487308160'),'101')[0],'a'),['fre','eng']);
for(const r of records){const bytes=fs.readFileSync(path.join(root,'public/model-notices/sources',r.sourceFile));assert.deepEqual(encodeISO2709(r),bytes);assert.deepEqual(parseISO2709(bytes,r.sourceFile)[0],r);for(const rule of teaching[r.id]){assert.ok(field(r,rule.tag).length);assert.ok(rule.source.startsWith('https://'));}assert.ok(field(r,'200').length);}
for(const a of Object.values(annotations)){assert.ok(['Vérifié','À vérifier','Règle locale'].includes(a.status));assert.equal(a.indicators.length,2);assert.ok(a.role&&a.repeatability&&a.source);}
const original=encodeISO2709(muses);
assert.throws(()=>parseISO2709(original.subarray(0,-1)));
const badEnd=Buffer.from(original);badEnd[badEnd.length-1]=0;assert.throws(()=>parseISO2709(badEnd));
const badDir=Buffer.from(original);badDir[31]=57;assert.throws(()=>parseISO2709(badDir));
const badUtf8=Buffer.from(original);badUtf8[Number(muses.leader.slice(12,17))]=0xff;assert.throws(()=>parseISO2709(badUtf8));
assert.equal(parseISO2709(Buffer.concat([original,original])).length,2);
console.log(JSON.stringify({result:'PASS',...summary,malformedRecordsRejected:4,multipleRecords:'OK',originalValuesAndSubfields:'OK'}));
