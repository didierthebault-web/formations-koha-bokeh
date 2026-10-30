'use client';
import {useEffect,useState} from 'react';
import {Compass,ArrowRight,Play,ArrowLeft} from 'lucide-react';
import GuidedImageTour from '@/components/guided-tours/GuidedImageTour';
import scenario from '@/data/guided-tours/koha-home.json';

function safeReturn(value:string|null){
 if(!value?.startsWith('?'))return '';
 const p=new URLSearchParams(value.slice(1));
 if(p.get('view')!=='course'||p.get('id')!=='cataloguer')return '';
 const module=p.get('module'),lesson=p.get('lesson');
 if(module&&module!=='mutualisation'||lesson&&!['catalogue-partage','notice-exemplaire'].includes(lesson))return '';
 const result=new URLSearchParams({view:'course',id:'cataloguer'});if(module)result.set('module',module);if(lesson)result.set('lesson',lesson);return '?'+result;
}
export default function Tours(){
 const [active,setActive]=useState(false),[mode,setMode]=useState('guided'),[returnHref,setReturnHref]=useState('');
 useEffect(()=>{const sync=()=>{const p=new URLSearchParams(location.search);setActive(p.get('tour')===scenario.id);setMode(p.get('mode')==='explore'?'explore':'guided');setReturnHref(safeReturn(p.get('returnTo')));};sync();window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync);},[]);
 function start(mode:string){setMode(mode);setActive(true);const url=new URL(location.href);url.search='?'+new URLSearchParams({view:'tours',tour:scenario.id,mode});history.pushState({},'',url);window.scrollTo(0,0);}
 function quit(){if(returnHref){location.href=returnHref;return;}setActive(false);const url=new URL(location.href);url.search='?view=tours';history.replaceState({},'',url);requestAnimationFrame(()=>document.getElementById('tour-directory-title')?.focus());}
 if(active)return <GuidedImageTour key={mode} tour={scenario} initialMode={mode} onQuit={quit} returnHref={returnHref}/>;
 return <section className="tour-directory"><div className="eyebrow">DÉCOUVRIR LES OUTILS PAR LA PRATIQUE</div><h1 id="tour-directory-title" tabIndex={-1}>Visites interactives</h1><p className="lead">Prenez vos repères dans l’interface réelle, à votre rythme. Suivez une visite guidée ou explorez librement les zones expliquées.</p><div className="tour-directory-grid"><article className="tour-card"><div className="tour-card-art"><Compass size={38}/><span>KOHA <strong>{scenario.version}</strong></span><span className="badge teal">VISITE INTERACTIVE</span></div><div className="tour-card-body"><span className="eyebrow small">PREMIÈRE PRISE EN MAIN</span><h2>{scenario.title}</h2><p>{scenario.description}</p><dl><div><dt>Logiciel</dt><dd>KOHA</dd></div><div><dt>Version</dt><dd>{scenario.version}</dd></div><div><dt>Niveau</dt><dd>{scenario.level}</dd></div><div><dt>Durée</dt><dd>{scenario.duration}</dd></div><div><dt>Étapes</dt><dd>{scenario.steps.length}</dd></div><div><dt>Type</dt><dd>Visite interactive</dd></div></dl><div className="tour-card-actions"><button type="button" className="button" onClick={()=>start('guided')}><Play size={17}/>Démarrer la visite<ArrowRight size={16}/></button><button type="button" className="button secondary" onClick={()=>start('explore')}>Explorer librement</button></div></div></article></div><p className="tour-directory-note">La visite utilise une capture française de Koha {scenario.version}. Les clics servent à découvrir l’interface et ne réalisent aucune opération dans une instance Koha.</p><a className="back-link" href="?view=formations"><ArrowLeft size={16}/>Retour aux formations</a></section>;
}
