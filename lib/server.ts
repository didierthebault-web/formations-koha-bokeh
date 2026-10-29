import { env } from 'cloudflare:workers';
import {canEdit,canRead,isAdmin,isHistoryAllowed,norm,list,type Person} from './policy';
export {canEdit,canRead,isAdmin,isHistoryAllowed,norm,list};
export const db=()=>{if(!env.DB)throw new Error('Base de données indisponible');return env.DB;};
export const bucket=()=>{if(!env.BUCKET)throw new Error('Stockage indisponible');return env.BUCKET;};
export const now=()=>new Date().toISOString();
export const uid=()=>crypto.randomUUID();
export class HttpError extends Error{status:number;constructor(status:number,message:string){super(message);this.status=status;}}
export function assert(ok:unknown,status:number,message:string):asserts ok{if(!ok)throw new HttpError(status,message);}
export async function person(req:Request):Promise<Person|null>{
 const id=req.headers.get('oai-authenticated-user-id');const email=req.headers.get('oai-authenticated-user-email')?.toLowerCase();if(!id||!email)return null;
 let user=await db().prepare('SELECT * FROM users WHERE id=? OR email=?').bind(id,email).first<Person>();
 if(!user&&email===(env as any).OWNER_EMAIL?.toLowerCase()){
  await db().prepare('INSERT OR IGNORE INTO users (id,email,name,role,structure,active,enrollments,assignments,last_seen) VALUES (?,?,?,?,?,1,?,?,?)').bind(id,email,'Responsable de la plateforme','admin','Administration centrale','[]','[]',now()).run();
  user=await db().prepare('SELECT * FROM users WHERE id=?').bind(id).first<Person>();
 }
 if(user){assert(user.active===1,403,'Ce compte est désactivé.');
  if(user.id!==id){assert(user.id.startsWith('pending_'),403,'Identité de compte incohérente.');await db().prepare('UPDATE users SET id=? WHERE id=?').bind(id,user.id).run();user.id=id;}
  // Keep only the most recent connection, at most one update per hour.
  if(!user.last_seen||Date.now()-Date.parse(user.last_seen)>3600000)await db().prepare('UPDATE users SET last_seen=? WHERE id=?').bind(now(),id).run();
  return user;
 }
 return {id,email,name:email,role:'visitor',structure:'',active:1,enrollments:'[]',assignments:'[]'};
}
export async function log(u:Person|string,action:string,target:string){await db().prepare('INSERT INTO audit (id,actor,action,target,created) VALUES (?,?,?,?,?)').bind(uid(),typeof u==='string'?u:u.email,action,target,now()).run();}
export async function resource(id:string){const r=await db().prepare('SELECT * FROM resources WHERE id=?').bind(id).first<any>();assert(r,404,'Ressource introuvable.');return {...JSON.parse(r.data),id:r.id,currentVersion:r.current_version,updated:r.updated};}
export async function course(id:string){const r=await db().prepare('SELECT * FROM courses WHERE id=?').bind(id).first<any>();assert(r,404,'Formation introuvable.');return {...JSON.parse(r.data),id:r.id,updated:r.updated};}
export function json(data:any,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}});}
export async function readJSON(req:Request){assert(Number(req.headers.get('content-length')||0)<3000000,413,'Requête trop volumineuse.');const text=await req.text();assert(text.length<3000000,413,'Requête trop volumineuse.');try{return JSON.parse(text);}catch{throw new HttpError(400,'JSON invalide.');}}
export function mutationOrigin(req:Request){const o=req.headers.get('origin');if(o)assert(o===new URL(req.url).origin,403,'Origine de requête non autorisée.');assert(req.headers.get('sec-fetch-site')!=='cross-site',403,'Requête intersite refusée.');}
export async function digest(b:ArrayBuffer){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b))).map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function validateFile(f:File){assert(f instanceof File,400,'Sélectionnez un fichier.');assert(f.size>0&&f.size<=25*1024*1024,413,'Le fichier doit peser entre 1 octet et 25 Mo.');const ext=f.name.split('.').pop()?.toUpperCase();assert(['PDF','PPTX','DOCX'].includes(ext||''),400,'Formats acceptés : PDF, PPTX et DOCX.');const b=await f.arrayBuffer();const bytes=new Uint8Array(b);const sig=new TextDecoder('latin1').decode(bytes);if(ext==='PDF'){assert(sig.startsWith('%PDF-'),400,'Signature PDF incorrecte.');assert(!/\/(JavaScript|JS|Launch|EmbeddedFile|OpenAction)\b/.test(sig),400,'PDF actif ou pièce jointe incorporée refusés.');}else{
 assert(bytes[0]===80&&bytes[1]===75&&bytes[2]===3&&bytes[3]===4,400,'Signature Office incorrecte.');assert(sig.includes('[Content_Types].xml')&&sig.includes(ext==='DOCX'?'word/document.xml':'ppt/presentation.xml'),400,'Structure Office invalide.');assert(!/vbaProject|embeddings\/|activeX\//i.test(sig),400,'Macros et objets actifs incorporés refusés.');
 // Validate directory bounds and decompression budget without unpacking server-side.
 const view=new DataView(b);let entries=0,total=0;for(let i=0;i<bytes.length-46;i++){if(view.getUint32(i,true)===0x02014b50){entries++;const uncompressed=view.getUint32(i+24,true);total+=uncompressed;assert(total<200*1024*1024&&entries<5000,400,'Archive Office trop complexe.');const n=view.getUint16(i+28,true),x=view.getUint16(i+30,true),c=view.getUint16(i+32,true);assert(i+46+n+x+c<=bytes.length,400,'Archive Office endommagée.');i+=45+n+x+c;}}assert(entries>0,400,'Archive Office endommagée.');
 }return {b,format:ext!,sha:await digest(b)};}
export function validateResource(d:any){assert(typeof d.title==='string'&&d.title.trim().length>0&&d.title.length<300,400,'Un titre de moins de 300 caractères est requis.');assert(['KOHA','BOKEH','Transversal'].includes(d.software),400,'Logiciel invalide.');assert(['draft','published','archived'].includes(d.publication),400,'Statut de publication invalide.');assert(['review','validated','draft'].includes(d.validation),400,'Statut de validation invalide.');assert(['public','members','enrolled'].includes(d.access),400,'Condition d’accès invalide.');assert(!(String(d.classification||'').startsWith('C1')&&d.access==='public'),400,'Une ressource classifiée C1 ne peut pas être rendue publique.');for(const k of ['categories','keywords','courses'])assert(Array.isArray(d[k])&&d[k].length<100&&d[k].every((v:any)=>typeof v==='string'&&v.length<200),400,'Liste de métadonnées invalide.');assert(JSON.stringify(d).length<30000,400,'Métadonnées trop volumineuses.');return d;}
export async function indexPages(versionId:string,pages:any[]){assert(Array.isArray(pages)&&pages.length<=1000,400,'Index trop volumineux.');const jobs=pages.map((p,i)=>{assert(typeof p.content==='string'&&p.content.length<150000,400,'Texte de page invalide.');return db().prepare('INSERT INTO pages (id,version_id,number,label,content,normalized) VALUES (?,?,?,?,?,?)').bind(uid(),versionId,Number(p.number)||i+1,String(p.label||'page'),p.content,norm(p.content));});for(let i=0;i<jobs.length;i+=40)await db().batch(jobs.slice(i,i+40));await db().prepare('UPDATE versions SET indexed=? WHERE id=?').bind(pages.length?1:0,versionId).run();}
