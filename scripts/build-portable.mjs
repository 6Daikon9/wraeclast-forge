import fs from 'node:fs/promises';import path from 'node:path';import vm from 'node:vm';import crypto from 'node:crypto';
const root=process.cwd(),ctx={window:{}};for(const file of ['data.js','crafting-data.js'])vm.runInNewContext(await fs.readFile(path.join(root,'dist',file),'utf8'),ctx);
async function image(value){if(!value||value.startsWith('data:'))return value;if(/^https?:/.test(value))throw Error('Download assets before portable build: '+value);const b=await fs.readFile(path.join(root,'dist',value));return 'data:image/webp;base64,'+b.toString('base64')}
const data=ctx.window.FORGE_DATA,cat=ctx.window.CRAFTING_DATA;
const imgMap=new Map();for(const g of data.groups)for(const b of g.bases){if(!imgMap.has(b.img))imgMap.set(b.img,await image(b.img));b.img=imgMap.get(b.img)}
for(const rows of Object.values(cat))if(Array.isArray(rows))for(const row of rows)if(row.img)row.img=await image(row.img);
let js='';for(const file of ['engine.mjs','craft-engine.mjs','advanced-ui.mjs','app.js']){let code=await fs.readFile('dist/'+file,'utf8');code=code.replace(/^import .*?;\r?\n/gm,'').replace(/^export /gm,'');js+='\n'+code}
new vm.Script('(function(){'+js+'})();');
let html=await fs.readFile('dist/index.html','utf8'),css=await fs.readFile('dist/style.css','utf8');css=css.replace(/@import url\([^;]+;/g,'');html=html.replace(/<link rel="stylesheet" href="style.css">/,'<style>'+css+'</style>').replace(/<script[^>]*src="[^"]+"[^>]*><\/script>/g,'').replace('class="brand" href="./"','class="brand" href="#"');
const payload='window.FORGE_DATA='+JSON.stringify(data)+';window.CRAFTING_DATA='+JSON.stringify(cat)+';\n(function(){'+js+'})();';html=html.replace('</body>','<script>'+payload.replace(/<\/script/gi,'<\\/script')+'</script></body>');
await fs.mkdir('outputs/portable',{recursive:true});const output='outputs/portable/WraeclastForge-v1.0.0.html';await fs.writeFile(output,html);await fs.writeFile('outputs/portable/README.txt','Wraeclast Forge v1.0.0\n\nОткройте WraeclastForge-v1.0.0.html в современном браузере. Интернет и установка Node.js не нужны.\nПроекты сохраняются в браузере; для переноса используйте экспорт JSON.\nИзображения и данные PoE2DB / Grinding Gear Games: см. THIRD_PARTY_NOTICES.md.\n');
for(const f of ['LICENSE','THIRD_PARTY_NOTICES.md'])await fs.copyFile(f,'outputs/portable/'+f);
const hash=crypto.createHash('sha256').update(html).digest('hex');await fs.writeFile('outputs/SHA256SUMS.txt',hash+'  WraeclastForge-v1.0.0.html\n');console.log(JSON.stringify({output,bytes:Buffer.byteLength(html),sha256:hash}));
