import {useId} from 'react';
import type {GuidedTour,TourZone} from './model';
export default function TourSpotlight({tour,zones}:{tour:GuidedTour;zones:TourZone[]}){
 const maskId='tour-mask-'+useId().replace(/:/g,'');
 if(!zones.length||zones.some(zone=>zone.id==='screen'))return null;
 return <svg className="tour-spotlight" viewBox={`0 0 ${tour.coordinateWidth} ${tour.coordinateHeight}`} preserveAspectRatio="none" aria-hidden="true"><defs><mask id={maskId} maskUnits="userSpaceOnUse"><rect width={tour.coordinateWidth} height={tour.coordinateHeight} fill="white"/>{zones.map(zone=><rect key={zone.id} className="tour-mask-hole" data-zone-id={zone.id} x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx="3" fill="black"/>)}</mask></defs><rect width={tour.coordinateWidth} height={tour.coordinateHeight} fill="#172a4566" mask={`url(#${maskId})`}/>{zones.map(zone=><rect key={zone.id} className="tour-target-outline" data-zone-id={zone.id} x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx="3" fill="none" stroke="#dc8b1d" strokeWidth="3" vectorEffect="non-scaling-stroke"/>)}</svg>;
}
