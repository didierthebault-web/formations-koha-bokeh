import {annotation,manual} from '@/lib/model-notices/selectors';
import type {MarcField} from '@/lib/model-notices/types';
export default function NormativeExplanation({tag,occurrences}:{tag:string;occurrences:MarcField[]}){
 const info=annotation(tag),codes=[...new Set(occurrences.flatMap(f=>f.subfields?.map(s=>s.code)||[]))];
 return <section className="mn-panel mn-normative" aria-labelledby="mn-normative-title"><div className="mn-section-label">03 · COMPRENDRE LA ZONE</div><h2 id="mn-normative-title">Explication normative</h2><h3>{tag} — {info.title}</h3><span className="mn-status">{info.status}</span><p>{info.role}</p><p><strong>Répétabilité. </strong>{info.repeatability}</p>
 {occurrences[0].indicators&&<><h3>Indicateurs rencontrés</h3><ul>{[0,1].flatMap(i=>[...new Set(occurrences.map(f=>f.indicators![i]))].map(v=><li key={i+v}><strong>Indicateur {i+1} : <code>{v===' '?'#':v}</code></strong> — {v==='|'?'Caractère de remplissage conservé : valeur non renseignée.':info.indicators[i]?.[v]||'À vérifier — signification non documentée dans cette version.'}</li>))}</ul></>}
 {codes.length>0&&<><h3>Sous-champs rencontrés</h3><ul>{codes.map(code=><li key={code}><code>${code}</code> — {info.subfields[code]||'À vérifier — définition non confirmée ; valeur conservée.'}</li>)}</ul></>}
 {info.note&&<p className="mn-note">{info.note}</p>}
 <p className="mn-source">Source : <a href={info.source} target="_blank" rel="noopener noreferrer">{info.sourceLabel||(info.source===manual?'Manuel UNIMARC — CfU':'CfU — zone '+tag)} (nouvel onglet)</a>. Consultation : 31 octobre 2026.</p>
 {info.sources?.map(source=><p className="mn-source" key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} (nouvel onglet)</a></p>)}
 <p className="mn-note">« Vérifié » concerne les éléments explicitement documentés ci-dessus. Les extensions et valeurs non confirmées restent signalées « À vérifier ». Certaines traductions françaises sont anciennes : <a href="https://www.ifla.org/unimarc-updates/unimarc-bibliographic-format-manual-online-ed/" target="_blank" rel="noopener noreferrer">consulter les mises à jour IFLA</a>.</p></section>;
}
