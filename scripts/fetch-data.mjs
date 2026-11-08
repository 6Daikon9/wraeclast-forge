import fs from 'node:fs/promises';
const strip=s=>String(s??'').replace(/<br\s*\/?\s*>/gi,' · ').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').trim();
const names={Bows:'Луки',Crossbows:'Арбалеты',Wands:'Жезлы',Staves:'Посохи',Sceptres:'Скипетры',Quarterstaves:'Боевые посохи',One_Hand_Maces:'Одноручные булавы',Two_Hand_Maces:'Двуручные булавы',Spears:'Копья',Rings:'Кольца',Amulets:'Амулеты',Belts:'Пояса',Quivers:'Колчаны',Body_Armours:'Нагрудники',Helmets:'Шлемы',Gloves:'Перчатки',Boots:'Сапоги',Shields:'Щиты',Foci:'Фокусы'};
for(const type of ['Body_Armours','Helmets','Gloves','Boots','Shields']){
 const title=names[type];delete names[type];
 for(const [attr,label] of Object.entries({str:'броня',dex:'уклонение',int:'энергощит',str_dex:'броня / уклонение',str_int:'броня / энергощит',dex_int:'уклонение / энергощит'})){
  if(type==='Shields'&&!attr.startsWith('str'))continue;
  names[type+'_'+attr]=title+' · '+label;
 }
}
await fs.mkdir('.cache',{recursive:true});await fs.mkdir('dist/assets',{recursive:true});
const groups=[];
for(const [key,name] of Object.entries(names)){
 try{
 let h;try{if(process.argv.includes('--refresh'))throw Error('refresh');h=await fs.readFile('.cache/'+key+'.html','utf8')}catch{const r=await fetch('https://poe2db.tw/ru/'+key);if(!r.ok)throw Error('Fetch failed: '+r.status);h=await r.text();await fs.writeFile('.cache/'+key+'.html',h)}
 let views=[...h.matchAll(/new ModsView\((\{.*?\})\);/gs)].map(m=>JSON.parse(m[1]));
 const pos=h.indexOf('class="flex-shrink-0"');
 const cards=pos<0?[]:h.slice(pos).split('<div class="flex-shrink-0">').slice(0);
 const bases=[];
 for(const card of cards){
  const m=card.match(/<a class="whiteitem [^"]*"[^>]*href="([^"]+)"[^>]*><img[^>]*src="([^"]+)"/);
  if(!m)continue;const title=card.match(/class="flex-grow-1 ms-2"><a[^>]*>(.*?)<\/a>/s);if(!title)continue;
  const properties=[...card.matchAll(/<div class="property">(.*?)<\/div>/gs)].map(x=>strip(x[1])).filter(t=>t!=='Item Level:');
  const implicit=[...card.matchAll(/<div class="implicitMod">(.*?)<\/div>/gs)].map(x=>strip(x[1])).filter(t=>!t.startsWith('local weapon implicit'));
  bases.push({id:m[1],name:strip(title[1]),img:m[2],properties,implicit});
 }
 if(!views.length&&bases.length){
  const bh=await(await fetch('https://poe2db.tw/ru/'+bases[0].id)).text();
  views=[...bh.matchAll(/new ModsView\((\{.*?\})\);/gs)].map(m=>JSON.parse(m[1]));
  // Armour pools must be attribute-specific; retain representative pool only if the class is not armour.
 }
 const v=views[0];
 if(!v||!bases.length){console.log('SKIP',key,bases.length,views.length);continue}
 const mods=v.normal.filter(m=>['1','2'].includes(String(m.ModGenerationTypeID))).map((m,i)=>({id:key+'-'+i,name:strip(m.Name).replace(/\{([^}]+)\}(?:\{[^}]*\})*/g,'$1'),level:+m.Level,kind:+m.ModGenerationTypeID,families:m.ModFamilyList,text:strip(m.str),tags:m.fossil_no??[],weight:+m.DropChance}));
 // Generic jewellery and weapon pools only; armour needs separate attribute pools.
 groups.push({id:key,name,bases:[...new Map(bases.map(b=>[b.id,b])).values()],mods});console.log('OK',key,bases.length,mods.length);
 }catch(e){console.log('ERROR',key,e.message)}
}
await fs.writeFile('dist/data.js','window.FORGE_DATA = '+JSON.stringify({date:'2026-11-08',source:'https://poe2db.tw/ru/',groups})+';');
console.log('TOTAL',groups.length,groups.reduce((n,g)=>n+g.bases.length,0),groups.reduce((n,g)=>n+g.mods.length,0));
