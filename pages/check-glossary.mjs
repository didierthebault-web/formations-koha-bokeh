import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
export function checkGlossary(){
 const entries=read('lib/glossary.json'),original=read('tests/fixtures/glossary-original.json'),requested=read('tests/fixtures/glossary-requested.json');
 const sources=read('lib/glossary-sources.json'),domains=read('lib/glossary-domains.json'),lessons=read('lib/glossary-lessons.json');
 const norm=s=>s.toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
 const ids=new Set(),labels=new Map();
 for(const entry of entries){
  assert.ok(!ids.has(entry.id),'Duplicate id '+entry.id);ids.add(entry.id);
  assert.ok(domains.some(d=>d.id===entry.category),'Invalid domain '+entry.term);
  for(const name of [entry.term,...entry.aliases]){assert.ok(!labels.has(norm(name)),'Duplicate label '+name);labels.set(norm(name),entry.id);}
  assert.ok(entry.definition&&entry.example&&entry.sources.length,'Incomplete entry '+entry.term);
  for(const ref of entry.sources){assert.ok(sources[ref.sourceId],'Missing source '+ref.sourceId);assert.match(sources[ref.sourceId].url,/^(https:\/\/|\?view=document&id=)/);}
  for(const ref of entry.lessonRefs)assert.ok(lessons[[ref.courseId,ref.moduleId,ref.lessonId].join('/')],'Broken lesson '+JSON.stringify(ref));
  if(!original.some(e=>e.id===entry.id)){const words=entry.definition.split(/\s+/).length;assert.ok(words>=30&&words<=80,'Definition word count '+entry.term);}
 }
 for(const entry of entries)for(const id of entry.related)assert.ok(ids.has(id)&&id!==entry.id,'Broken related term '+id);
 for(const previous of original){const next=entries.find(e=>e.id===previous.id);assert.ok(next,'Original removed '+previous.id);assert.equal(next.term,previous.term);assert.equal(next.definition,previous.definition);}
 for(const term of requested)assert.ok(labels.has(norm(term)),'Requested term missing '+term);
 const canonical=term=>labels.get(norm(term));
 assert.equal(canonical('Dérivation'),canonical('Catalogage par dérivation'));
 assert.equal(canonical('Code-barre'),canonical('Code-barres'));
 assert.notEqual(canonical('Indexation'),canonical('Indexation matière'));
 assert.equal(new Set(['Exemplaire','Notice d’exemplaire','Exemplarisation'].map(canonical)).size,3);
 assert.notEqual(canonical('Catalogage'),canonical('Description bibliographique'));
 assert.deepEqual(read('docs/glossaire.json'),entries,'Static glossary is stale');
 assert.equal(Object.keys(lessons).length,77);
 const result={original:original.length,added:entries.length-original.length,total:entries.length,aliases:entries.reduce((n,e)=>n+e.aliases.length,0),requested:requested.length,domains:Object.fromEntries(domains.map(d=>[d.label,entries.filter(e=>e.category===d.id).length]))};
 return result;
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(checkGlossary(),null,2));
