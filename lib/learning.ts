import cataloguerBase from './learning/cataloguer.json';
import adminBase from './learning/admin-koha.json';
import bokehBase from './learning/bokeh.json';
import contribuerBase from './learning/contribuer.json';
import cataloguerFigures from './learning/figures.json';
import adminFigures from './learning/admin-figures.json';
import bokehFigures from './learning/bokeh-figures.json';
import {db,resource,course,assert,canRead,canEdit,json,readJSON,log} from './server';
import {canCourse,type Person} from './policy';
export const cataloguer=cataloguerBase;
const definitions:Record<string,{base:any;figures:any}>={cataloguer:{base:cataloguerBase,figures:cataloguerFigures},'administrer-koha':{base:adminBase,figures:adminFigures},'administrer-bokeh':{base:bokehBase,figures:bokehFigures},contribuer:{base:contribuerBase,figures:bokehFigures}};
export async function learning(req:Request,path:string[],user:Person|null){
 const courseId=path[1];assert(Object.hasOwn(definitions,courseId),404,'Parcours pédagogique introuvable.');const {base,figures}=definitions[courseId];const prefix='learning.'+courseId+'.';const c=await course(courseId);assert(canCourse(user,c),404,'Parcours non disponible.');
 const refs=await Promise.all(base.requiredResources.map((id:string)=>resource(id)));const authorized=refs.every((r:any)=>canRead(user,r));const edit=canEdit(user,c,'course');
 if(path[2]==='figure'){
  assert(req.method==='GET',405,'Méthode non autorisée.');assert(authorized,user?403:401,'Connexion et accès au corpus requis.');const figure=figures[path[3]];assert(figure,404,'Illustration introuvable.');const bytes=Uint8Array.from(atob(figure.data),(v:string)=>v.charCodeAt(0));return new Response(bytes,{headers:{'Content-Type':figure.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}});
 }
 // Shared procedures resolve from one original lesson and its persisted overrides.
 // The contributor course cannot silently acquire permission to edit the BOKEH course.
 const stored=(await db().prepare('SELECT id,value FROM settings WHERE id LIKE ? OR id LIKE ?').bind(prefix+'%','learning.administrer-bokeh.%').all<any>()).results;const overrides=new Map(stored.map(s=>[s.id,JSON.parse(s.value)]));
 const sharedCourses=new Map<string,any>();for(const m of base.modules)for(const l of m.lessons)if(l.sharedFrom&&!sharedCourses.has(l.sharedFrom.courseId))sharedCourses.set(l.sharedFrom.courseId,await course(l.sharedFrom.courseId));
 const originalLesson=(entry:any)=>entry.sharedFrom?definitions[entry.sharedFrom.courseId]?.base.modules.flatMap((v:any)=>v.lessons).find((l:any)=>l.id===entry.sharedFrom.lessonId):entry;
 const modules=base.modules.map((m:any)=>({...m,lessons:m.lessons.map((entry:any)=>{
  const origin=entry.sharedFrom?.courseId||courseId;const original=originalLesson(entry);assert(original,500,'Référence de leçon manquante.');
  const shared=entry.sharedFrom?{...entry.sharedFrom,title:definitions[origin].base.title}:null;return {...original,...(overrides.get('learning.'+origin+'.'+original.id)||{}),id:entry.id,sharedFrom:shared,editable:edit&&(!shared||canEdit(user,sharedCourses.get(origin),'course'))};
 })}));
 if(path[2]==='lesson'){
  assert(authorized,user?403:401,'Connexion et accès au corpus requis.');const lesson=modules.flatMap((m:any)=>m.lessons).find((l:any)=>l.id===path[3]);assert(lesson,404,'Leçon introuvable.');
  if(req.method!=='GET'){
   assert(lesson.editable,403,lesson.sharedFrom?'Cette procédure commune nécessite aussi la gestion du parcours BOKEH.':'Gestion du parcours requise.');const d=await readJSON(req);const values:any={};
   for(const k of ['title','objective','takeaway','warning']){assert(typeof d[k]==='string'&&d[k].length<=4000,400,'Texte de leçon invalide.');values[k]=d[k];}assert(values.title.trim()&&values.objective.trim(),400,'Titre et objectif requis.');
   for(const k of ['paragraphs','steps']){assert(Array.isArray(d[k])&&d[k].length>0&&d[k].length<=30&&d[k].every((s:any)=>typeof s==='string'&&s.length<8000),400,'Paragraphes ou étapes invalides.');values[k]=d[k];}assert(JSON.stringify(values).length<35000,400,'Leçon trop volumineuse.');values.modified=new Date().toISOString();
   const origin=lesson.sharedFrom?.courseId||courseId;await db().prepare('INSERT INTO settings (id,value) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').bind('learning.'+origin+'.'+lesson.id,JSON.stringify(values)).run();await log(user!,'lesson.save',origin+'/'+lesson.id);return json({ok:true});
  }return json({lesson,editable:lesson.editable});
 }
 assert(req.method==='GET',405,'Méthode non autorisée.');
 if(!authorized)return json({courseId:base.courseId,title:base.title,description:base.description,status:base.status,duration:base.duration||'2 jours',software:base.software||'KOHA',symbol:base.symbol||'K',tagline:base.tagline||'LE CATALOGUE MUTUALISÉ',restricted:true,editable:false,modules:base.modules.map((m:any)=>({id:m.id,title:m.title,description:m.description,part:m.part,scope:m.scope,lessons:m.lessons.map((l:any)=>({id:l.id,title:originalLesson(l).title}))}))});
 return json({...base,modules,restricted:false,editable:edit,sources:refs.map((r:any)=>({id:r.id,title:r.title,version:r.currentVersion})),outdatedSources:refs.filter((r:any)=>r.currentVersion!==(base.sourceVersions as any)[r.id]).map((r:any)=>r.title),figures:Object.fromEntries(Object.entries(figures).map(([k,v])=>[k,{alt:(v as any).alt,resourceId:(v as any).resourceId,page:(v as any).page}]))});
}
