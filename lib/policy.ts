export type Person={id:string;email:string;name:string;role:string;structure:string;active:number;enrollments:string;assignments:string;last_seen?:string};
export const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const list=(s:string)=>{try { const a=JSON.parse(s);return Array.isArray(a)?a:[];}catch{return [];}};
export const isAdmin=(u:Person|null)=>!!u&&u.active===1&&u.role==='admin';
export function canEdit(u:Person|null,data:any,kind='resource') {if(isAdmin(u))return true;if(!u||!u.active||u.role!=='trainer')return false;const ids=kind==='course'?[data.id]:data.courses;return Array.isArray(ids)&&ids.length>0&&ids.every((id:string)=>list(u.assignments).includes(id));}
export function canRead(u:Person|null,d:any){if(canEdit(u,d))return true;if(d.publication!=='published')return false;if(d.access==='public')return true;if(!u||!u.active||!['learner','trainer','admin'].includes(u.role))return false;if(d.access==='enrolled')return d.courses.some((id:string)=>list(u.enrollments).includes(id));return d.access==='members';}
export function canCourse(u:Person|null,c:any){return c.publication==='published'||canEdit(u,c,'course');}
export const isHistoryAllowed=(u:Person|null,d:any)=>canEdit(u,d)||!!d.allowHistory;
export const roleNames:Record<string,string>={visitor:'Visiteur',learner:'Apprenant',trainer:'Formateur',admin:'Administrateur'};
