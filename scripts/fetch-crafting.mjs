import fs from 'node:fs/promises';
const pages=['Omen','Essence','Currency','Desecrated_Modifiers','Alloy','Runeforging','Quality'];
await fs.mkdir('.cache',{recursive:true});
for(const id of pages){const r=await fetch('https://poe2db.tw/ru/'+id);if(!r.ok)throw Error('Fetch failed: '+id+' '+r.status);const h=await r.text();await fs.writeFile('.cache/'+id+'.html',h);console.log(id,r.status,h.length)}
