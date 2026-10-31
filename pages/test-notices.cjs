const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),records=require('../data/model-notices/records.json'),base=process.argv[2]||'http://127.0.0.1:8776/';
const recordTitle=r=>r.fields.find(f=>f.tag==='200').subfields.find(s=>s.code==='a').value.replace(/[\u0098\u009c]/g,'');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE}:{})});
 const context=await browser.newContext({viewport:{width:1600,height:1100},reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']}),page=await context.newPage(),errors=[],failed=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.status()+' '+r.url())});page.on('request',r=>requests.push(r.url()));
 const go=q=>page.goto(new URL(q,base).href);async function shot(name){await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});await page.screenshot({path:path.join(root,'reports/'+name+'.png'),fullPage:true,animations:'disabled'});}
 await go('');await page.getByRole('button',{name:'Bibliothèque de notices modèles',exact:true}).click();await page.locator('.mn-card').first().waitFor();assert.equal(await page.locator('.mn-card').count(),5);
 await page.getByRole('searchbox').fill('muses');assert.equal(await page.locator('.mn-card').count(),1);await page.getByRole('searchbox').fill('zéro résultat inexistant');await page.getByRole('heading',{name:'Aucun résultat',exact:true}).waitFor();await page.getByRole('button',{name:'Réinitialiser les filtres'}).click();
 await page.getByRole('combobox',{name:/Champ UNIMARC présent/}).selectOption('330');assert.equal(await page.locator('.mn-card').count(),2);await go('?view=notices');await page.locator('.mn-card').first().waitFor();await shot('notices-bibliotheque');
 for(const r of records){
  await page.getByRole('button',{name:'Consulter la notice : '+recordTitle(r),exact:true}).click();await page.locator('#mn-title').waitFor();assert.equal(await page.locator('.model-notices section').count(),4);assert.equal(await page.locator('.mn-cover').count(),1);
  const source=await context.request.get(new URL(await page.getByRole('link',{name:'Télécharger la source ISO 2709'}).getAttribute('href'),base).href);assert.deepEqual(await source.body(),fs.readFileSync(path.join(root,'public/model-notices/sources',r.sourceFile)));
  assert.equal(await page.getByRole('link',{name:/Consulter la notice originale BnF/}).getAttribute('href'),'https://catalogue.bnf.fr/'+r.ark);
  for(const tag of [...new Set(r.fields.map(f=>f.tag))]){
   await page.getByRole('button',{name:tag,exact:true}).click();const occurrences=r.fields.filter(f=>f.tag===tag);assert.equal(await page.locator('.mn-occurrence').count(),occurrences.length);
   assert.equal(await page.locator('.mn-occurrence tbody tr').count(),occurrences.reduce((n,f)=>n+(f.subfields?.length||0),0));
   // Every original value appears in full, including long summaries and repeated identifiers.
   const tables=page.locator('.mn-occurrence');for(let i=0;i<occurrences.length;i++){const rows=await tables.nth(i).locator('tbody tr td:last-child').allTextContents();assert.deepEqual(rows,(occurrences[i].subfields||[]).map(s=>s.value.replace(/[\u0098\u009c]/g,'')));}
  }
  if(r.id==='cb42534131r'||r.id==='cb48709772r'){
   await page.getByRole('button',{name:r.id==='cb42534131r'?'210':'330',exact:true}).click();await shot('notices-'+(r.id==='cb42534131r'?'muses-210':'encyclopedie-330')+'-desktop');
   await page.locator('.mn-document').screenshot({path:path.join(root,'reports/notices-'+(r.id==='cb42534131r'?'muses':'encyclopedie')+'-fiche.png'),animations:'disabled'});
   if(r.id==='cb48709772r'){await page.setViewportSize({width:390,height:844});await shot('notices-encyclopedie-330-mobile');assert.equal(await page.locator('.mn-occurrence tbody tr').first().locator('td').last().textContent(),r.fields.find(f=>f.tag==='330').subfields[0].value);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.setViewportSize({width:1600,height:1100});}
   await page.getByRole('button',{name:r.id==='cb42534131r'?'606':'702',exact:true}).click();await shot('notices-'+(r.id==='cb42534131r'?'muses-606':'encyclopedie-702')+'-desktop');
   await page.getByRole('button',{name:'Copier les lignes de la notice',exact:true}).click();assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n'),(await page.locator('.mn-marc').allTextContents()).join('\n'));
   await page.getByLabel('Voir les données brutes').check();for(const [i,f] of r.fields.filter(f=>f.tag=== (r.id==='cb42534131r'?'606':'702')).entries()){const text=await page.locator('.mn-marc').nth(i).textContent();assert.equal(JSON.parse(text),f.raw);}
   await page.getByLabel('Voir les données brutes').uncheck();
   await page.setViewportSize({width:390,height:844});await shot('notices-'+(r.id==='cb42534131r'?'muses':'encyclopedie')+'-mobile');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.setViewportSize({width:1600,height:1100});
  }
  await page.getByRole('link',{name:'Retour à la bibliothèque',exact:true}).click();await page.locator('.mn-card').first().waitFor();
 }
 await go('?view=notices&notice=cb42534131r&field=606');await page.getByRole('button',{name:'606',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'606',exact:true}).getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'210',exact:true}).focus();await page.keyboard.press('Enter');assert.equal(await page.getByRole('button',{name:'210',exact:true}).getAttribute('aria-pressed'),'true');
 await go('?view=course&id=cataloguer&module=unimarc');await page.getByRole('link',{name:/Bibliothèque de notices modèles/}).waitFor();
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.ok(!requests.some(u=>u.includes('/api/')));assert.ok(!requests.some(u=>/couverture|bnf.fr|\.UM_2709/.test(u)));await browser.close();
 console.log(JSON.stringify({result:'PASS',notices:5,all154Fields:'OK',longSummaryAndResponsibilities:'OK',clipboard:'OK',sourceDownload:'byte-identical',keyboard:'OK',mobile:'390px without overflow',screenshots:10,errors,failed,noExternalCoverOrApi:true}));
})().catch(e=>{console.error(e);process.exit(1)});
