const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const snapshot = JSON.parse(fs.readFileSync(path.join(__dirname,'snapshot.json')));
const glossary = JSON.parse(fs.readFileSync(path.join(__dirname,'../lib/glossary.json')));
const domains = JSON.parse(fs.readFileSync(path.join(__dirname,'../lib/glossary-domains.json')));
const origin = process.argv[2] || 'http://127.0.0.1:8776/';
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE;
(async()=>{
 const browser = await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
 const page = await browser.newPage({viewport:{width:1600,height:1100},reducedMotion:'reduce'});
 const errors=[];const failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(origin))failed.push(r.status()+' '+r.url())});
 const go = query => page.goto(new URL(query,origin).href);
 await go('');await page.locator('.course-card').first().waitFor();
 assert.equal(await page.locator('.course-card').count(),4);
 await page.waitForFunction(()=>{const e=document.querySelector('.koha-kiwi');return e&&e.complete&&e.naturalWidth>0});
 await page.waitForFunction(()=>{const e=document.querySelector('.koha-wordmark');return e&&e.complete&&e.naturalWidth>0});
 await page.screenshot({path:path.join(__dirname,'../../tmp/koha-complete-home.png'),fullPage:true});
 await page.getByRole('button',{name:'Formations KOHA',exact:true}).click();
 assert.equal(await page.locator('.course-card').count(),2);
 await page.getByRole('button',{name:'Formations BOKEH',exact:true}).click();
 assert.equal(await page.locator('.course-card').count(),2);
 let lessons=0;
 for(const [id,course] of Object.entries(snapshot.learning)){
   await go('?view=course&id='+id);await page.locator('.module-card').first().waitFor();
   assert.equal(await page.locator('.module-card').count(),course.modules.length);
   for(const module of course.modules)for(const lesson of module.lessons){
     await go('?'+new URLSearchParams({view:'course',id,module:module.id,lesson:lesson.id}));
     await page.locator('.native-lesson h1').waitFor();
     assert.equal(await page.locator('.native-lesson h1').textContent(),lesson.title);
     assert.ok(await page.locator('.lesson-body').textContent().then(t=>t.includes(lesson.paragraphs[0])));
     assert.equal(await page.locator('.lesson-procedure li').count(),lesson.steps.length);
     if(lesson.figure){await page.locator('.lesson-figure img').scrollIntoViewIfNeeded();await page.waitForFunction(()=>{const e=document.querySelector('.lesson-figure img');return e&&e.complete&&e.naturalWidth>0})}
     if(lessons===0)await page.screenshot({path:path.join(__dirname,'../../tmp/koha-complete-lesson.png'),fullPage:true});
     lessons++;
   }
 }
 assert.equal(lessons,77);
 for(const [id,doc] of Object.entries(snapshot.documents)){
   await go('?view=document&id='+id);await page.locator('.reader-heading h1').waitFor();
   assert.equal(await page.locator('.reader-heading h1').textContent(),doc.resource.title);
   const download=page.getByRole('link',{name:'Télécharger l’original'});
   assert.ok((await download.getAttribute('href')).startsWith(origin));
   const r=await page.request.get(await download.getAttribute('href'));assert.equal(r.status(),200);
   assert.equal((await r.body()).length,doc.resource.size);
   const frame=page.locator('iframe');assert.equal(await frame.count(),1);
   const pdf=await page.request.get((await frame.getAttribute('src')).split('#')[0]);assert.equal(pdf.status(),200);
   assert.equal((await pdf.body()).subarray(0,5).toString(),'%PDF-');
   await page.getByRole('button',{name:'Texte indexé',exact:true}).click();
   assert.ok((await page.locator('.text-page pre').textContent()).length>0);
 }
 await go('?view=search');await page.locator('#query').fill('214');await page.locator('form.filter-bar .button').click();await page.locator('.result').first().waitFor();assert.ok(await page.locator('.hit').count()>0);
 await page.getByRole('button',{name:'Glossaire',exact:true}).click();assert.equal(await page.locator('.glossary-grid .resource-card').count(),glossary.length);
 const query=page.locator('#glossary-query');
 for(const [text,expected] of [['DERIVATION','Catalogage par dérivation'],['code barre','Code-barres'],['inventaire des collections','Récolement'],['AUTORITES ET INDEXATION','Notice d’autorité'],['deux copies','Exemplaire']]){
  await query.fill(text);await page.getByRole('heading',{name:expected,exact:true}).waitFor();
 }
 await query.fill('zzzintrouvable');assert.equal(await page.locator('.glossary-grid .resource-card').count(),0);
 await page.getByRole('button',{name:'Réinitialiser',exact:true}).click();
 assert.equal(await page.locator('.glossary-grid .resource-card').count(),glossary.length);
 for(const domain of domains){
  await page.getByRole('navigation',{name:'Filtrer le glossaire par domaine'}).getByRole('button').filter({hasText:domain.label}).click();
  assert.equal(await page.locator('.glossary-grid .resource-card').count(),glossary.filter(e=>e.category===domain.id).length);
 }
 await page.getByRole('button',{name:'Réinitialiser',exact:true}).click();
 assert.equal(await page.getByRole('navigation',{name:'Filtrer le glossaire par initiale'}).getByRole('button').count(),27);
 assert.ok(await page.getByRole('button',{name:'Initiale Q',exact:true}).isDisabled());
 await page.getByRole('button',{name:'Initiale W',exact:true}).click();assert.equal(await page.locator('.glossary-grid .resource-card').count(),glossary.filter(e=>e.term.startsWith('W')).length);
 await page.getByRole('button',{name:'Réinitialiser',exact:true}).click();
 await page.screenshot({path:path.join(__dirname,'../reports/glossaire-desktop.png'),fullPage:false});
 await query.fill('valeur autorisee');
 const trigger=page.getByRole('button',{name:'Voir la fiche complète : Valeur autorisée',exact:true});
 await trigger.focus();await page.keyboard.press('Enter');await page.getByRole('dialog').waitFor();
 assert.equal(await page.locator('#glossary-entry-title').textContent(),'Valeur autorisée');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'glossary-entry-title');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Fermer la fiche du glossaire');
 await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>!!document.activeElement.closest('dialog')),true);
 await page.screenshot({path:path.join(__dirname,'../reports/glossaire-fiche.png'),fullPage:false});
 await page.getByRole('dialog').getByRole('button',{name:'Localisation',exact:true}).click();
 assert.equal(await page.locator('#glossary-entry-title').textContent(),'Localisation');
 await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
 assert.equal(await trigger.evaluate(e=>e===document.activeElement),true);
 // Every historic id and every requested concept has an openable fiche.
 for(const entry of glossary){
  await go('?view=glossary&term='+entry.id);await page.getByRole('dialog').waitFor();
  assert.equal(await page.locator('#glossary-entry-title').textContent(),entry.term);
  assert.ok((await page.getByRole('dialog').textContent()).includes(entry.example));
  assert.equal(await page.getByRole('dialog').locator('.glossary-lesson-links a').count(),entry.lessonRefs.length);
  await page.getByRole('button',{name:'Fermer la fiche du glossaire',exact:true}).click();
 }
 // Explicit course context opens definitions without altering lesson text or URL.
 await go('?view=course&id=cataloguer&module=unimarc&lesson=champs-sous-champs');await page.locator('.lesson-glossary').waitFor();
 const lessonText=await page.locator('.lesson-body').textContent(),lessonUrl=page.url();
 await page.locator('.lesson-glossary').getByRole('button',{name:'Champ',exact:true}).click();
 await page.getByRole('dialog').waitFor();assert.equal(await page.locator('#glossary-entry-title').textContent(),'Champ');
 assert.equal(page.url(),lessonUrl);await page.keyboard.press('Escape');assert.equal(await page.locator('.lesson-body').textContent(),lessonText);
 // Follow a real lesson target from a definition in the fourth pathway.
 await go('?view=glossary&term=metier-editorialisation');await page.getByRole('dialog').waitFor();
 await page.getByRole('dialog').locator('.glossary-lesson-links a').first().click();await page.locator('.native-lesson h1').waitFor();
 assert.ok(page.url().includes('id=contribuer'));
 await page.setViewportSize({width:390,height:844});await go('?view=glossary');await query.waitFor();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:path.join(__dirname,'../reports/glossaire-mobile.png'),fullPage:false});
 await query.fill('valeur autorisee');await page.getByRole('button',{name:'Voir la fiche complète : Valeur autorisée',exact:true}).click();await page.getByRole('dialog').waitFor();
 assert.ok(await page.getByRole('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
 await page.getByRole('button',{name:'Fermer la fiche du glossaire',exact:true}).click();
 await page.setViewportSize({width:390,height:844});await go('');await page.locator('.course-card').first().waitFor();await page.getByRole('button',{name:'Ouvrir le menu'}).click();await page.locator('.sidebar.open').waitFor();await page.getByRole('button',{name:'Formations BOKEH',exact:true}).click();assert.equal(await page.locator('.sidebar.open').count(),0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 console.log(JSON.stringify({result:'PASS',courses:4,modules:34,lessons,documents:9,originalsAndPdfPreviews:'OK',kiwiAndLogo:'OK',glossary:glossary.length,glossaryDialogs:'all checked',glossaryKeyboard:'OK',glossaryContext:'OK',search:'OK',mobile:'OK',errors,failed}));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});



