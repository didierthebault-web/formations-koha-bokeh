import crypto from 'node:crypto';
const decode=b=>new TextDecoder('utf-8',{fatal:true}).decode(b);
function number(b,label){const s=b.toString('ascii');if(!/^\d+$/.test(s))throw Error(label+': nombre invalide');return Number(s);}
/** Read offsets in bytes, not JavaScript characters. Never trim MARC values. */
export function parseISO2709(buffer,sourceFile=''){
 const records=[];let cursor=0;
 while(cursor<buffer.length){
  if(buffer.length-cursor<25)throw Error('Label incomplet');
  const length=number(buffer.subarray(cursor,cursor+5),'Longueur');
  const bytes=buffer.subarray(cursor,cursor+length);if(bytes.length!==length||bytes.at(-1)!==0x1d)throw Error('Fin de notice invalide');
  const leader=decode(bytes.subarray(0,24)),base=number(bytes.subarray(12,17),'Adresse de base');
  if(leader.slice(10,12)!=='22'||leader.slice(20,23)!=='450')throw Error('Structure du répertoire non prise en charge');
  if(base<25||base>=length||bytes[base-1]!==0x1e||(base-25)%12)throw Error('Répertoire invalide');
  const fields=[];let expectedOffset=0;
  for(let pos=24;pos<base-1;pos+=12){
   const tag=bytes.subarray(pos,pos+3).toString('ascii');if(!/^\d{3}$/.test(tag))throw Error('Étiquette invalide');
   const size=number(bytes.subarray(pos+3,pos+7),'Longueur de zone'),offset=number(bytes.subarray(pos+7,pos+12),'Décalage');
   if(offset!==expectedOffset||size<1||base+offset+size>=length||bytes[base+offset+size-1]!==0x1e)throw Error('Zone hors répertoire ou non contiguë');
   expectedOffset+=size;
   const raw=decode(bytes.subarray(base+offset,base+offset+size-1));
   if(tag<'010')fields.push({tag,raw,value:raw});
   else{
    if(raw.length<2)throw Error('Indicateurs manquants');
    const indicators=[raw[0],raw[1]],content=raw.slice(2),parts=content.split('\x1f');
    if(parts[0]!==''||parts.slice(1).some(s=>s.length<1))throw Error('Séparateur de sous-zone invalide');
    fields.push({tag,raw,indicators,subfields:parts.slice(1).map(s=>({code:s[0],value:s.slice(1)}))});
   }
  }
  if(base+expectedOffset!==length-1)throw Error('Octets non couverts par le répertoire');
  // 003 identifies THIS record; ARKs in 039 may refer to merged/replaced records.
  const ark=fields.find(f=>f.tag==='003')?.value?.match(/ark:\/12148\/[a-zA-Z0-9]+/)?.[0];
  if(!ark)throw Error('ARK principal absent de 003');
  records.push({id:ark.split('/').at(-1),ark,leader,sourceFile,sourceSha256:crypto.createHash('sha256').update(bytes).digest('hex'),byteLength:length,fields});
  cursor+=length;
 }
 return records;
}
export function encodeISO2709(record){
 const chunks=record.fields.map(f=>Buffer.from(f.raw+'\x1e','utf8'));let offset=0;
 const directory=record.fields.map((f,i)=>{const entry=f.tag+String(chunks[i].length).padStart(4,'0')+String(offset).padStart(5,'0');offset+=chunks[i].length;return entry;}).join('');
 const base=25+directory.length,total=base+offset+1;
 if(Number(record.leader.slice(0,5))!==total||Number(record.leader.slice(12,17))!==base)throw Error('Label incompatible');
 return Buffer.concat([Buffer.from(record.leader+directory+'\x1e'),...chunks,Buffer.from('\x1d')]);
}
