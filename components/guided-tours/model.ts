export type ZoneType='highlight'|'click'|'tooltip'|'navigation';
export type TourZone={id:string;title:string;x:number;y:number;width:number;height:number;type:string;text:string};
export type TourTarget={zoneId:string;type:string};
export type TourStep={id:string;title:string;paragraphs:string[];targets:TourTarget[];action:string;instruction?:string;nextLabel?:string};
export type GuidedTour={id:string;title:string;heading:string;description:string;software:string;version:string;level:string;duration:string;image:string;imageWidth:number;imageHeight:number;coordinateWidth:number;coordinateHeight:number;imageSha256:string;imageAlt:string;nextActionLabel:string;nextLesson:{courseId:string;moduleId:string;lessonId:string};zones:TourZone[];exploreZones:string[];steps:TourStep[]};
export function zoneStyle(zone:TourZone,tour:GuidedTour){return {left:zone.x/tour.coordinateWidth*100+'%',top:zone.y/tour.coordinateHeight*100+'%',width:zone.width/tour.coordinateWidth*100+'%',height:zone.height/tour.coordinateHeight*100+'%'};}
export const nextLessonHref=(tour:GuidedTour)=>'?'+new URLSearchParams({view:'course',id:tour.nextLesson.courseId,module:tour.nextLesson.moduleId,lesson:tour.nextLesson.lessonId});
