import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {checkGlossary} from './check-glossary.mjs';
import {checkTours} from './check-tours.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const out = path.join(root, 'docs');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const write = (name, data) => {const dest = path.join(out, name); fs.mkdirSync(path.dirname(dest), {recursive:true}); fs.writeFileSync(dest, data);};
const copy = (from, to) => {const dest = path.join(out, to); fs.mkdirSync(path.dirname(dest), {recursive:true}); const source=path.join(root,from);if(fs.statSync(source).isDirectory())fs.cpSync(source,dest,{recursive:true});else fs.copyFileSync(source, dest);};
const seed = read('corpus/seed.json');
const refs = read('lib/reference-files.json');
const documents = {};
for (const source of seed.resources) {
  const {pages, ...metadata} = source;
  const versionId = 'initial-' + source.id;
  const original = 'files/originals/' + source.filename;
  const preview = source.previewFile ? 'files/previews/' + path.basename(source.previewFile) : source.format === 'PDF' ? original : null;
  const originalBytes = fs.readFileSync(path.join(root, 'corpus/originals', source.filename));
  if (crypto.createHash('sha256').update(originalBytes).digest('hex') !== source.sha256) throw Error('Original modified: ' + source.id);
  copy('corpus/originals/' + source.filename, original);
  if (source.previewFile) copy(source.previewFile, preview);
  const resource = {...metadata, access: 'public', currentVersion:versionId, indexed:pages.length > 0, preview:!!preview, updated:seed.auditDate, readOnly:true};
  const version = {id:versionId, label:source.version, filename:source.filename, format:source.format, size:source.size, sha256:source.sha256, created:seed.auditDate, actor:'Import initial', indexed:pages.length > 0, preview_key:source.previewFile || null};
  documents[source.id] = {resource, versions:[version], selectedVersion:versionId, pages, canEdit:false, original, preview};
}
for (const [id, entry] of Object.entries(refs)) {
  const original = 'files/references/' + entry.resource.filename;
  copy('corpus/references/' + entry.resource.filename, original);
  documents[id] = {...entry, resource:{...entry.resource,access:'public'}, versions:[entry.version], selectedVersion:entry.version.id, canEdit:false, original, preview:original};
}
const names = {cataloguer:'cataloguer','administrer-koha':'admin-koha','administrer-bokeh':'bokeh',contribuer:'contribuer'};
const definitions = Object.fromEntries(Object.entries(names).map(([id, file])=>[id, read('lib/learning/' + file + '.json')]));
// Shared glossary labels are derived from the existing courses, never authored twice.
const glossaryLessons = Object.fromEntries(Object.entries(definitions).flatMap(([courseId,course])=>course.modules.flatMap(module=>module.lessons.map(lesson=>{
  const origin=lesson.sharedFrom?definitions[lesson.sharedFrom.courseId].modules.flatMap(m=>m.lessons).find(l=>l.id===lesson.sharedFrom.lessonId):lesson;
  return [[courseId,module.id,lesson.id].join('/'),{courseTitle:course.title,moduleTitle:module.title,title:origin.title}];
}))));
fs.writeFileSync(path.join(root,'lib/glossary-lessons.json'),JSON.stringify(glossaryLessons,null,2)+'\n');
write('glossaire.json',JSON.stringify(read('lib/glossary.json'),null,2)+'\n');
console.log('Glossary:',JSON.stringify(checkGlossary()));
const figureFiles = {cataloguer:'figures','administrer-koha':'admin-figures','administrer-bokeh':'bokeh-figures',contribuer:'bokeh-figures'};
const learning = {};
let figureCount = 0;
for (const [id, base] of Object.entries(definitions)) {
  const figures = {};
  for (const [key, value] of Object.entries(read('lib/learning/' + figureFiles[id] + '.json'))) {
    const filename = `figures/${id}/${key}.${value.mime === 'image/jpeg' ? 'jpg' : 'png'}`;
    write(filename, Buffer.from(value.data, 'base64'));
    figures[key] = {alt:value.alt, resourceId:value.resourceId, page:value.page, url:filename};
    figureCount++;
  }
  const modules = base.modules.map(module=>({...module,lessons:module.lessons.map(entry=>{
    if (!entry.sharedFrom) return entry;
    const origin = definitions[entry.sharedFrom.courseId];
    const lesson = origin.modules.flatMap(m=>m.lessons).find(l=>l.id===entry.sharedFrom.lessonId);
    if (!lesson) throw Error('Missing shared lesson: ' + entry.id);
    return {...lesson,id:entry.id,sharedFrom:{...entry.sharedFrom,title:origin.title},editable:false};
  })}));
  learning[id] = {...base, modules, restricted:false, editable:false, figures, outdatedSources:[], sources:base.requiredResources.map(resourceId=>({id:resourceId,title:documents[resourceId].resource.title,version:documents[resourceId].resource.currentVersion}))};
}
const resources = Object.values(documents).map(d=>d.resource);
const state = {user:null,courses:seed.courses,resources,issues:read('lib/audit.json').issues,stats:{courses:seed.courses.length,resources:resources.length,review:resources.filter(r=>r.validation==='review').length},tracking:false};
fs.writeFileSync(path.join(here, 'snapshot.json'),JSON.stringify({state,documents,learning}));
for (const name of fs.readdirSync(path.join(root,'public'))) copy('public/'+name,name);
const toursManifest=checkTours();
console.log('Guided tours:',JSON.stringify(toursManifest));
let css = fs.readFileSync(path.join(root,'app/globals.css'),'utf8').replace("@import 'tailwindcss';",'');
css += '\n/* Browser defaults equivalent to the original Tailwind reset. */\nbody{line-height:1.5}button{font-family:inherit}h1,h2,h3{margin-top:0}img{max-width:100%}\n';
write('platform.css',css);
const adapter = path.join(here,'public-api.ts').replaceAll('\\','/');
const originalsPlugin = {name:'github-pages-content', setup(ctx) {
  ctx.onLoad({filter:/app[\\/](platform|cataloguer)\.tsx$/}, args=>{
    let text = fs.readFileSync(args.path,'utf8');
    text = `import {publicFetch,publicFile,publicAsset} from '${adapter}';\n` + text;
    if (args.path.endsWith('platform.tsx')) {
      text = text.replace("fetch('/api/'+path,options)","publicFetch('/api/'+path,options)");
      text = text.replace('src="/koha-logo.png"','src={publicAsset("koha-logo.png")}').replace('src="/kiwi.png"','src={publicAsset("kiwi.png")}');
      text = text.replace("const source='/api/resources/'+r.id+'/file?version='+v.id;const preview=source+'&preview=1#page='+page;", "const source=publicFile(r.id);const preview=publicFile(r.id,true)+'#page='+page;");
      text = text.replace("href={source+'&download=1'}",'href={source} download={v.filename}');
      text = text.replace("{state.user?.role==='visitor'||!state.user?",'{false?');
      const start = text.indexOf(" {view==='personal'&&");
      const end = text.indexOf(" {view==='admin'&&",start);
      if (start<0||end<0) throw Error('Personal view not found');
      text = text.slice(0,start)+` {view==='personal'&&<><div className="eyebrow">VOTRE ENVIRONNEMENT</div><h1>Mon espace</h1><section className="panel"><h2>Les formations en accès libre</h2><p>Tous les parcours, leçons, supports et documents sont consultables sans compte dans cette version.</p><p className="muted">La gestion des comptes et des inscriptions ainsi que l’administration partagée nécessitent un serveur applicatif.</p></section><h2>Les parcours de formation</h2><div className="course-grid">{courses.map(courseCard)}</div></>}\n`+text.slice(end);
      text = text.replace('href="/?view=home"','href="?view=home"');
    } else {
      text = text.replaceAll("fetch('/api/learning/'+courseId", "publicFetch('/api/learning/'+courseId");
      text = text.replaceAll("src={'/api/learning/'+courseId+'/figure/'+lesson.figure}","src={publicAsset(data.figures[lesson.figure].url)}");
      text = text.replaceAll("src={'/api/learning/'+courseId+'/figure/'+zoom}","src={publicAsset(data.figures[zoom].url)}");
    }
    return {contents:text,loader:'tsx',resolveDir:path.dirname(args.path)};
  });
}};
await build({entryPoints:[path.join(here,'main.tsx')],bundle:true,outfile:path.join(out,'platform.js'),minify:true,jsx:'automatic',nodePaths:[path.join(here,'node_modules')],alias:{'@':root},plugins:[originalsPlugin],define:{'process.env.NODE_ENV':'"production"'},target:['es2022'],legalComments:'eof'});
write('index.html',`<!doctype html>\n<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Formations KOHA et BOKEH : parcours complets, leçons, supports et ressources du réseau documentaire du ministère de la Culture."><title>Formations KOHA &amp; BOKEH — Réseau documentaire</title><link rel="icon" href="./favicon.svg"><link rel="stylesheet" href="./platform.css"></head><body><div id="root"></div><script type="module" src="./platform.js"></script></body></html>\n`);
write('.nojekyll','');
const lessonCount = Object.values(learning).reduce((n,c)=>n+c.modules.reduce((s,m)=>s+m.lessons.length,0),0);
write('content-manifest.json',JSON.stringify({sourceCommit:'13bcaa1ab4c1898542fd4976d4f3e254d3090339',courses:4,modules:34,lessons:lessonCount,documents:resources.length,figures:figureCount,glossary:read('lib/glossary.json').length,guidedTours:toursManifest.tours,guidedTourSteps:toursManifest.steps},null,2)+'\n');
console.log(JSON.stringify({courses:4,modules:34,lessons:lessonCount,documents:resources.length,figures:figureCount}));
