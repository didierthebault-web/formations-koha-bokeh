'use client';
import {useEffect,useMemo,useState} from 'react';
import {Search,BookOpen,ArrowUpRight} from 'lucide-react';
import {glossaryEntries,glossaryDomains,glossaryInitial,glossaryDomainLabel,findGlossaryEntry,matchesGlossary} from '@/lib/glossary';
import {GlossaryDialog} from './glossary-entry';

const alphabet=Array.from({length:26},(_,i)=>String.fromCharCode(65+i));
export default function Glossary(){
 const [query,setQuery]=useState(''),[category,setCategory]=useState(''),[letter,setLetter]=useState(''),[selected,setSelected]=useState('');
 useEffect(()=>{const id=new URLSearchParams(location.search).get('term')||location.hash.slice(1);if(findGlossaryEntry(id))setSelected(id);},[]);
 const searched=useMemo(()=>glossaryEntries.filter(e=>matchesGlossary(e,query)),[query]);
 const scoped=searched.filter(e=>!category||e.category===category);
 const enabled=new Set(scoped.map(e=>glossaryInitial(e.term)));
 const visible=scoped.filter(e=>!letter||glossaryInitial(e.term)===letter);
 const entry=findGlossaryEntry(selected);
 function reset(){setQuery('');setCategory('');setLetter('');}
 return <section className="glossary"><div className="eyebrow">COMPRENDRE · PRATIQUER · RELIER</div><h1>Glossaire métier</h1><p className="lead">{glossaryEntries.length} notions pour vous repérer dans le catalogage, l’administration de KOHA et la valorisation dans BOKEH.</p>
  <div className="glossary-search filter-bar"><div className="input-icon"><Search size={21}/><label className="sr-only" htmlFor="glossary-query">Rechercher dans les termes, synonymes, définitions, exemples et domaines</label><input id="glossary-query" type="search" value={query} onChange={e=>{setQuery(e.target.value);setLetter('');}} placeholder="Un terme, un synonyme, une pratique…"/></div><button type="button" className="button secondary" onClick={reset}>Réinitialiser</button></div>
 <div className="glossary-layout"><aside className="glossary-domains" aria-label="Domaines du glossaire"><h2>Explorer par domaine</h2><nav aria-label="Filtrer le glossaire par domaine"><button type="button" aria-pressed={!category} onClick={()=>{setCategory('');setLetter('');}}><span>Tous les termes</span><span>{searched.length}</span></button>{glossaryDomains.map(domain=><button type="button" key={domain.id} aria-pressed={category===domain.id} onClick={()=>{setCategory(domain.id);setLetter('');}}><span>{domain.label}</span><span>{searched.filter(e=>e.category===domain.id).length}</span></button>)}</nav><p><BookOpen size={17}/>Des fiches reliées aux supports et aux leçons, pour passer du mot à la pratique.</p></aside>
 <div className="glossary-results"><nav className="glossary-alphabet" aria-label="Filtrer le glossaire par initiale"><button type="button" aria-pressed={!letter} onClick={()=>setLetter('')}>Tous</button>{alphabet.map(l=><button type="button" key={l} disabled={!enabled.has(l)} aria-pressed={letter===l} onClick={()=>setLetter(l)} aria-label={'Initiale '+l}>{l}</button>)}</nav><div className="glossary-result-heading"><h2>{category?glossaryDomainLabel(category):'Toutes les notions'}</h2><p className="muted" role="status">{visible.length} terme{visible.length>1?'s':''} affiché{visible.length>1?'s':''} sur {glossaryEntries.length}</p></div><div className="resource-grid glossary-grid">{visible.map(e=><article key={e.id} id={e.id} className="resource-card"><span className="glossary-category">{glossaryDomainLabel(e.category)}</span><h2>{e.term}</h2><p>{e.definition}</p><button type="button" className="link-button" aria-haspopup="dialog" aria-label={'Voir la fiche complète : '+e.term} onClick={()=>setSelected(e.id)}>Voir la fiche complète <ArrowUpRight size={16}/></button></article>)}</div>{!visible.length&&<div className="empty"><h2>Aucun terme trouvé</h2><p>Essayez un autre mot ou élargissez le domaine sélectionné.</p><button type="button" className="button secondary" onClick={reset}>Afficher tous les termes</button></div>}</div></div>
 <p className="glossary-attribution">Définitions pédagogiques reformulées à partir des supports du réseau et de référentiels professionnels. Les 41 entrées initiales de la Transition bibliographique sont conservées. Les sources et les éventuelles ambiguïtés sont précisées dans chaque fiche ; les consignes locales et les versions des logiciels restent à vérifier.</p>
 {entry&&<GlossaryDialog entry={entry} onSelect={setSelected} onClose={()=>setSelected('')}/>}</section>;
}
