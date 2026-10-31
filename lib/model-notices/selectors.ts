import recordsData from '@/data/model-notices/records.json';
import metadataData from '@/data/model-notices/metadata.json';
import annotationsData from '@/data/model-notices/annotations.json';
import rulesData from '@/data/model-notices/teaching.json';
import type {MarcRecord,MarcField,NoticeMetadata,Annotation,TeachingRule} from './types';
export const records=recordsData as MarcRecord[];
export const metadata=metadataData as NoticeMetadata[];
export const annotations=annotationsData as Record<string,Annotation>;
export const teaching=rulesData as Record<string,TeachingRule[]>;
export const fields=(r:MarcRecord,tag:string)=>r.fields.filter(f=>f.tag===tag);
export const values=(f:MarcField|undefined,code:string)=>f?.subfields?.filter(s=>s.code===code).map(s=>s.value)||[];
export const clean=(s:string)=>s.replace(/[\u0098\u009c]/g,'');
export const normalize=(s:string)=>clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const fieldValues=(r:MarcRecord,tag:string,code:string)=>fields(r,tag).flatMap(f=>values(f,code));
export const title=(r:MarcRecord)=>clean(fieldValues(r,'200','a').join(' ; '));
export const subtitle=(r:MarcRecord)=>clean(fieldValues(r,'200','e').join(' : '));
export const fullTitle=(r:MarcRecord)=>[title(r),subtitle(r)].filter(Boolean).join(' : ');
export const responsibilities=(r:MarcRecord)=>fields(r,'200').flatMap(f=>(f.subfields||[]).filter(s=>['f','g'].includes(s.code)).map(s=>clean(s.value)));
export const tags=(r:MarcRecord)=>[...new Set(r.fields.map(f=>f.tag))];
export const publication=(r:MarcRecord)=>fields(r,'210').concat(fields(r,'214').filter(f=>f.indicators?.[1]==='0')).map(f=>[values(f,'a').join(' ; '),values(f,'c').join(' ; '),values(f,'d').join(' ; ')].filter(Boolean).join(' — ')).join(' ; ');
export const date=(r:MarcRecord)=>fields(r,'210').concat(fields(r,'214').filter(f=>f.indicators?.[1]==='0')).flatMap(f=>values(f,'d')).join(' ; ');
export const physical=(r:MarcRecord)=>fields(r,'215').map(f=>(f.subfields||[]).map(s=>s.value).join(' ; ')).join(' / ');
export function displayField(f:MarcField){return f.tag+' '+(f.indicators?f.indicators.map(i=>i===' '?'#':i).join('')+' '+f.subfields!.map(s=>'$'+s.code+clean(s.value)).join(' '):f.value);}
export const rawView=(f:MarcField)=>JSON.stringify(f.raw).replace(/[\u0098\u009c]/g,c=>c==='\u0098'?'\\u0098':'\\u009c');
export const sourceHref=(r:MarcRecord)=>'model-notices/sources/'+r.sourceFile;
export const manual='https://www.transition-bibliographique.fr/unimarc/manuel-unimarc-format-bibliographique/';
export function annotation(tag:string):Annotation{return annotations[tag]||{title:'Zone '+tag,role:'Données conservées dans l’export. Leur interprétation détaillée reste à documenter.',status:'À vérifier',repeatability:'À vérifier dans le manuel de la zone.',indicators:[{},{}],subfields:{},source:manual};}
