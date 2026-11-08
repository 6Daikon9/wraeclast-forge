import fs from 'node:fs/promises';import path from 'node:path';
const src=process.cwd(),dest=path.resolve(src,'../github-release-v1');if(path.dirname(dest)!==path.dirname(src))throw Error('Invalid export location');await fs.mkdir(dest);
const list=['dist','scripts','tests','docs','.github','package.json','README.md','CHANGELOG.md','LICENSE','THIRD_PARTY_NOTICES.md','RELEASE_NOTES.md','server.mjs','.gitignore'];
for(const file of list)await fs.cp(path.join(src,file),path.join(dest,file),{recursive:true});
const bad=/gh[opusr]_[A-Za-z0-9]{20,}|art_v\d_[A-Za-z0-9_]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
async function scan(dir){for(const ent of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())await scan(p);else if(/\.(?:js|mjs|md|json|yml|txt)$/.test(ent.name)){const text=await fs.readFile(p,'utf8');if(bad.test(text))throw Error('Credential-like content found in '+path.relative(dest,p))}}}await scan(dest);console.log(JSON.stringify({publicSource:dest,secretScan:'passed',excluded:['.git','.openai','.cache','outputs','project state']}));
