import {BookOpen} from 'lucide-react';
import {title,subtitle} from '@/lib/model-notices/selectors';
import type {MarcRecord,NoticeMetadata} from '@/lib/model-notices/types';
export default function TextualCover({record,meta}:{record:MarcRecord;meta:NoticeMetadata}){return <div className="mn-cover"><BookOpen size={30} aria-hidden="true"/><strong>{title(record)}</strong>{subtitle(record)&&<span>{subtitle(record)}</span>}<small>{meta.type}<br/>Vignette typographique · sans couverture</small></div>;}
