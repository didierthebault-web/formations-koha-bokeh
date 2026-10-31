import type { Metadata } from 'next';
import './globals.css';
import './model-notices.css';
export const metadata:Metadata={title:'Formations KOHA & BOKEH · Réseau documentaire',description:'Les parcours et ressources du réseau documentaire du ministère de la Culture.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>;}
