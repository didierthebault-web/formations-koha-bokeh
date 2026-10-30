const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const tour=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/guided-tours/koha-home.json')));
const root=path.resolve(__dirname,'..'),base=process.argv[2]||'http://127.0.0.1:8776/';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const image=fs.readFileSync(path.join(root,'public',tour.image));
assert.equal(sha(image),tour.imageSha256);assert.equal(sha(fs.readFileSync(path.join(root,'docs',tour.image))),tour.imageSha256);
assert.equal(image.readUInt32BE(16),tour.imageWidth);assert.equal(image.readUInt32BE(20),tour.imageHeight);
assert.equal(tour.steps.length,8);assert.equal(tour.exploreZones.length,13);
assert.deepEqual(tour.steps[4].targets.map(t=>t.zoneId),['catalogue','advanced','items']);
assert.deepEqual(tour.steps[6].targets.map(t=>t.zoneId),['authorities','acquisitions','reports','administration']);
for(const zone of tour.zones){assert.ok(zone.x>=0&&zone.y>=0&&zone.width>0&&zone.height>0);assert.ok(zone.x+zone.width<=tour.coordinateWidth&&zone.y+zone.height<=tour.coordinateHeight)}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE}:{})});
 const page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'}),errors=[],failed=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))failed.push(r.status()+' '+r.url())});page.on('request',r=>requests.push(r.url()));
 const go=q=>page.goto(new URL(q,base).href);
 const shot=name=>page.screenshot({path:path.join(root,'reports/'+name+'.png'),fullPage:false});
 async function title(text){await page.getByRole('heading',{name:text,exact:true}).waitFor()}
 async function next(){await page.getByRole('navigation',{name:'Navigation de la visite'}).getByRole('button',{name:'Suivant',exact:true}).click()}
 async function alignment(step){
  const boxes=await page.locator('.tour-target-outline').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {id:el.dataset.zoneId,x:r.x,y:r.y,w:r.width,h:r.height}}));
  const r=await page.locator('.tour-image-canvas>img').boundingBox();
  assert.equal(boxes.length,step.targets.length);
  for(const box of boxes){const zone=tour.zones.find(z=>z.id===box.id);assert.ok(Math.abs(box.x-(r.x+zone.x/tour.coordinateWidth*r.width))<2);assert.ok(Math.abs(box.y-(r.y+zone.y/tour.coordinateHeight*r.height))<2);assert.ok(Math.abs(box.w-zone.width/tour.coordinateWidth*r.width)<2);assert.ok(Math.abs(box.h-zone.height/tour.coordinateHeight*r.height)<2)}
 }
 await go('');await page.getByRole('button',{name:'Visites interactives',exact:true}).click();await title('Visites interactives');assert.equal(await page.locator('.tour-card').count(),1);
 await page.getByRole('button',{name:'Démarrer la visite',exact:true}).click();await title(tour.steps[0].title);await page.locator('.tour-image-canvas>img').evaluate(e=>e.decode());
 assert.equal(await page.locator('.tour-spotlight').count(),0);await shot('tour-accueil');
 await page.getByRole('button',{name:'Commencer la visite',exact:true}).click();await title(tour.steps[1].title);await alignment(tour.steps[1]);assert.equal(await page.locator('.tour-target-outline').first().evaluate(e=>getComputedStyle(e).animationName),'none');await shot('tour-zone');
 for(let i=2;i<8;i++){
  await next();await title(tour.steps[i].title);
  assert.equal(await page.locator('.tour-mask-hole').count(),tour.steps[i].targets.length);
  const paragraphs=await page.locator('.tour-step-text p').allTextContents();assert.deepEqual(paragraphs,tour.steps[i].paragraphs);
  assert.equal(await page.locator('progress').getAttribute('value'),String(i+1));
  assert.equal(await page.evaluate(()=>document.activeElement.id),'tour-step-title');
  await alignment(tour.steps[i]);
  if(i===4)await shot('tour-plusieurs-zones');
  if(i===5){await shot('tour-catalogage');await page.getByRole('button',{name:'Catalogage — poursuivre la visite',exact:true}).click();await title(tour.steps[6].title);assert.equal(await page.locator('.tour-mask-hole').count(),4);await shot('tour-quatre-zones');await page.getByRole('button',{name:'Précédent',exact:true}).click();await title(tour.steps[5].title);}
 }
 await title(tour.steps[7].title);await page.getByRole('button',{name:'Recommencer la visite',exact:true}).click();await title(tour.steps[0].title);
 await page.getByRole('button',{name:'Commencer la visite',exact:true}).click();await page.getByRole('button',{name:'Agrandir l’image',exact:true}).click();await page.getByRole('dialog',{name:tour.heading+' — affichage agrandi'}).waitFor();await alignment(tour.steps[1]);await shot('tour-agrandie');
 assert.ok(await page.evaluate(()=>!!document.activeElement.closest('dialog')));await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
 await page.getByRole('button',{name:'Quitter la visite',exact:true}).click();await title('Visites interactives');
 await page.getByRole('button',{name:'Explorer librement',exact:true}).click();assert.equal(await page.locator('.tour-hotspot.explorable').count(),13);assert.equal(await page.locator('.tour-spotlight').count(),0);
 for(const id of tour.exploreZones){const zone=tour.zones.find(z=>z.id===id);await page.getByRole('navigation',{name:'Liste textuelle des éléments de l’interface'}).getByRole('button',{name:zone.title,exact:true}).click();await title(zone.title);assert.equal(await page.locator('.tour-explanation>p').textContent(),zone.text)}
 await page.getByRole('button',{name:'Découvrir : Catalogage',exact:true}).focus();await page.keyboard.press('Enter');await title('Catalogage');await shot('tour-exploration');
 await page.getByRole('button',{name:'Revenir au mode guidé',exact:true}).last().click();await title(tour.steps[0].title);
 // Full guided route is always available with buttons, even without clicking the image.
 await page.getByRole('button',{name:'Commencer la visite',exact:true}).click();for(let i=2;i<8;i++)await next();
 const target=page.getByRole('link',{name:'Découvrir le module Catalogage',exact:true});await target.click();await page.locator('.native-lesson h1').waitFor();assert.ok(page.url().includes('lesson=recherche-prealable'));
 await go('?view=course&id=cataloguer&module=mutualisation&lesson=catalogue-partage');await page.locator('.tour-context-link').waitFor();await page.locator('.tour-context-link').click();await title(tour.heading);await page.getByRole('link',{name:'Retour à la leçon d’origine',exact:true}).click();await page.locator('.native-lesson h1').waitFor();assert.ok(page.url().includes('lesson=catalogue-partage'));
 // Check all four requested viewport sizes, after resizing, zooming and panning.
 for(const size of [{width:1920,height:1080},{width:1366,height:768},{width:768,height:1024},{width:390,height:844}]){
  await page.setViewportSize(size);await go('?view=tours&tour=koha-first-visit');await title(tour.steps[0].title);await page.getByRole('button',{name:'Commencer la visite',exact:true}).click();for(let i=2;i<6;i++)await next();await title(tour.steps[5].title);await alignment(tour.steps[5]);
  await page.getByRole('button',{name:'Zoom avant',exact:true}).click();await alignment(tour.steps[5]);
  await page.getByRole('button',{name:'Voir l’écran complet',exact:true}).click();await alignment(tour.steps[5]);
  await page.getByRole('button',{name:'Centrer la cible',exact:true}).click();await alignment(tour.steps[5]);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('.tour-image-tools').scrollIntoViewIfNeeded();await shot('tour-'+size.width);
 }
 assert.ok(await page.locator('.tour-image-canvas').evaluate(e=>e.clientWidth>e.parentElement.clientWidth),'Mobile zoom must expose a pannable capture');
 await next();assert.equal(await page.locator('.tour-mask-hole').count(),4);await page.getByRole('button',{name:'Administration',exact:true}).click();await alignment(tour.steps[6]);
 await page.locator('.tour-tooltip').scrollIntoViewIfNeeded();await shot('tour-mobile');
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.equal(requests.filter(url=>/\/api\//.test(url)).length,0);
 console.log(JSON.stringify({result:'PASS',originalScreenshotSha256:tour.imageSha256,steps:8,explorerZones:13,multiCutouts:[3,4],viewports:['1920x1080','1366x768','768x1024','390x844'],zoomAndAlignment:'OK',keyboardAndFocus:'OK',enlargement:'OK',returnToLesson:'OK',noKohaApiCalls:true,errors,failed}));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
