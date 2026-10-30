import rawEntries from './glossary.json';
import rawDomains from './glossary-domains.json';
import rawSources from './glossary-sources.json';

export type LessonRef={courseId:string;moduleId:string;lessonId:string};
export type GlossaryEntry={id:string;term:string;definition:string;category:string;aliases:string[];example:string;software?:string;unimarc?:string;related:string[];sources:{sourceId:string;page?:number}[];lessonRefs:LessonRef[];source?:string;reviewed?:string};
export type GlossarySource={label:string;url:string;resourceId?:string;note?:string};
export const glossaryEntries:GlossaryEntry[]=[...rawEntries].sort((a,b)=>a.term.localeCompare(b.term,'fr'));
export const glossaryDomains=rawDomains;
export const glossarySources:Record<string,GlossarySource>=rawSources;
export const normalizeGlossary=(s:string)=>s.toLocaleLowerCase('fr').replace(/œ/g,'oe').replace(/æ/g,'ae').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
export const glossaryInitial=(s:string)=>normalizeGlossary(s).charAt(0).toUpperCase();
export const findGlossaryEntry=(id:string)=>glossaryEntries.find(e=>e.id===id);
export const glossaryDomainLabel=(id:string)=>glossaryDomains.find(d=>d.id===id)?.label||id;
export const lessonHref=(ref:LessonRef)=>'?'+new URLSearchParams({view:'course',id:ref.courseId,module:ref.moduleId,lesson:ref.lessonId});
export function matchesGlossary(entry:GlossaryEntry,query:string){
 const hay=normalizeGlossary([entry.term,...entry.aliases,entry.definition,entry.example,entry.software||'',entry.unimarc||'',glossaryDomainLabel(entry.category)].join(' '));
 return normalizeGlossary(query).split(' ').filter(Boolean).every(token=>hay.includes(token));
}
