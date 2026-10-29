import {referenceList,referenceSearch,referenceDocument} from '@/lib/reference-files';
import {env} from 'cloudflare:workers';
import {db,bucket,now,uid,assert,person,log,resource,course,json,readJSON,mutationOrigin,digest,validateFile,validateResource,indexPages,canEdit,canRead,isAdmin,isHistoryAllowed,norm,HttpError} from '@/lib/server';
import {canCourse} from '@/lib/policy';
import auditReport from '@/lib/audit.json';
import {learning} from '@/lib/learning';
export const dynamic='force-dynamic';
async function handle(req:Request){try{
 const url=new URL(req.url);const path=url.pathname.replace(/^\/api\/?/,'').split('/').filter(Boolean);const [kind,id,action]=path;const write=req.method!=='GET';if(write)mutationOrigin(req);
 // Initial corpus import uses a scoped secret and is irreversibly locked after verification.
 if(kind==='import'){
  assert(req.method==='POST',405,'Méthode non autorisée.');assert((env as any).IMPORT_SECRET&&req.headers.get('authorization')===`Bearer ${(env as any).IMPORT_SECRET}`,401,'Import non autorisé.');
  const lock=await db().prepare('SELECT value FROM settings WHERE id=?').bind('importLocked').first<any>();assert(!lock,403,'L’import initial est clos.');
  if(action==='unused')return json({});
  if(url.searchParams.get('action')==='seed'){
   const s=await readJSON(req);assert(Array.isArray(s.resources)&&Array.isArray(s.courses),400,'Corpus invalide.');
   for(const c of s.courses)await db().prepare('INSERT OR IGNORE INTO courses (id,data,updated) VALUES (?,?,?)').bind(c.id,JSON.stringify(c),now()).run();
   for(const r of s.resources){const v='initial-'+r.id;const existing=await db().prepare('SELECT id FROM resources WHERE id=?').bind(r.id).first();if(existing)continue;
    const {pages,...meta}=r;await db().prepare('INSERT INTO resources (id,data,current_version,updated) VALUES (?,?,?,?)').bind(r.id,JSON.stringify(meta),v,now()).run();
    await db().prepare('INSERT INTO versions (id,resource_id,label,filename,object_key,preview_key,format,size,sha256,created,actor,indexed) VALUES (?,?,?,?,?,?,?,?,?,?,?,0)').bind(v,r.id,r.version,r.filename,'originals/'+v,r.previewFile?'previews/'+v:null,r.format,r.size,r.sha256,now(),'Import initial').run();await indexPages(v,pages);
   }await log('Import initial','corpus.seed','7 sources');return json({ok:true});
  }
  if(url.searchParams.get('action')==='object'){
   const f=await req.formData();const r=await resource(String(f.get('resourceId')));const v=await db().prepare('SELECT * FROM versions WHERE id=?').bind(r.currentVersion).first<any>();const file=f.get('file') as File;const parsed=await validateFile(file);const preview=f.get('preview')==='true';if(!preview)assert(parsed.sha===v.sha256,400,'Empreinte du fichier différente de l’original.');if(preview)assert(parsed.format==='PDF'&&v.preview_key,400,'Aperçu PDF non attendu.');await bucket().put(preview?v.preview_key:v.object_key,parsed.b,{httpMetadata:{contentType:preview||v.format==='PDF'?'application/pdf':'application/octet-stream'}});return json({ok:true});
  }
  if(url.searchParams.get('action')==='lock'){
   const all=(await db().prepare('SELECT * FROM versions').all<any>()).results;assert(all.length===7,409,'Sept sources attendues.');for(const v of all){assert(await bucket().head(v.object_key),409,'Original manquant.');if(v.preview_key)assert(await bucket().head(v.preview_key),409,'Aperçu manquant.');}await db().prepare('INSERT INTO settings (id,value) VALUES (?,?)').bind('importLocked',now()).run();await log('Import initial','corpus.lock','7 originaux vérifiés');return json({ok:true,resources:all.length});
  }throw new HttpError(400,'Action d’import inconnue.');
 }
 const user=await person(req);
 if(kind==='resources'){const reference=referenceDocument(req,path,user);if(reference)return reference;}
 if(kind==='learning')return await learning(req,path,user);
 if(kind==='state'&&req.method==='GET'){
  const courses=(await db().prepare('SELECT * FROM courses').all<any>()).results.map(c=>({...JSON.parse(c.data),id:c.id,updated:c.updated})).filter(c=>canCourse(user,c));
  const rows=(await db().prepare('SELECT r.*,v.format,v.filename,v.size,v.indexed,v.preview_key FROM resources r LEFT JOIN versions v ON v.id=r.current_version').all<any>()).results;
  const resources=rows.map(r=>({...JSON.parse(r.data),id:r.id,currentVersion:r.current_version,updated:r.updated,format:r.format,filename:r.filename,size:r.size,indexed:!!r.indexed,preview:!!r.preview_key||r.format==='PDF'})).filter(r=>canRead(user,r)).concat(referenceList(user));
  return json({user,courses,resources,issues:user&&user.role!=='visitor'?auditReport.issues:[],stats:{courses:courses.filter(c=>c.publication==='published').length,resources:resources.length,review:resources.filter(r=>r.validation==='review').length},tracking:false});
 }
 if(kind==='search'&&req.method==='GET'){
  const query=(url.searchParams.get('q')||'').trim();assert(query.length<=200,400,'Recherche trop longue.');const all=(await db().prepare('SELECT * FROM resources').all<any>()).results;const tokens=norm(query).split(/\s+/).filter(Boolean).slice(0,8);const results=[];const allCourses=(await db().prepare('SELECT data FROM courses').all<any>()).results.map(c=>JSON.parse(c.data));
  for(const row of all){const r={...JSON.parse(row.data),id:row.id,currentVersion:row.current_version};if(!canRead(user,r))continue;
   if(url.searchParams.get('software')&&r.software!==url.searchParams.get('software'))continue;if(url.searchParams.get('category')&&!r.categories.includes(url.searchParams.get('category')))continue;
   const associated=allCourses.filter(c=>r.courses.includes(c.id)&&canCourse(user,c));
   const hay=norm([r.title,r.description,r.audience,...r.keywords,...r.categories,...associated.flatMap(c=>[c.title,c.audience,...c.modules.map((m:any)=>m.title)])].join(' '));
   const pages=(await db().prepare('SELECT number,label,content,normalized FROM pages WHERE version_id=? ORDER BY number').bind(row.current_version).all<any>()).results;
   const hits=pages.filter(p=>tokens.every(t=>p.normalized.includes(t))).slice(0,5);if(tokens.length&&!tokens.every(t=>hay.includes(t))&&!hits.length)continue;
   results.push({id:r.id,title:r.title,description:r.description,software:r.software,categories:r.categories,validation:r.validation,hits:hits.map(p=>{const at=tokens.length?p.normalized.indexOf(tokens[0]):0;return {number:p.number,label:p.label,snippet:p.content.slice(Math.max(0,at-90),Math.max(0,at-90)+330)};})});
  }results.push(...referenceSearch(user,url));return json({results,index:'Texte extrait et métadonnées ; aucun OCR des captures d’écran.',query});
 }
 if(kind==='resources'&&req.method==='GET'&&id){
  const r=await resource(id);assert(canRead(user,r),user?403:401,'Accès non autorisé à cette ressource.');
  if(action==='file'){
   const version=url.searchParams.get('version')||r.currentVersion;assert(version===r.currentVersion||isHistoryAllowed(user,r),403,'Historique réservé aux personnes habilitées.');const v=await db().prepare('SELECT * FROM versions WHERE id=? AND resource_id=?').bind(version,id).first<any>();assert(v,404,'Version introuvable.');const preview=url.searchParams.get('preview')==='1';const isPdf=preview||v.format==='PDF';const inline=isPdf&&url.searchParams.get('download')!=='1';assert(inline||r.download||canEdit(user,r),403,'Téléchargement non autorisé.');const key=preview&&v.preview_key?v.preview_key:v.object_key;assert(!preview||v.preview_key||v.format==='PDF',400,'Aperçu indisponible.');const object=await bucket().get(key);assert(object,503,'Fichier non disponible.');const filename=preview?v.filename.replace(/\.[^.]+$/,'.pdf'):v.filename;
   return new Response(object.body,{headers:{'Content-Type':isPdf?'application/pdf':v.format==='PPTX'?'application/vnd.openxmlformats-officedocument.presentationml.presentation':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','Content-Disposition':`${inline?'inline':'attachment'}; filename*=UTF-8''${encodeURIComponent(filename)}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"frame-ancestors 'self'"}});
  }
  const versions=(await db().prepare('SELECT id,label,filename,format,size,sha256,created,actor,preview_key,indexed FROM versions WHERE resource_id=? ORDER BY created DESC').bind(id).all<any>()).results.filter(v=>v.id===r.currentVersion||isHistoryAllowed(user,r));
  const requested=url.searchParams.get('version')||r.currentVersion;assert(versions.some(v=>v.id===requested),403,'Version non autorisée.');const textPages=(await db().prepare('SELECT number,label,content FROM pages WHERE version_id=? ORDER BY number').bind(requested).all<any>()).results;return json({resource:r,versions,pages:textPages,selectedVersion:requested,canEdit:canEdit(user,r)});
 }
 if(kind==='courses'&&write){assert(user,401,'Connexion requise.');const existing=id?await course(id):null;assert(existing?canEdit(user,existing,'course'):isAdmin(user),403,'Droits de gestion requis.');const d=await readJSON(req);assert(d.title?.trim()&&d.title.length<300&&Array.isArray(d.modules)&&d.modules.length<100,400,'Formation invalide.');assert(['draft','published','archived'].includes(d.publication),400,'Statut invalide.');assert(d.modules.every((m:any)=>m.title&&m.id&&Number(m.start||1)>=1),400,'Chaque module doit avoir un titre et une page de début valide.');for(const k of ['objectives','resources'])assert(Array.isArray(d[k])&&d[k].length<200&&d[k].every((s:any)=>typeof s==='string'&&s.length<2000),400,'Objectifs ou ressources invalides.');assert(JSON.stringify(d).length<60000,400,'Formation trop volumineuse.');const target=id||uid();d.id=target;await db().prepare('INSERT INTO courses (id,data,updated) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated=excluded.updated').bind(target,JSON.stringify(d),now()).run();await log(user,'course.save',target);return json({id:target});}
 if(kind==='resources'&&write){assert(user,401,'Connexion requise.');const existing=id?await resource(id):null;assert(existing?canEdit(user,existing):isAdmin(user),403,'Droits de gestion requis.');
  if(req.headers.get('content-type')?.includes('application/json')){
   assert(existing,400,'Ressource requise.');const d=validateResource(await readJSON(req));if(!isAdmin(user))assert(canEdit(user,d),403,'Affectation hors de votre périmètre.');d.id=id;await db().prepare('UPDATE resources SET data=?,updated=? WHERE id=?').bind(JSON.stringify(d),now(),id).run();await log(user,'resource.metadata',id!);return json({id});
  }
  assert(Number(req.headers.get('content-length')||0)<52*1024*1024,413,'Dépôt trop volumineux.');const f=await req.formData();const file=f.get('file') as File;const parsed=await validateFile(file);const meta=validateResource(JSON.parse(String(f.get('metadata')||'{}')));if(!isAdmin(user))assert(canEdit(user,meta),403,'Affectation hors de votre périmètre.');
  let pdf:ArrayBuffer|undefined;const preview=f.get('preview') as File|null;if(preview&&preview.size){const p=await validateFile(preview);assert(p.format==='PDF',400,'L’aperçu doit être un PDF.');pdf=p.b;}
  const target=id||uid(),v=uid();let pages:any[]=[];const supplied=String(f.get('index')||'');assert(supplied.length<2000000,413,'Index trop volumineux.');if(supplied.trim()){pages=supplied.split('\f').map((content,i)=>({number:i+1,label:parsed.format==='PPTX'?'diapositive':'page',content}));assert(pages.length<=1000&&pages.every(p=>p.content.length<150000),400,'Découpage de l’index invalide.');}
  await bucket().put('originals/'+v,parsed.b);if(pdf)await bucket().put('previews/'+v,pdf);
  const d={...meta,id:target};const t=now();const statements=[];
  if(!existing)statements.push(db().prepare('INSERT INTO resources (id,data,current_version,updated) VALUES (?,?,?,?)').bind(target,JSON.stringify(d),null,t));
  statements.push(db().prepare('INSERT INTO versions (id,resource_id,label,filename,object_key,preview_key,format,size,sha256,created,actor,indexed) VALUES (?,?,?,?,?,?,?,?,?,?,?,0)').bind(v,target,String(f.get('version')||'Nouvelle version').slice(0,150),file.name,'originals/'+v,pdf?'previews/'+v:null,parsed.format,file.size,parsed.sha,t,user.email));
  await db().batch(statements);await indexPages(v,pages);
  await db().prepare('UPDATE resources SET data=?,current_version=?,updated=? WHERE id=?').bind(JSON.stringify(d),v,t,target).run();await log(user,existing?'resource.version':'resource.create',target);return json({id:target,version:v,indexed:pages.length>0});
 }
 if(kind==='users'){
  assert(isAdmin(user),user?403:401,'Administration requise.');
  if(req.method==='GET')return json({users:(await db().prepare('SELECT * FROM users ORDER BY email').all()).results});
  const d=await readJSON(req);assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)&&d.email.length<255,400,'Adresse électronique invalide.');assert(['visitor','learner','trainer','admin'].includes(d.role),400,'Rôle invalide.');assert([0,1].includes(d.active),400,'Activation invalide.');assert(Array.isArray(d.enrollments)&&Array.isArray(d.assignments),400,'Affectations invalides.');if(id===user!.id)assert(d.role==='admin'&&d.active===1,400,'Vous ne pouvez pas retirer vos propres droits administrateur.');
  const existing=id?await db().prepare('SELECT * FROM users WHERE id=?').bind(id).first<any>():null;if(existing?.role==='admin'&&(!d.active||d.role!=='admin')){const n=await db().prepare("SELECT COUNT(*) AS n FROM users WHERE role='admin' AND active=1").first<any>();assert(n.n>1,409,'Conservez au moins un administrateur actif.');}
  const target=id||'pending_'+uid();await db().prepare('INSERT INTO users (id,email,name,role,structure,active,enrollments,assignments) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,name=excluded.name,role=excluded.role,structure=excluded.structure,active=excluded.active,enrollments=excluded.enrollments,assignments=excluded.assignments').bind(target,d.email.toLowerCase(),String(d.name||'').slice(0,200),d.role,String(d.structure||'').slice(0,200),d.active,JSON.stringify(d.enrollments),JSON.stringify(d.assignments)).run();await log(user!,'user.save',target);return json({id:target});
 }
 if(kind==='audit'){assert(isAdmin(user),user?403:401,'Administration requise.');return json({events:(await db().prepare('SELECT * FROM audit ORDER BY created DESC LIMIT 200').all()).results,report:auditReport});}
 if(kind==='backup'&&req.method==='GET'){
  assert(isAdmin(user),user?403:401,'Administration requise.');const tables:Record<string,any>={};for(const table of ['users','courses','resources','versions','pages','audit','settings'])tables[table]=(await db().prepare('SELECT * FROM '+table).all()).results;await log(user!,'backup.export','all');return json({format:'koha-bokeh-backup-v1',created:now(),tables,note:'Exporter aussi les originaux et aperçus par leurs URL protégées ; aucun mot de passe dans cette base.'});
 }
 throw new HttpError(404,'Adresse introuvable.');
 }catch(error){if(error instanceof HttpError)return json({error:error.message},error.status);console.error(JSON.stringify({event:'api.failure',path:new URL(req.url).pathname,message:error instanceof Error?error.message:String(error),cause:error instanceof Error&&error.cause instanceof Error?error.cause.message:undefined}));return json({error:'Le serveur ne parvient pas à charger les données. Réessayez dans quelques instants.'},500);}}
export const GET=handle;export const POST=handle;export const PUT=handle;
