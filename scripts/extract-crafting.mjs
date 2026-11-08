import fs from 'node:fs/promises';import vm from 'node:vm';
const plain=s=>String(s??'').replace(/<br\s*\/?\s*>/gi,' · ').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\{([^}]+)\}(?:\{[^}]*\})*/g,'$1').trim();
function cards(h){const out=new Map();for(const c of h.split('<div class="flex-shrink-0">').slice(1)){const m=c.match(/<a[^>]*data-hover="([^"]+)"[^>]*href="([^"]+)"[^>]*><img[^>]*src="([^"]+)"/);const n=c.match(/class="flex-grow-1 ms-2"><a[^>]*>(.*?)<\/a>/s);if(!m||!n)continue;out.set(m[2],{id:m[2],name:plain(n[1]),img:m[3],hover:m[1],description:[...c.matchAll(/<div class="(?:explicitMod|implicitMod|descrText)">(.*?)<\/div>/gs)].map(x=>plain(x[1])).join(' · '),source:'https://poe2db.tw/ru/'+m[2]})}return [...out.values()]}
const ctx={window:{}};vm.runInNewContext(await fs.readFile('dist/data.js','utf8'),ctx);const data=ctx.window.FORGE_DATA;
for(const g of data.groups){g.mods=g.mods.filter(m=>!m.source||m.source==='normal');const h=await fs.readFile('.cache/'+g.id+'.html','utf8'),v=JSON.parse(h.match(/new ModsView\((\{.*?\})\);/s)[1]);g.special={};
 for(const key of ['desecrated','essence','perfect_essence','corrupted','corruption_upgrade','socketable','bonded','destruction','chronomancy','marksman','decay','soul','berserking','liquid','rotmother','breach_otherworldly','breach_minion','breach_caster']){
  const rows=v[key]||[];g.special[key]=rows.map((m,i)=>({id:g.id+'-'+key+'-'+i,name:plain(m.Name),level:+m.Level,kind:+m.ModGenerationTypeID,families:m.ModFamilyList||[],text:plain(m.str),tags:m.fossil_no||[],weight:+m.DropChance,source:key,currency:m.Name?.match(/href="([^"]+)"/)?.[1],removes:!!m.Removes,crafted:key.includes('essence'),code:m.Code||null}));
  if(['desecrated','essence','perfect_essence','destruction','chronomancy','marksman','decay','soul','berserking','liquid','rotmother','breach_otherworldly','breach_minion','breach_caster'].includes(key)){
   for(const m of g.special[key].filter(m=>[1,2].includes(m.kind))){const normal=g.mods.find(n=>n.text===m.text&&n.level===m.level&&n.families.join('|')===m.families.join('|'));if(normal&&!['desecrated'].includes(key)){m.referenceId=normal.id}else g.mods.push(m)}
  }
 }
 for(const kind of [1,2])for(let i=0;i<3;i++)g.mods.push({id:g.id+'-unrevealed-'+kind+'-'+i,name:'Нераскрытое свойство Бездны',level:1,kind,families:['UnrevealedDesecration'+kind+'-'+i],text:'Нераскрытое свойство Бездны',tags:['unveiled_mod'],source:'unrevealed',weight:0});
 for(const m of g.mods.filter(m=>!m.source&&m.families.some(f=>['FireResistance','ColdResistance','LightningResistance','ChaosResistance'].includes(f))))for(let i=0;i<3;i++)g.mods.push({...m,id:m.id+'-converted-'+i,referenceId:m.id,name:m.name+' · переведённое сопротивление',source:'converted',converted:true});
}
const catalog={date:'2026-11-08',omens:[],essences:[],currencies:[]};
for(const [page,key] of [['Omen','omens'],['Essence','essences'],['Currency','currencies'],['Runeforging','runeforging'],['Quality','quality']]){catalog[key]=cards(await fs.readFile('.cache/'+page+'.html','utf8'));console.log(page,catalog[key].length);}
await fs.writeFile('dist/data.js','window.FORGE_DATA = '+JSON.stringify(data)+';');await fs.writeFile('dist/crafting-data.js','window.CRAFTING_DATA = '+JSON.stringify(catalog)+';');
