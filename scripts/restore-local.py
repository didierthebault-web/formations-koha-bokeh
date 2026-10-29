#!/usr/bin/env python3
"""Prepare a full backup for restoration into a NEW local database (never overwrite production)."""
import json,sys,hashlib,subprocess
from pathlib import Path
root=Path(__file__).resolve().parent.parent
backup=Path(sys.argv[1]).resolve();d=json.loads((backup/'database.json').read_text());assert d['format']=='koha-bokeh-backup-v1'
allowed={'users','courses','resources','versions','pages','audit','settings'};tables=d['tables'];assert set(tables)==allowed
for v in tables['versions']:
 assert hashlib.sha256((backup/v['object_key']).read_bytes()).hexdigest()==v['sha256']
 if v['preview_key']:assert (backup/v['preview_key']).exists()
def quote(v):return 'NULL' if v is None else str(v) if isinstance(v,(int,float)) else "'"+str(v).replace("'","''")+"'"
lines=['PRAGMA foreign_keys=ON;','BEGIN TRANSACTION;']
for table in ['users','courses','resources','versions','pages','audit','settings']:
 for row in tables[table]:
  assert all(k.replace('_','').isalnum() for k in row)
  lines.append('INSERT INTO '+table+' ('+','.join(row)+') VALUES ('+','.join(quote(x) for x in row.values())+');')
lines.append('COMMIT;');out=backup/'restore-data.sql';out.write_text('\n'.join(lines));print('Verified backup. Generated',out)
print('Apply schema migrations to an EMPTY local DB, then restore-data.sql using the documented Wrangler command. Restore R2 objects with the original object keys. Do not import into a populated database.')
