'use client';
import {useEffect,useRef,useState} from 'react';
import {BookOpen,ExternalLink,X,ArrowRight} from 'lucide-react';
import {findGlossaryEntry,glossaryEntries,glossaryDomainLabel,glossarySources,lessonHref,type GlossaryEntry} from '@/lib/glossary';
import lessonIndex from '@/lib/glossary-lessons.json';

type Props={entry:GlossaryEntry;onSelect:(id:string)=>void;onClose:()=>void};
export function GlossaryDialog({entry,onSelect,onClose}:Props){
 const dialog=useRef<HTMLDialogElement>(null),heading=useRef<HTMLHeadingElement>(null);
 const restore=useRef<HTMLElement|null>(null);
 useEffect(()=>{restore.current=document.activeElement as HTMLElement;const el=dialog.current;el?.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{if(el?.open)el.close();document.body.style.overflow=overflow;if(restore.current?.isConnected)restore.current.focus();};},[]);
 useEffect(()=>{heading.current?.focus();dialog.current?.querySelector('.glossary-dialog-body')?.scrollTo(0,0);},[entry.id]);
 const lessonLabels=lessonIndex as Record<string,{courseTitle:string;moduleTitle:string;title:string}>;
 return <dialog ref={dialog} className="glossary-dialog" aria-labelledby="glossary-entry-title" onCancel={event=>{event.preventDefault();onClose();}} onKeyDown={event=>{if(event.key!=='Tab')return;const controls=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])')).filter(el=>el.getClientRects().length>0);const first=controls[0],last=controls[controls.length-1];if(!first)return;if(event.shiftKey&&(document.activeElement===first||document.activeElement===heading.current)){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
  <header><div><span className="eyebrow small">FICHE MÉTIER · {glossaryDomainLabel(entry.category)}</span><h2 id="glossary-entry-title" ref={heading} tabIndex={-1}>{entry.term}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer la fiche du glossaire"><X/></button></header>
  <div className="glossary-dialog-body">
   <section aria-labelledby="glossary-definition"><h3 id="glossary-definition">Définition</h3><p>{entry.definition}</p>{entry.aliases.length>0&&<p className="glossary-aliases"><strong>Autres appellations :</strong> {entry.aliases.join(' · ')}</p>}</section>
   <section className="glossary-example"><h3>Exemple d’utilisation</h3><p>{entry.example}</p></section>
   {entry.software&&<section><h3>Dans Koha / Bokeh</h3><p>{entry.software}</p></section>}
   {entry.unimarc&&<section><h3>Correspondance UNIMARC</h3><p>{entry.unimarc}</p><p className="muted">Le lien indiqué concerne le format bibliographique. Les données d’exemplaire et les grilles locales ne définissent pas une règle UNIMARC universelle.</p></section>}
   {entry.related.length>0&&<section><h3>Termes associés</h3><div className="glossary-related">{entry.related.map(id=>{const related=findGlossaryEntry(id);return related?<button key={id} type="button" onClick={()=>onSelect(id)}>{related.term}<ArrowRight size={14}/></button>:null;})}</div></section>}
   {entry.lessonRefs.length>0&&<section><h3>Dans les parcours de formation</h3><ul className="glossary-lesson-links">{entry.lessonRefs.map(ref=>{const key=[ref.courseId,ref.moduleId,ref.lessonId].join('/');const label=lessonLabels[key];return label?<li key={key}><a href={lessonHref(ref)}><BookOpen size={18}/><span>{label.title}<small>{label.courseTitle} · {label.moduleTitle}</small></span><ArrowRight size={15}/></a></li>:null;})}</ul></section>}
   <section className="glossary-source-list"><h3>Sources et repères</h3><p>Définition pédagogique reformulée ; les exemples illustrent la pratique et ne constituent pas des citations officielles.</p><ul>{entry.sources.map((ref,i)=>{const source=glossarySources[ref.sourceId];if(!source)return null;const local=!!source.resourceId;const url=local?source.url+(ref.page?'&page='+ref.page:''):source.url;return <li key={i}><a href={url} target={local?undefined:'_blank'} rel={local?undefined:'noopener noreferrer'}>{source.label}{ref.page?' · page ou diapositive '+ref.page:''}{!local&&<><ExternalLink size={13}/><span className="sr-only"> (nouvel onglet)</span></>}</a>{source.note&&<small>{source.note}</small>}</li>;})}</ul></section>
  </div><footer><span>Glossaire du réseau documentaire</span><button type="button" className="button secondary" onClick={onClose}>Fermer la fiche</button></footer>
 </dialog>;
}

export function LessonGlossary({courseId,moduleId,lessonId}:{courseId:string;moduleId:string;lessonId:string}){
 const [selected,setSelected]=useState('');
 const entries=glossaryEntries.filter(e=>e.lessonRefs.some(ref=>ref.courseId===courseId&&ref.moduleId===moduleId&&ref.lessonId===lessonId));
 const entry=findGlossaryEntry(selected);
 useEffect(()=>setSelected(''),[courseId,moduleId,lessonId]);
 if(!entries.length)return null;
 return <section className="lesson-glossary" aria-labelledby="lesson-glossary-title"><h2 id="lesson-glossary-title"><BookOpen size={19}/>Le vocabulaire de cette leçon</h2><p>Ouvrez une définition sans quitter votre lecture.</p><div className="glossary-related">{entries.map(e=><button type="button" key={e.id} aria-haspopup="dialog" onClick={()=>setSelected(e.id)}>{e.term}</button>)}</div>{entry&&<GlossaryDialog entry={entry} onSelect={setSelected} onClose={()=>setSelected('')}/>}</section>;
}
