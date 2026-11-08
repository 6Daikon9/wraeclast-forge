import {allowed,conflict,families,progress,total} from './engine.mjs';

export const VERSION='1.0.0';
const source=id=>'https://poe2db.tw/us/'+id;
const orb=(id,name,type,rarity,extra={})=>({id,name,type,rarity,category:'Сферы',source:source(id),...extra});
export const CORE_ACTIONS=[
 ...[['Orb_of_Transmutation','Сфера превращения','transmute','normal'],['Orb_of_Augmentation','Сфера усиления','augment','magic'],['Regal_Orb','Сфера царей','regal','magic'],['Exalted_Orb','Сфера возвышения','exalt','rare'],['Chaos_Orb','Сфера хаоса','chaos','rare']].flatMap(([id,name,type,rarity])=>[orb(id,name,type,rarity),...['Greater','Perfect'].map((v,i)=>orb((id.startsWith('Orb_')?v+'_'+id:v+'_'+id),(i?'Совершенная ':'Великая ')+name.toLowerCase(),type,rarity,{floor:['transmute','augment'].includes(type)?[44,70][i]:[35,50][i],category:'Greater / Perfect'}))]),
 orb('Orb_of_Alchemy','Сфера алхимии','alchemy','normal',{add:4}),
 orb('Orb_of_Annulment','Сфера отмены','annul',['magic','rare'],{remove:1}),
 orb('Fracturing_Orb','Сфера раскола','fracture','rare'),
 orb('Divine_Orb','Божественная сфера','divine',['magic','rare','unique']),
 orb('Vaal_Orb','Сфера ваал','vaal',['normal','magic','rare','unique'],{category:'Особые операции'}),
 orb('Orb_of_Chance','Сфера удачи','chance','normal',{category:'Особые операции'}),
 orb('Mirror_of_Kalandra','Зеркало Каландры','mirror',['magic','rare'],{category:'Особые операции'}),
 orb('Artificers_Orb','Сфера ремесленника','socket',['normal','magic','rare','unique'],{category:'Гнёзда и руны'}),
 orb('Blacksmiths_Whetstone','Точильный камень','quality',['normal','magic','rare','unique'],{gear:'martial',category:'Качество',qualityKind:'weapon'}),
 orb('Armourers_Scrap','Обрывок доспеха','quality',['normal','magic','rare','unique'],{gear:'armour',category:'Качество',qualityKind:'armour'}),
 orb('Arcanists_Etcher','Резец чародея','quality',['normal','magic','rare','unique'],{gear:'caster',category:'Качество',qualityKind:'caster'}),
 ...[['Vaal_Armourers_Infuser','Настой доспехов ваал','armour'],['Vaal_Blacksmiths_Infuser','Кузнечный настой ваал','martial'],['Vaal_Arcanists_Infuser','Настой чародея ваал','caster'],['Vaal_Catalysing_Infuser','Катализирующий настой ваал','jewellery']].map(([id,name,gear])=>orb(id,name,'infuser',['normal','magic','rare','unique'],{gear,category:'Качество'})),
 ...['Gnawed','Preserved','Ancient'].flatMap(t=>[['Jawbone','Челюсть','weapon'],['Rib','Ребро','armour'],['Collarbone','Ключица','jewellery']].map(([s,n,gear])=>orb(t+'_'+s,({Gnawed:'Обглоданная',Preserved:'Сохранившаяся',Ancient:'Древняя'})[t]+' '+n.toLowerCase(),'desecrate','rare',{gear,category:'Бездна',floor:t==='Ancient'?40:0,maxLevel:t==='Gnawed'?64:100}))),
 orb('Reveal_Desecrated','Раскрыть свойство у Колодца душ','reveal','rare',{category:'Бездна',source:source('Desecrated_Modifiers')}),
 orb('Recombinator','Рекомбинатор','recombine',['magic','rare'],{category:'Особые операции',source:source('Recombinator')}),
 orb('Runeforging','Рунная ковка / Verisium','runeforge',['normal','magic','rare'],{category:'Рунная ковка',source:source('Runeforging')}),
 orb('Architects_Orb','Сфера архитектора','architect',['normal','magic','rare','unique'],{category:'Особые операции'}),
 ...[['Yaomacs','Сфера жертвоприношения Яомака','weapon'],['Kopecs','Сфера жертвоприношения Копека','armour'],['Kamasas','Сфера жертвоприношения Камасы','jewellery']].map(([id,name,gear])=>orb(id+'_Orb_of_Sacrifice',name,'sacrifice','rare',{gear,category:'Особые операции',remove:1})),
 orb('Hinekoras_Lock','Локон Хинекоры','foresight',['normal','magic','rare','unique'],{category:'Особые операции'}),
 orb('Perfect_Flux','Совершенный флюс','flux',['normal','magic','rare','unique'],{gear:'caster',category:'Рунная ковка'}),
 ...[['Blazing','Пылающий','FireResistance'],['Chilling','Леденящий','ColdResistance'],['Crackling','Трескучий','LightningResistance'],['Void','Пустотный','ChaosResistance']].map(([id,n,targetFamily])=>orb(id+'_Flux',n+' флюс','resist-flux',['magic','rare'],{category:'Особые операции',targetFamily})),
 orb('Altered_Collarbone','Изменённая ключица','desecrate','rare',{gear:'jewellery',category:'Бездна',otherworldly:true}),
];

export const OMEN_RULES={};
function omen(name,types,effects){OMEN_RULES['Omen_of_'+name]={id:'Omen_of_'+name,types,effects,source:source('Omen_of_'+name)}}
for(const [suffix,types,key] of [['Alchemy',['alchemy'],'addKind'],['Coronation',['regal'],'addKind'],['Exaltation',['exalt'],'addKind'],['Annulment',['annul'],'removeKind'],['Erasure',['chaos'],'removeKind'],['Crystallisation',['essence-replace'],'removeKind'],['Necromancy',['desecrate'],'addKind']])for(const [side,kind] of [['Sinistral',1],['Dextral',2]])omen(side+'_'+suffix,types,{[key]:kind});
omen('Greater_Exaltation',['exalt'],{addCount:2});omen('Greater_Annulment',['annul'],{removeCount:2});
omen('Whittling',['chaos'],{lowest:true});omen('Light',['annul'],{desecratedOnly:true});
omen('Homogenising_Exaltation',['exalt'],{homogenising:true});omen('Homogenising_Coronation',['regal'],{homogenising:true});
omen('Catalysing_Exaltation',['exalt'],{consumeCatalyst:true});omen('the_Blessed',['divine'],{implicitOnly:true});
omen('Sanctification',['divine'],{sanctify:true});omen('Corruption',['vaal'],{mustChange:true});
omen('Chance',['chance'],{noDestroy:true});omen('the_Ancients',['chance'],{anyUnique:true});
omen('Abyssal_Echoes',['reveal'],{echoes:true});omen('Putrefaction',['desecrate'],{putrefaction:true});
for(const [name,tag] of [['the_Sovereign','ulaman_mod'],['the_Liege','amanamu_mod'],['the_Blackblooded','kurgal_mod']])omen(name,['desecrate'],{abyssTag:tag});

export function gearType(g){if(/Rings|Amulets|Belts/.test(g.id))return 'jewellery';if(/Body_Armours|Helmets|Gloves|Boots|Shields|Foci/.test(g.id))return 'armour';if(/Wands|Staves|Sceptres/.test(g.id)&&!g.id.includes('Quarter'))return 'caster';return 'martial'}
export function stateMods(p,g){return p.mods.map(x=>({...g.mods.find(m=>m.id===x.id),...x}))}
export function intrinsicQualityCap(p,g){const b=g.bases.find(b=>b.id===p.base);return /Refined_Breach_Ring/.test(b.id)?45:/Breach_Ring/.test(b.id)?40:20}
export function socketCap(p,g){if(Number.isInteger(p.socketCapOverride))return p.socketCapOverride;if(gearType(g)==='jewellery'||['Quivers','Sceptres'].includes(g.id))return 0;return /Body_Armours|Bows|Crossbows|Two_Hand|Quarterstaves|Staves/.test(g.id)?2:1}
export function allActions(g,catalog={}){
 const out=CORE_ACTIONS.map(x=>({...x}));
 const em=new Map();for(const row of [...(g.special?.essence||[]),...(g.special?.perfect_essence||[])]){if(!row.currency)continue;if(!em.has(row.currency))em.set(row.currency,[]);em.get(row.currency).push(row)}
 for(const [id,rows] of em){const meta=catalog.essences?.find(x=>x.id===id),replace=rows.some(x=>x.removes);out.push({id,name:meta?.name||rows[0].name,type:replace?'essence-replace':'essence',rarity:replace?'rare':'magic',category:/Alloy/.test(id)?'Сплавы':'Эссенции',guaranteed:rows.map(r=>r.referenceId||r.id),source:meta?.source||source(id),description:meta?.description||rows.map(r=>r.text).join(' · '),crafted:true})}
 for(const row of g.special?.socketable||[])out.push({id:'augment:'+row.id,currency:row.currency||row.name,name:row.name,type:'socketable',rarity:['normal','magic','rare','unique'],category:'Гнёзда и руны',augmentId:row.id,description:row.text,source:row.currency?source(row.currency):source(g.id)});
 for(const c of catalog.quality||[])if(/Catalyst/.test(c.id)&&!/Refined/.test(c.id)&&!out.some(a=>a.id===c.id))out.push({id:c.id,name:c.name,type:'catalyst',rarity:['normal','magic','rare','unique'],category:'Катализаторы',gear:'jewellery',source:c.source,description:c.description});
 for(const a of out){const meta=[...(catalog.currencies||[]),...(catalog.quality||[])].find(c=>c.id===a.id);if(meta){a.name=meta.name||a.name;a.description=meta.description||a.description;a.img=meta.img}}
 return out;
}
export function effective(p,g,a,omenIds=[]){
 const x={addCount:['transmute','augment','regal','exalt','chaos','essence','essence-replace','reveal'].includes(a.type)?1:a.add||0,removeCount:['chaos','essence-replace'].includes(a.type)?1:a.remove||0,addKind:0,removeKind:0,...a};
 const seen=new Set(),effectsSeen=new Map();for(const id of omenIds){if(seen.has(id))throw Error('Одно предзнаменование выбрано дважды');seen.add(id);const o=OMEN_RULES[id];if(!o||!o.types.includes(a.type))throw Error('Предзнаменование не действует на эту операцию');for(const [k,v] of Object.entries(o.effects)){if(effectsSeen.has(k)&&effectsSeen.get(k)!==v)throw Error('Эффекты предзнаменований противоречат друг другу');effectsSeen.set(k,v);x[k]=v}}
 if(x.implicitOnly&&x.sanctify)throw Error('Освящение и переброс только собственных свойств несовместимы');
 if(x.abyssTag&& !['jewellery','martial','caster'].includes(gearType(g)))throw Error('Это предзнаменование Бездны действует только на оружие и бижутерию');
 if(x.putrefaction){x.addCount=0;x.removeCount=0}
 return x;
}
export function removable(p,g,x){let ms=stateMods(p,g).filter(m=>!m.fractured);if(x.removeKind)ms=ms.filter(m=>m.kind===x.removeKind);if(x.desecratedOnly)ms=ms.filter(m=>m.desecrated||m.source==='desecrated'||m.source==='unrevealed');if(x.lowest&&ms.length){const min=Math.min(...ms.map(m=>m.level));ms=ms.filter(m=>m.level===min)}return ms}
export function craftedLimit(p,g){return 1+(p.augments||[]).filter(a=>g.special?.socketable?.find(x=>x.id===a.id)?.currency==='Astrids_Creativity').length}
export function reason(p,g,a,omens=[]){
 let x;try{x=effective(p,g,a,omens)}catch(e){return e.message}
 if(p.destroyed)return 'Предмет уничтожен';if(p.mirrored)return 'Зеркальную копию нельзя изменять';if(p.sanctified&&!['mirror'].includes(a.type))return 'Освящённый предмет защищён от дальнейшего крафта';
 if(p.corrupted&&!['reveal','mirror','architect','sacrifice'].includes(a.type))return 'Осквернённый предмет нельзя изменять этой операцией';
 if(['architect','sacrifice'].includes(a.type)&&!p.corrupted)return 'Требуется осквернённый предмет';
 if(a.type==='sacrifice'&&!p.enchantments)return 'Сначала внесите corruption enchantment предмета';
 if(a.type==='recombine'&&p.leagueMode!=='legacy')return 'Рекомбинатор отключён. Доступна только запись исторического результата в архивном режиме.';
 if(omens.some(id=>['Omen_of_Corruption','Omen_of_Homogenising_Coronation','Omen_of_Homogenising_Exaltation','Omen_of_Greater_Annulment','Omen_of_Sinistral_Alchemy','Omen_of_Dextral_Alchemy','Omen_of_Sinistral_Coronation','Omen_of_Dextral_Coronation'].includes(id))&&!['standard','legacy'].includes(p.leagueMode))return 'Это предзнаменование больше не получается в новой лиге: выберите Standard / архив для существующего экземпляра';
 if(!(Array.isArray(a.rarity)?a.rarity:[a.rarity]).includes(p.rarity))return 'Не подходит текущая редкость';
 if(a.floor&&p.level<a.floor)return `Требуется ilvl ≥ ${a.floor}`;if(a.maxLevel&&p.level>a.maxLevel)return `Допустимый ilvl ≤ ${a.maxLevel}`;
 const gear=gearType(g),ms=stateMods(p,g);if(a.gear&&a.gear!==gear&&!(a.gear==='weapon'&&['caster','martial'].includes(gear)||a.gear==='weapon'&&g.id==='Quivers'))return 'Не подходит тип предмета';
 if(['quality','infuser'].includes(a.type)&&g.id==='Quivers')return 'Эта валюта качества не применяется к колчану';
 if(a.type==='catalyst'&&g.id==='Belts')return 'Этот катализатор предназначен для кольца или амулета';
 if(['augment','exalt'].includes(a.type)&&ms.length+x.addCount>(p.rarity==='magic'?2:6))return 'Недостаточно свободных слотов';
 if(x.addKind&&a.type!=='alchemy'&&x.addCount&&ms.filter(m=>m.kind===x.addKind).length+x.addCount>(p.rarity==='magic'?1:3))return 'Недостаточно свободных слотов выбранного типа';
 if(['regal','essence'].includes(a.type)&&ms.length>=6)return 'Нет свободного слота';
 if(x.removeCount&&removable(p,g,x).length<x.removeCount)return 'Нет достаточного числа подходящих незакреплённых модов для удаления';
 if(a.type==='fracture'&&(ms.length<4||ms.some(m=>m.fractured)))return 'Нужно ≥4 аффиксов и ни одного закреплённого';
 if(a.type==='fracture'&&!ms.some(m=>!m.desecrated&&m.source!=='desecrated'&&m.source!=='unrevealed'))return 'Нет подходящих модов для раскола';
 if(a.crafted&&ms.filter(m=>m.crafted).length>=craftedLimit(p,g))return 'Достигнут лимит crafted-модов';
 if(a.type==='desecrate'&&!x.putrefaction&&ms.some(m=>m.desecrated||['desecrated','unrevealed'].includes(m.source)))return 'На предмете уже есть свойство Бездны';
 if(a.type==='desecrate'&&x.putrefaction&&ms.some(m=>m.fractured))return 'Замена всех модов с закреплённым модом не поддерживается источником';
 if(a.type==='reveal'&&!ms.some(m=>m.source==='unrevealed'))return 'Нет нераскрытого свойства Бездны';
 if(a.type==='socket'&& (p.sockets||0)>=socketCap(p,g))return 'Достигнут обычный лимит гнёзд';
 if(a.type==='socketable'&&!(p.sockets>0))return 'Нет гнёзд для установки';
 if(a.type==='socketable'&&/Astrids_Creativity/.test(a.currency||'')&&(p.augments||[]).some(m=>g.special?.socketable?.find(x=>x.id===m.id)?.currency==='Astrids_Creativity'))return 'Руна Астрид ограничена одной';
 if(a.type==='quality'&&(p.quality||0)>=intrinsicQualityCap(p,g))return 'Достигнут обычный максимум качества';
 if(a.type==='infuser'&&(p.quality||0)<intrinsicQualityCap(p,g))return 'Настой требует качества не ниже обычного максимума';
 if(a.type==='infuser'&&(p.quality||0)>=intrinsicQualityCap(p,g)+10)return 'Достигнут максимум качества с настоем';
 if(x.consumeCatalyst&&!(p.catalyst?.quality>0))return 'Нет качества катализатора для расхода';
 if(x.sanctify&&p.rarity!=='rare')return 'Освящение требует редкий предмет';
 if(['exalt','augment','regal','transmute'].includes(a.type)&&!additionPool(p,g,x,[],[]).length)return 'Нет доступных аффиксов при этих ограничениях';
 return '';
}
function passesFloor(m,p,g,x,pool){if(!x.floor||m.level>=x.floor)return true;const family=families({mods:pool}).find(f=>f.tiers.some(t=>t.id===m.id));return family?.tiers.filter(t=>t.level<=p.level).every(t=>t.level<=m.level)}
const matchingTags=new Set(['life','mana','defences','defence','physical','fire','cold','lightning','chaos','elemental','attack','caster','speed','critical','attribute','minion']);
export function additionPool(p,g,x,removed=[],added=[]){
 let remaining=stateMods(p,g).filter(m=>!removed.includes(m.id));let rarity=['transmute','augment'].includes(x.type)?'magic':x.type==='reveal'?p.rarity:'rare';
 if(x.type==='alchemy'||x.type==='vaal'||x.type==='recombine'||x.putrefaction)remaining=[];
 if(x.type==='reveal')remaining=remaining.filter(m=>m.source!=='unrevealed'||(x.revealId&&m.id!==x.revealId));
 const candidates=x.guaranteed?x.guaranteed.map(id=>g.mods.find(m=>m.id===id)).filter(Boolean):g.mods.filter(m=>!m.source||m.source==='normal'||x.type==='reveal'&&(m.source==='desecrated'||x.otherworldly&&m.source==='breach_otherworldly'));
 const existing=[...remaining,...added.map(x=>g.mods.find(m=>m.id===x.id)).filter(Boolean)];
 return candidates.filter(m=>[1,2].includes(m.kind)&&allowed(m,existing,rarity,x.guaranteed?100:p.level)&&(!x.addKind||x.type==='alchemy'||m.kind===x.addKind)&&passesFloor(m,p,g,x,candidates)&&(!x.abyssTag||m.tags.includes(x.abyssTag))&&(!x.homogenising||m.tags.some(t=>matchingTags.has(t)&&remaining.some(e=>e.tags?.includes(t)))));
}
export const ranges=m=>[...m.text.matchAll(/\((-?\d+(?:\.\d+)?)—(-?\d+(?:\.\d+)?)\)/g)].map(x=>({min:+x[1],max:+x[2]}));
export function rolled(m,values){const rs=ranges(m);if(values.length!==rs.length||values.some((n,i)=>!Number.isFinite(n)||n<rs[i].min||n>rs[i].max))throw Error('Значение выходит за диапазон выбранного тира');let i=0;return m.text.replace(/\((-?\d+(?:\.\d+)?)—(-?\d+(?:\.\d+)?)\)/g,()=>String(values[i++]))}
export function recommend(p,g,catalog){
 const gs=progress(p,g),ms=stateMods(p,g),actions=allActions(g,catalog),sp=total(p.entries);
 if(p.destroyed||p.mirrored||p.sanctified||p.corrupted&&!ms.some(m=>m.source==='unrevealed'))return {title:'Обычный крафт завершён',text:'Предмет находится в конечном состоянии. Доступные исключения смотрите в инструментах.'};
 if(ms.some(m=>m.source==='unrevealed'))return {action:'Reveal_Desecrated',title:'Раскройте свойство Бездны',text:'Внесите выбранный в Колодце душ вариант. Предзнаменование эха позволяет один раз обновить варианты.'};
 if(!gs.length)return {title:'Выберите целевые статы',text:'Можно выбрать обычные, crafted и специальные моды Бездны. Затем помощник покажет варианты следующего шага.'};
 if(gs.every(t=>t.met))return {title:'Цель достигнута',text:'Все выбранные семейства и тиры уже есть. Проверьте значения и качество перед рискованными операциями.'};
 if(p.budget&&sp.value>=p.budget)return {title:'Бюджет достигнут',text:'Рассмотрите остановку, новую базу или увеличение бюджета. Расходы без курса не входят в известную сумму.'};
 const missing=gs.filter(t=>!t.met).sort((a,b)=>b.priority-a.priority);
 const essence=actions.filter(a=>['essence','essence-replace'].includes(a.type)&&!reason(p,g,a)).find(a=>a.guaranteed.some(id=>missing.some(t=>conflict(g.mods.find(m=>m.id===id),t.target))));
 if(essence)return {action:essence.id,title:essence.name,text:essence.type==='essence'?'Эта сущность добавляет гарантированное целевое семейство и переводит вещь в редкую. Проверьте конкретный диапазон.':'Вариант с гарантированным crafted-модом: сначала будет снят случайный незакреплённый мод. При необходимости используйте предзнаменование кристаллизации.'};
 const base=p.rarity==='normal'?'Orb_of_Transmutation':p.rarity==='magic'?(ms.length<2?'Orb_of_Augmentation':'Regal_Orb'):(ms.length<6?'Exalted_Orb':'Chaos_Orb');
 const variants=actions.filter(a=>a.id===base||a.id==='Greater_'+base||a.id==='Perfect_'+base).filter(a=>!reason(p,g,a));
 const a=variants.at(-1);return a?{action:a.id,title:a.name,text:(a.floor?`Минимальный уровень модификатора ${a.floor}; для низкоуровневых семейств сохраняется старший доступный тир. `:'')+(a.type==='chaos'?'Замена случайного мода может уничтожить полезный стат. Омены могут ограничить, какой тип будет снят.':'Добавляет случайный мод. В инструментах доступны другие версии сферы и совместимые омены.')+' Это маршрут по правилам, без расчёта минимальной рыночной цены.'}:{title:'Проверьте ограничения',text:'Выберите операцию в инструментах; список объяснит, что доступно для состояния этой вещи.'};
}

const mutationKeys=['mods','rarity','corrupted','mirrored','sanctified','destroyed','quality','catalyst','sockets','augments','implicitRoll','enchantments','lastOutcome','socketCapOverride','base','foresight','grantedSkillLevel','uniqueName'];
export function applyCraft(p,g,a,result,omenIds=[]){
 const why=reason(p,g,a,omenIds);if(why)throw Error(why);const x=effective(p,g,a,omenIds),n=structuredClone(p),removed=result.removed||[],added=result.added||[];const step=crypto.randomUUID();
 const snapshot=Object.fromEntries(mutationKeys.map(k=>[k,structuredClone(p[k]??null)]));
 const pool=removable(p,g,x);if(new Set(removed).size!==removed.length||removed.some(id=>!pool.some(m=>m.id===id)))throw Error('Нельзя удалить выбранный мод с этими ограничениями');
 if(['chaos','annul','essence-replace','sacrifice'].includes(a.type)&&removed.length!==x.removeCount)throw Error('Неверное число снятых аффиксов');
 const mark=stateMods(p,g).find(m=>m.currency==='Essence_of_the_Abyss');
 if(a.type==='desecrate'&&!x.putrefaction&&mark&&(removed.length!==1||removed[0]!==mark.id))throw Error('Desecration должна заменить Метку владыки Бездны');
 if(a.type==='desecrate'&&!x.putrefaction&&!mark&&p.mods.length>=6&&removed.length!==1)throw Error('При полном предмете укажите исчезнувший мод');
 if(a.type==='desecrate'&&!x.putrefaction&&!mark&&p.mods.length<6&&removed.length)throw Error('Для свободного слота удаление не требуется');
 n.mods=n.mods.filter(m=>!removed.includes(m.id));
 const expected=['transmute','augment','regal','exalt','chaos','essence','essence-replace','alchemy'].includes(a.type)?x.addCount:0;
 if(expected){if(added.length!==expected)throw Error('Укажите все добавленные моды');const accumulated=[];for(const z of added){const available=additionPool(p,g,x,removed,accumulated),m=available.find(m=>m.id===z.id);if(!m)throw Error('Этот мод не может выпасть при выбранных ограничениях');const roll=rolled(m,z.values||[]);accumulated.push(z);n.mods.push({id:m.id,roll,crafted:!!a.crafted,values:z.values||[]})}}
 if(a.type==='alchemy'&&x.addKind&&n.mods.filter(m=>g.mods.find(y=>y.id===m.id).kind===x.addKind).length!==3)throw Error('Предзнаменование алхимии требует три аффикса выбранного типа');
 if(['transmute'].includes(a.type))n.rarity='magic';if(['regal','alchemy','essence'].includes(a.type))n.rarity='rare';
 if(a.type==='fracture'){const m=stateMods(p,g).find(m=>m.id===result.fracturedId);if(!m||m.fractured||m.desecrated||['desecrated','unrevealed'].includes(m.source))throw Error('Этот мод нельзя закрепить');n.mods=n.mods.map(z=>z.id===m.id?{...z,fractured:true}:z)}
 if(a.type==='desecrate'){
  const kinds=result.unrevealedKinds||[];if(x.putrefaction){if(!kinds.length||kinds.length>6)throw Error('Укажите 1–6 нераскрытых модов');n.mods=[];n.corrupted=true}else if(kinds.length!==1)throw Error('Нужно одно нераскрытое свойство');
  for(const kind of kinds){if(![1,2].includes(kind)||x.addKind&&kind!==x.addKind)throw Error('Не подходит тип свойства Бездны');const m=g.mods.find(m=>m.id.startsWith(g.id+'-unrevealed-'+kind+'-')&&!n.mods.some(z=>z.id===m.id));if(!m)throw Error('Превышен лимит свойств Бездны');const taken=n.mods.map(z=>g.mods.find(m=>m.id===z.id)||{kind:z.kind,families:[]});if(taken.filter(m=>m.kind===kind).length>=3)throw Error('Превышен лимит префиксов или суффиксов');n.mods.push({id:m.id,roll:m.text,desecrated:true,pendingFloor:x.floor||0,abyssTag:x.abyssTag||'',otherworldly:!!x.otherworldly,kind})}
 }
 if(a.type==='reveal'){
  const index=n.mods.findIndex(m=>m.instanceId?m.instanceId===result.revealId:m.id===result.revealId);if(index<0||!g.mods.find(m=>m.id===n.mods[index].id)?.source?.includes('unrevealed'))throw Error('Нужно выбрать нераскрытый мод');
  const pending=n.mods[index],z=added[0];if(added.length!==1)throw Error('Выберите один из реально раскрытых вариантов');
  const before=structuredClone(p);before.mods.splice(index,1);const rx={...x,revealId:pending.id,addKind:pending.kind||g.mods.find(m=>m.id===pending.id).kind,floor:pending.pendingFloor||0,abyssTag:pending.abyssTag||'',otherworldly:!!pending.otherworldly};
  const m=additionPool(before,g,rx,[],[]).find(m=>m.id===z.id);if(!m)throw Error('Этот вариант несовместим со свойством Бездны');n.mods[index]={id:m.id,roll:rolled(m,z.values||[]),values:z.values||[],desecrated:true};
 }
 if(a.type==='divine'){
  if(x.implicitOnly)n.implicitRoll=cleanText(result.implicitRoll,1500);else {for(const z of result.rerolls||[]){const existing=n.mods.find(m=>m.id===z.id),m=g.mods.find(m=>m.id===z.id);if(!existing||existing.fractured)throw Error('Закреплённый мод нельзя перебросить');existing.roll=x.sanctify?cleanText(z.roll,500):rolled(m,z.values||[]);existing.values=x.sanctify?[]:z.values||[]}
   const count=n.mods.filter(m=>!m.fractured&&g.mods.find(x=>x.id===m.id)?.source!=='unrevealed').length;if((result.rerolls||[]).length!==count)throw Error('Укажите новые значения всех незакреплённых модов');if(x.sanctify)n.sanctified=true;
  }
 }
 if(['quality','infuser','catalyst'].includes(a.type)){
  const value=result.quality,cap=intrinsicQualityCap(p,g)+(a.type==='infuser'?10:0);if(!Number.isInteger(value)||value<0||value>cap||a.type==='infuser'&&value<(p.quality||0))throw Error('Некорректное итоговое качество');
  if(a.type==='catalyst'){n.catalyst={type:a.id,quality:value};n.quality=value}else n.quality=value;
  if(a.type==='infuser')n.corrupted=!!result.corrupted;
 }
 if(a.type==='socket'){n.sockets=(n.sockets||0)+1}
 if(a.type==='socketable'){n.augments=[...(n.augments||[])];const z={id:a.augmentId,roll:cleanText(result.augmentRoll||a.description,1000)};if(Number.isInteger(result.socketIndex)&&result.socketIndex<n.augments.length)n.augments[result.socketIndex]=z;else if(n.augments.length<(p.sockets||0))n.augments.push(z);else throw Error('Укажите гнездо для замены')}
 if(a.type==='mirror')n.mirrored=true;
 if(a.type==='chance'){
  if(result.outcome==='destroyed'&&!x.noDestroy)n.destroyed=true;else if(result.outcome==='unique'){n.rarity='unique';n.uniqueName=cleanText(result.uniqueName,150);n.mods=[]}else if(result.outcome==='unchanged'&&x.noDestroy){}else throw Error('Укажите допустимый результат сферы удачи');
 }
 if(a.type==='foresight')n.foresight=cleanText(result.description,1500);else delete n.foresight;
 if(a.type==='flux')n.grantedSkillLevel=20;
 if(a.type==='sacrifice')n.enchantments=cleanText(result.enchantments,1500);
 if(['vaal','recombine','runeforge','architect','resist-flux'].includes(a.type)){
  if(a.type==='architect'&&result.outcome==='destroyed'){n.destroyed=true}else{
  if(!result.observed)throw Error('Нужно внести фактическое итоговое состояние');
  const o=result.observed;if(o.mods.length>6)throw Error('Слишком много аффиксов');const picked=[];
  for(const z of o.mods){const m=g.mods.find(m=>m.id===z.id);const converted=!!z.converted&&m?.families.some(f=>/Resistance/.test(f));if(!m||!allowed({...m,converted},picked,o.rarity||p.rarity,p.level))throw Error('Несовместимое итоговое состояние');picked.push(m)}
  if(['recombine','runeforge'].includes(a.type)&&!result.description)throw Error('Укажите использованные материалы / второй предмет');
  Object.assign(n,{mods:structuredClone(o.mods),rarity:o.rarity||p.rarity,quality:o.quality??p.quality,sockets:o.sockets??p.sockets});if(a.type==='vaal')n.corrupted=true;
  if(o.base){if(!g.bases.some(b=>b.id===o.base))throw Error('Новая база должна быть в текущем классе');n.base=o.base}if(a.type==='runeforge'&&!o.base)throw Error('Укажите новую базу после рунной ковки');
  if(x.mustChange&&JSON.stringify(o.mods)===JSON.stringify(p.mods)&&!o.enchantments&&o.sockets===p.sockets&&o.quality===p.quality)throw Error('С этим предзнаменованием должен быть записан изменившийся результат');
  if(o.enchantments)n.enchantments=cleanText(o.enchantments,1500);
  if(o.implicitRoll)n.implicitRoll=cleanText(o.implicitRoll,1500);
 }}
 if(x.consumeCatalyst){n.catalyst={...n.catalyst,quality:0};n.quality=0}
 const cost=(id,rate)=>({currency:id.replaceAll('_',' '),qty:1,rate:rate===''||rate===undefined?null:rate,note:cleanText(result.description||a.name,500),date:new Date().toISOString(),stepId:step});
 n.entries.push(cost(a.currency||a.id,result.rate));for(const id of omenIds)n.entries.push(cost(id,result.omenRates?.[id]));
 for(const e of n.entries.slice(p.entries.length))if(e.rate!==null&&(!Number.isFinite(e.rate)||e.rate<0))throw Error('Неверная цена операции');
 const crafted=n.mods.filter(m=>m.crafted).length;if(crafted>craftedLimit(n,g))throw Error('Итог превышает лимит crafted-модов');
 n.history=[...(n.history||[]).slice(-19),{stepId:step,snapshot,label:a.name}];n.lastOutcome={currency:a.id,roll:result.description||a.name};n.updated=Date.now();return n;
}
function cleanText(v,max){if(typeof v!=='string'||v.length>max)throw Error('Некорректное текстовое значение');return v.trim()}
export function undoCraft(p){const n=structuredClone(p),h=n.history?.pop();if(!h)throw Error('Нет шагов для отмены');Object.assign(n,h.snapshot);for(const k of mutationKeys)if(n[k]===null)delete n[k];n.entries=n.entries.filter(e=>e.stepId!==h.stepId);n.updated=Date.now();return n}
