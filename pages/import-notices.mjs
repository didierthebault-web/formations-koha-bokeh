import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {parseISO2709,encodeISO2709} from '../lib/model-notices/iso2709.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function importNotices(){
 const metadata=JSON.parse(fs.readFileSync(path.join(root,'data/model-notices/metadata.json'),'utf8'));
 const expected=new Set(metadata.map(m=>m.ark)),records=[],report=[];
 for(const file of fs.readdirSync(path.join(root,'public/model-notices/sources')).sort()){
  if(!file.endsWith('.UTF8'))continue;
  const bytes=fs.readFileSync(path.join(root,'public/model-notices/sources',file)),parsed=parseISO2709(bytes,file);
  assert.equal(parsed.length,1,'Un fichier source par notice');assert.deepEqual(encodeISO2709(parsed[0]),bytes,'Aller-retour byte pour byte');
  const r=parsed[0];assert.ok(expected.has(r.ark),'ARK hors corpus : '+r.ark);assert.ok(!records.some(x=>x.ark===r.ark),'Doublon');
  // Check that the public structured subfields reproduce the original raw data.
  for(const f of r.fields)if(f.subfields)assert.equal(f.indicators.join('')+f.subfields.map(s=>'\x1f'+s.code+s.value).join(''),f.raw);
  const warnings=[];
  if(/[\u0098\u009c]/.test(JSON.stringify(r)))warnings.push('Caractères de non-classement conservés ; visualisation explicite dans les données brutes.');
  if(r.fields.some(f=>f.tag==='856'&&f.subfields.some(s=>s.code==='u'&&!/^https?:\/\//.test(s.value))))warnings.push('Identifiants 856$u non absolus : conservés, sans lien ni récupération de couverture.');
  if(r.leader[7]===' ')warnings.push('Niveau bibliographique blanc dans le label source : conservé sans correction.');
  if(r.fields.some(f=>f.tag==='330'&&f.subfields.some(s=>s.code==='2')))warnings.push('330$2 présent : extension non décrite dans la traduction CfU 2010 ; définition à vérifier.');
  records.push(r);report.push({file,ark:r.ark,bytes:bytes.length,sha256:r.sourceSha256,fields:r.fields.length,roundTrip:'identique',warnings});
 }
 assert.equal(records.length,metadata.length);records.sort((a,b)=>metadata.findIndex(m=>m.ark===a.ark)-metadata.findIndex(m=>m.ark===b.ark));
 fs.mkdirSync(path.join(root,'reports'),{recursive:true});
 fs.writeFileSync(path.join(root,'data/model-notices/records.json'),JSON.stringify(records,null,2)+'\n');
 fs.writeFileSync(path.join(root,'reports/notices-import.json'),JSON.stringify({records:records.length,errors:[],files:report},null,2)+'\n');
 return {records:records.length,fields:records.reduce((n,r)=>n+r.fields.length,0),roundTrip:'identique',warnings:report.flatMap(r=>r.warnings).length};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(importNotices()));
