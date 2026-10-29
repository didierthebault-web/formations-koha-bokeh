#!/usr/bin/env python3
"""Full private backup. Usage: python scripts/backup.py URL DIRECTORY; paste a Cookie header on stdin, or use export JSON plus files manually. The Cookie is never saved."""
import sys,json,urllib.request,hashlib
from pathlib import Path
if len(sys.argv)!=3:raise SystemExit('Usage: backup.py URL DIRECTORY < session-cookie.txt (prefer a secure pipe)')
base=sys.argv[1].rstrip('/');dest=Path(sys.argv[2]);dest.mkdir(parents=True,exist_ok=False);cookie=sys.stdin.read().strip()
def get(path):
 req=urllib.request.Request(base+path,headers={'Cookie':cookie})
 with urllib.request.urlopen(req,timeout=120) as r:return r.read()
backup=json.loads(get('/api/backup'));assert backup['format']=='koha-bokeh-backup-v1';(dest/'database.json').write_text(json.dumps(backup,ensure_ascii=False,indent=2))
for v in backup['tables']['versions']:
 url='/api/resources/'+v['resource_id']+'/file?version='+v['id']+'&download=1';b=get(url);assert hashlib.sha256(b).hexdigest()==v['sha256'];p=dest/v['object_key'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
 if v['preview_key']:
  b=get(url+'&preview=1');p=dest/v['preview_key'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
print('Backup complete:',dest,'— Keep encrypted and restrict access. Contains personal data.')
