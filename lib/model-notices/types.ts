export type Subfield={code:string;value:string};
export type MarcField={tag:string;raw:string;value?:string;indicators?:string[];subfields?:Subfield[]};
export type MarcRecord={id:string;ark:string;leader:string;sourceFile:string;sourceSha256:string;byteLength:number;fields:MarcField[]};
export type NoticeMetadata={id:string;ark:string;type:string;level:string;themes:string[];featured:string[];description:string;evidence:string};
export type Annotation={title:string;role:string;status:string;repeatability:string;indicators:Record<string,string|undefined>[];subfields:Record<string,string|undefined>;source:string;note?:string};
export type TeachingRule={tag:string;observation:string;advice:string;source:string;status:string};
