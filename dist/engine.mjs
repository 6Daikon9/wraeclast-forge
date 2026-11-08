export const caps = rarity => rarity==='rare'?[3,3]:rarity==='magic'?[1,1]:[0,0];
export const conflict=(a,b)=>a.families.some(f=>b.families.includes(f));
export function allowed(mod,mods,rarity,level){const cap=caps(rarity)[mod.kind-1];return mod.level<=level&&!mods.some(x=>x.id===mod.id)&&mods.filter(x=>x.kind===mod.kind).length<cap&&(mod.converted||!mods.some(x=>conflict(x,mod)));}
export function families(group){const map=new Map();for(const m of group.mods.filter(m=>m.source!=='converted')){const k=m.families.slice().sort().join('|')+'::'+m.text.replace(/\([+\-\d.—\s]+\)/g,'#').replace(/\d+(?:\.\d+)?/g,'#');if(!map.has(k))map.set(k,[]);map.get(k).push(m)}return [...map].map(([signature,tiers])=>({signature,key:tiers[0].families.slice().sort().join('|'),kind:tiers[0].kind,tiers:tiers.sort((a,b)=>b.level-a.level),tags:tiers[0].tags}));}
export const tier=(group,m)=>{const id=m?.source==='converted'?m.referenceId:m?.id;return families(group).find(f=>f.tiers.some(t=>t.id===id))?.tiers.findIndex(t=>t.id===id)+1};
export function progress(project,group){const mods=project.mods.map(x=>group.mods.find(m=>m.id===x.id)).filter(Boolean),fs=families(group);return project.targets.map(t=>{const target=group.mods.find(m=>m.id===t.id),family=fs.find(f=>f.tiers.some(m=>m.id===t.id));return {...t,target,met:!!target&&mods.some(m=>m.level>=target.level&&family?.tiers.some(x=>x.id===(m.source==='converted'?m.referenceId:m.id)))}});}
export function total(entries){let value=0,unknown=0;for(const e of entries){if(e.rate===null||e.rate==='')unknown++;else value+=e.qty*e.rate;}return {value,unknown};}
export function validateProject(p,data){
 if(!p||typeof p!=='object')throw Error('Некорректный файл проекта');
 const g=data.groups.find(g=>g.id===p.group);if(!g||!g.bases.some(b=>b.id===p.base))throw Error('База отсутствует в каталоге');
 if(!['normal','magic','rare','unique'].includes(p.rarity)||!Number.isInteger(p.level)||p.level<1||p.level>100)throw Error('Неверная редкость или уровень предмета');
 if(!Array.isArray(p.mods)||p.mods.length>6||!Array.isArray(p.targets)||p.targets.length>6||!Array.isArray(p.entries)||p.entries.length>10000)throw Error('Некорректный состав проекта');
 const picked=[];for(const x of p.mods){const m=g.mods.find(m=>m.id===x.id),converted=!!x.converted&&m?.families.some(f=>/Resistance/.test(f));if(!m||!allowed({...m,converted},picked,p.rarity,x.crafted||m.crafted?100:p.level))throw Error('Несовместимые аффиксы или уровень предмета');if(typeof x.roll!=='string'||x.roll.length>500)throw Error('Некорректное значение аффикса');picked.push(m)}
 const goals=[];for(const x of p.targets){const m=g.mods.find(m=>m.id===x.id);if(!m||m.source==='unrevealed'||!allowed(m,goals,'rare',100)||![1,2,3].includes(x.priority))throw Error('Некорректные цели');goals.push(m)}
 for(const e of p.entries){if(typeof e.currency!=='string'||e.currency.length>80||!Number.isFinite(e.qty)||e.qty<=0||e.qty>1e9||!(e.rate===null||(Number.isFinite(e.rate)&&e.rate>=0&&e.rate<=1e9))||typeof e.note!=='string'||e.note.length>500)throw Error('Некорректная запись расходов')}
 if(typeof p.name!=='string'||p.name.length>120||!Number.isFinite(p.budget)||p.budget<0||p.budget>1e12)throw Error('Некорректное имя или бюджет');
 for(const k of ['corrupted','mirrored','sanctified','destroyed'])if(p[k]!==undefined&&p[k]!==null&&typeof p[k]!=='boolean')throw Error('Некорректное состояние предмета');
 for(const [k,max] of [['quality',100],['sockets',6],['socketCapOverride',6]])if(p[k]!==undefined&&p[k]!==null&&(!Number.isInteger(p[k])||p[k]<0||p[k]>max))throw Error('Некорректное качество или гнёзда');
 if(p.augments!==undefined&&(!Array.isArray(p.augments)||p.augments.length>(p.sockets||0)||p.augments.some(a=>!g.special?.socketable?.some(x=>x.id===a.id)||typeof a.roll!=='string'||a.roll.length>1000)))throw Error('Некорректные Augment');
 if(p.mods.filter(m=>m.fractured).length>1||p.mods.some(m=>m.fractured&&m.desecrated))throw Error('Некорректные признаки раскола');
 const craftedCap=1+(p.augments||[]).filter(a=>g.special?.socketable?.find(x=>x.id===a.id)?.currency==='Astrids_Creativity').length;if(p.mods.filter(m=>m.crafted).length>craftedCap)throw Error('Превышен лимит crafted-модов');
 return {...p,quality:p.quality||0,sockets:p.sockets||0,augments:p.augments||[],history:Array.isArray(p.history)?p.history.slice(-20):[],leagueMode:['current','standard','legacy'].includes(p.leagueMode)?p.leagueMode:'current',id:crypto.randomUUID(),updated:Date.now()};
}
