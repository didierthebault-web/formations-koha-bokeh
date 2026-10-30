'use client';
import {useEffect,useRef,useState} from 'react';
import {ZoomIn,ZoomOut,Scan,Focus} from 'lucide-react';
import TourSpotlight from './TourSpotlight';
import TourHotspots from './TourHotspots';
import type {GuidedTour,TourTarget} from './model';
export default function TourImage({tour,targets,exploring,selected,onSelect,onActivate}:{tour:GuidedTour;targets:TourTarget[];exploring:boolean;selected:string;onSelect:(id:string)=>void;onActivate:()=>void}){
 const viewport=useRef<HTMLDivElement>(null),canvas=useRef<HTMLDivElement>(null);
 const [zoom,setZoom]=useState(1),[width,setWidth]=useState(1000),[loaded,setLoaded]=useState(false),[error,setError]=useState(false);
 const active=targets.map(t=>tour.zones.find(z=>z.id===t.zoneId)!).filter(Boolean);
 const focused=tour.zones.find(z=>z.id===selected)||active[0];
 const key=targets.map(t=>t.zoneId).join('/');
 useEffect(()=>{const element=viewport.current;if(!element)return;const observer=new ResizeObserver(()=>setWidth(element.clientWidth));observer.observe(element);return()=>observer.disconnect();},[]);
 useEffect(()=>{if(exploring){if(selected&&viewport.current&&viewport.current.clientWidth<600)setZoom(z=>Math.max(z,4));return;}if(key==='screen')setZoom(1);else if(viewport.current&&viewport.current.clientWidth<600)setZoom(4);},[key,exploring,selected,width]);
 function center(){const el=viewport.current,content=canvas.current;if(!el||!content||!focused)return;const x=(focused.x+focused.width/2)/tour.coordinateWidth*content.clientWidth;const y=(focused.y+focused.height/2)/tour.coordinateHeight*content.clientHeight;const targetWidth=focused.width/tour.coordinateWidth*content.clientWidth;const left=targetWidth>el.clientWidth-32?focused.x/tour.coordinateWidth*content.clientWidth-16:x-el.clientWidth/2;el.scrollTo({left:Math.max(0,left),top:Math.max(0,y-el.clientHeight/2),behavior:'instant'});}
 useEffect(()=>{const frame=requestAnimationFrame(center);return()=>cancelAnimationFrame(frame);},[key,selected,zoom,width,loaded]);
 const canvasWidth=Math.max(1,width)*zoom;
 return <div className="tour-image-component"><div className="tour-image-tools" role="group" aria-label="Affichage de la capture"><button type="button" onClick={()=>setZoom(z=>Math.min(6,z+.5))} disabled={zoom>=6}><ZoomIn size={17}/>Zoom avant</button><button type="button" onClick={()=>setZoom(z=>Math.max(1,z-.5))} disabled={zoom<=1}><ZoomOut size={17}/>Zoom arrière</button><button type="button" onClick={()=>setZoom(1)}><Scan size={17}/>Voir l’écran complet</button><button type="button" onClick={()=>{setZoom(width<600?4:Math.max(1,zoom));requestAnimationFrame(center);}}><Focus size={17}/>Centrer la cible</button><span aria-live="polite">{Math.round(zoom*100)} %</span></div>
  <div ref={viewport} className="tour-image-viewport" tabIndex={0} role="region" aria-label={"Capture "+tour.software+" : zone défilante. Utilisez les commandes de zoom, les flèches ou les boutons de repérage."} style={{height:zoom===1?'auto':Math.min(480,Math.max(300,width*.35))}}>
   <div ref={canvas} className="tour-image-canvas" style={{width:canvasWidth,aspectRatio:`${tour.imageWidth} / ${tour.imageHeight}`}} data-image-width={tour.imageWidth} data-coordinate-width={tour.coordinateWidth}>
    <img src={tour.image} width={tour.imageWidth} height={tour.imageHeight} alt={tour.imageAlt} draggable={false} onLoad={()=>{setLoaded(true);setError(false);}} onError={()=>setError(true)}/>
    {!exploring&&<TourSpotlight tour={tour} zones={active}/>}
    <TourHotspots tour={tour} zones={exploring?tour.zones.filter(z=>tour.exploreZones.includes(z.id)):active} targets={targets} exploring={exploring} selected={selected} onSelect={onSelect} onActivate={onActivate}/>
   </div>
  </div>{error&&<p role="alert" className="notice error">La capture ne s’est pas chargée. Les explications et la liste textuelle restent disponibles.</p>}
  <p className="tour-image-caption">Capture originale en français · {tour.software} {tour.version}. Les zones de cette image sont des repères pédagogiques.</p>
  {!exploring&&active.length>0&&active[0].id!=='screen'&&<div className="tour-locate" role="group" aria-label="Repérer les zones de cette étape"><span>Zones expliquées :</span>{active.map(z=><button key={z.id} type="button" aria-pressed={selected===z.id} onClick={()=>onSelect(z.id)}>{z.title}</button>)}</div>}
 </div>;
}
