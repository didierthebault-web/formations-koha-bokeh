import snapshot from './snapshot.json';

const data: any = snapshot;
const base = new URL('./', location.href);
export const publicAsset = (path: string) => new URL(path.replace(/^\//, ''), base).href;
const norm = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const response = (value: any, status = 200) => new Response(JSON.stringify(value), {status, headers: {'Content-Type': 'application/json'}});

export function publicFile(resourceId: string, preview = false) {
  const doc = data.documents[resourceId];
  return publicAsset(preview ? doc.preview || doc.original : doc.original);
}

// Read-only implementation of the original application's content API.
// Identity, account administration and server-side writes are not simulated.
export async function publicFetch(input: string, options: RequestInit = {}) {
  if (options.method && options.method !== 'GET') return response({error: 'Les modifications partagées nécessitent le serveur de la plateforme.'}, 405);
  const url = new URL(input, location.origin);
  const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'state') return response(data.state);
  if (parts[0] === 'resources') {
    const doc = data.documents[parts[1]];
    return doc ? response(doc) : response({error: 'Document introuvable.'}, 404);
  }
  if (parts[0] === 'learning') {
    const course = data.learning[parts[1]];
    return course ? response(course) : response({error: 'Parcours introuvable.'}, 404);
  }
  if (parts[0] === 'search') {
    const query = (url.searchParams.get('q') || '').trim().slice(0, 200);
    const tokens = norm(query).split(/\s+/).filter(Boolean).slice(0, 8);
    const software = url.searchParams.get('software');
    const category = url.searchParams.get('category');
    const matches = (text: string) => tokens.every(t => norm(text).includes(t));
    const results = Object.values(data.documents).flatMap((doc: any) => {
      const r = doc.resource;
      if (software && software !== r.software || category && !r.categories.includes(category)) return [];
      const courses = data.state.courses.filter((c: any) => r.courses.includes(c.id));
      const metadata = [r.title, r.description, r.audience || '', ...r.keywords, ...r.categories, ...courses.flatMap((c: any) => [c.title, c.audience, ...c.modules.map((m: any) => m.title)])].join(' ');
      const hits = doc.pages.filter((p: any) => matches(p.content)).slice(0, 5).map((p: any) => {
        const at = tokens.length ? Math.max(0, norm(p.content).indexOf(tokens[0]) - 80) : 0;
        return {number: p.number, label: p.label, snippet: p.content.slice(at, at + 260)};
      });
      return matches(metadata) || hits.length ? [{...r, hits}] : [];
    });
    return response({query, results});
  }
  return response({error: 'Fonction réservée au serveur de la plateforme.'}, 404);
}
