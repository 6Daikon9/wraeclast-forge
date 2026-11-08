import fs from 'node:fs/promises';import vm from 'node:vm';import crypto from 'node:crypto';
const ctx={window:{}};vm.runInNewContext(await fs.readFile('dist/data.js','utf8'),ctx);let crafting=false;try{vm.runInNewContext(await fs.readFile('dist/crafting-data.js','utf8'),ctx);crafting=true}catch{}
const data=ctx.window.FORGE_DATA,cat=ctx.window.CRAFTING_DATA;
const objects=data.groups.flatMap(g=>g.bases);if(crafting)for(const rows of Object.values(cat))if(Array.isArray(rows))objects.push(...rows);
const urls=[...new Set(objects.map(b=>b.img).filter(u=>u&&/^https?:/.test(u)))];let i=0,ok=0;await fs.mkdir('dist/assets',{recursive:true});
await Promise.all(Array.from({length:6},async()=>{while(i<urls.length){const url=urls[i++];const file='assets/'+crypto.createHash('sha1').update(url).digest('hex').slice(0,12)+'.webp';try{await fs.access('dist/'+file)}catch{const r=await fetch(url);if(!r.ok)throw Error('Asset download failed: '+url);await fs.writeFile('dist/'+file,new Uint8Array(await r.arrayBuffer()))}for(const o of objects)if(o.img===url)o.img=file;ok++}}));
await fs.writeFile('dist/data.js','window.FORGE_DATA = '+JSON.stringify(data)+';');if(crafting)await fs.writeFile('dist/crafting-data.js','window.CRAFTING_DATA = '+JSON.stringify(cat)+';');console.log({images:ok,total:urls.length});
