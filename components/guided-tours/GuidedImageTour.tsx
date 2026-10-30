'use client';
import {useEffect,useRef,useState} from 'react';
import {Expand,X,Compass} from 'lucide-react';
import TourImage from './TourImage';
import TourTooltip from './TourTooltip';
import TourProgress from './TourProgress';
import TourNavigation from './TourNavigation';
import TourExplorer from './TourExplorer';
import {nextLessonHref,type GuidedTour} from './model';
export default function GuidedImageTour({tour,initialMode='guided',onQuit,returnHref}:{tour:GuidedTour;initialMode?:string;onQuit:()=>void;returnHref?:string}){
 const [index,setIndex]=useState(0),[exploring,setExploring]=useState(initialMode==='explore'),[selected,setSelected]=useState(''),[expanded,setExpanded]=useState(false);
 const modal=useRef<HTMLDialogElement>(null),expand=useRef<HTMLButtonElement>(null),modeButton=useRef<HTMLButtonElement>(null);
 const step=tour.steps[index];
 function change(next:number){setIndex(Math.min(tour.steps.length-1,Math.max(0,next)));setSelected('');}
 useEffect(()=>{if(!expanded)return;const element=modal.current;element?.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{if(element?.open)element.close();document.body.style.overflow=previous;expand.current?.focus();};},[expanded]);
 function activate(){if(step.action==='complete')location.href=nextLessonHref(tour);else change(index+1);}
 const content=<><div className="tour-surface-top">{exploring?<span className="tour-progress">Exploration libre · {tour.exploreZones.length} zones</span>:<TourProgress current={index+1} total={tour.steps.length}/>}<div className="tour-mode-controls"><button type="button" ref={modeButton} className="button secondary" onClick={()=>{setExploring(v=>!v);setSelected('');}}><Compass size={17}/>{exploring?'Revenir au mode guidé':"Explorer librement l’interface"}</button><button type="button" className="button secondary" ref={expanded?undefined:expand} onClick={()=>setExpanded(v=>!v)}><Expand size={17}/>{expanded?'Réduire':'Agrandir l’image'}</button><button type="button" className="icon-button" aria-label="Quitter la visite" onClick={onQuit}><X/></button></div></div>
  <TourImage tour={tour} targets={step.targets} exploring={exploring} selected={selected} onSelect={setSelected} onActivate={activate}/>
  {exploring?<TourExplorer tour={tour} selected={selected} onSelect={setSelected} onGuide={()=>{setExploring(false);setSelected('');}} onQuit={onQuit}/>:<TourTooltip step={step} number={index+1} focusKey={step.id+expanded+exploring}><TourNavigation index={index} total={tour.steps.length} nextLabel={step.nextLabel} onPrevious={()=>change(index-1)} onNext={()=>change(index+1)} onRestart={()=>change(0)} onQuit={onQuit} nextHref={nextLessonHref(tour)} nextActionLabel={tour.nextActionLabel}/></TourTooltip>}
 </>;
 return <section className="guided-image-tour" aria-label={tour.heading}><div className="tour-heading"><div><span className="eyebrow">VISITE INTERACTIVE · {tour.software} {tour.version}</span><h1>{tour.heading}</h1><p className="lead">{tour.duration} · {tour.level} · {tour.steps.length} étapes</p></div>{returnHref&&<a className="button secondary" href={returnHref}>Retour à la leçon d’origine</a>}</div>
  {expanded?<dialog ref={modal} className="tour-expanded" aria-label={tour.heading+" — affichage agrandi"} onCancel={event=>{event.preventDefault();setExpanded(false);}} onKeyDown={event=>{if(event.key!=='Tab')return;const els=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],[tabindex="0"]')).filter(el=>el.getClientRects().length>0);const first=els[0],last=els[els.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}}><div className="tour-expanded-label">{tour.heading}<button type="button" className="icon-button" aria-label="Fermer l’affichage agrandi" onClick={()=>setExpanded(false)}><X/></button></div>{content}</dialog>:<div className="tour-surface">{content}</div>}
 </section>;
}
