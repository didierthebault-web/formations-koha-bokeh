import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function checkTours(){
 const directory=path.join(root,'data/guided-tours');
 const scenarios=fs.readdirSync(directory).filter(n=>n.endsWith('.json')).map(n=>JSON.parse(fs.readFileSync(path.join(directory,n),'utf8')));
 const lessons=JSON.parse(fs.readFileSync(path.join(root,'lib/glossary-lessons.json'),'utf8'));
 const types=['highlight','click','tooltip','navigation'];
 for(const tour of scenarios){
  assert.ok(!/^(https?:|\/\/)/.test(tour.image),'Tour image must be local');
  const asset=path.resolve(root,'public',tour.image),publicRoot=path.resolve(root,'public')+path.sep;
  assert.ok(asset.startsWith(publicRoot),'Image must remain in public/');
  const image=fs.readFileSync(asset);assert.equal(crypto.createHash('sha256').update(image).digest('hex'),tour.imageSha256);
  assert.equal(image.readUInt32BE(16),tour.imageWidth);assert.equal(image.readUInt32BE(20),tour.imageHeight);
  assert.ok(Math.abs(tour.imageWidth/tour.imageHeight-tour.coordinateWidth/tour.coordinateHeight)<.005,'Coordinate and image ratios differ');
  const ids=new Set();
  for(const zone of tour.zones){assert.ok(!ids.has(zone.id),'Duplicate zone');ids.add(zone.id);assert.ok(types.includes(zone.type));assert.ok(zone.x>=0&&zone.y>=0&&zone.width>0&&zone.height>0&&zone.x+zone.width<=tour.coordinateWidth&&zone.y+zone.height<=tour.coordinateHeight,'Target outside image');}
  for(const step of tour.steps){assert.ok(step.title&&step.paragraphs.length);for(const target of step.targets)assert.ok(ids.has(target.zoneId)&&types.includes(target.type));}
  for(const id of tour.exploreZones)assert.ok(ids.has(id));
  const ref=tour.nextLesson;assert.ok(lessons[[ref.courseId,ref.moduleId,ref.lessonId].join('/')],'Next lesson does not exist');
 }
 return {tours:scenarios.length,steps:scenarios.reduce((n,t)=>n+t.steps.length,0)};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(checkTours()));
