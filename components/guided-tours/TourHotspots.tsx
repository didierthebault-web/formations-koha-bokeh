import {zoneStyle,type GuidedTour,type TourZone,type TourTarget} from './model';
export default function TourHotspots({tour,zones,targets,exploring,selected,onSelect,onActivate}:{tour:GuidedTour;zones:TourZone[];targets:TourTarget[];exploring:boolean;selected:string;onSelect:(id:string)=>void;onActivate:()=>void}){
 return <div className="tour-hotspots">{zones.map(zone=>{
  const target=targets.find(t=>t.zoneId===zone.id),type=exploring?'tooltip':target?.type;
  if(!type||type==='highlight')return null;
  const label=exploring?'Découvrir : '+zone.title:zone.title+(type==='click'?' — poursuivre la visite':' — poursuivre le parcours');
  return <button key={zone.id} type="button" className={'tour-hotspot '+(exploring?'explorable ':'')+(selected===zone.id?'selected':'')} style={zoneStyle(zone,tour)} data-zone-id={zone.id} aria-label={label} aria-pressed={exploring?selected===zone.id:undefined} onClick={()=>exploring?onSelect(zone.id):onActivate()}><span className="sr-only">{label}</span></button>;
 })}</div>;
}
