export const RATE_TTL=30*60*1000;
export const RATE_MAX_AGE=24*60*60*1000;
export const canonicalCurrency=name=>String(name||'').normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const positive=n=>Number.isFinite(Number(n))&&Number(n)>0&&Number(n)<=1e9;
export function normalizeNinja(payload,category='Currency'){
 if(!payload||!Array.isArray(payload.lines)||!payload.core)throw Error('Изменился формат ответа poe.ninja');
 const core=payload.core,items=[...(core.items||[]),...(payload.items||[])],byId=new Map(items.map(x=>[String(x.id),x]));
 const exaltId=items.find(x=>canonicalCurrency(x.name)==='exaltedorb')?.id||'exalted';
 let factor=String(core.primary)===String(exaltId)?1:Number(core.rates?.[exaltId]);
 if(!positive(factor)){const ex=payload.lines.find(l=>String(l.id)===String(exaltId));factor=positive(ex?.primaryValue)?1/Number(ex.primaryValue):NaN}
 if(!positive(factor))throw Error('poe.ninja не вернул опорный курс Exalted Orb');
 const quotes=[];for(const line of payload.lines){const item=byId.get(String(line.id));if(!item?.name||!positive(line.primaryValue))continue;const value=Number(line.primaryValue)*factor;if(!positive(value))continue;quotes.push({name:item.name,value:canonicalCurrency(item.name)==='exaltedorb'?1:value,category,volume:Number.isFinite(Number(line.volumePrimaryValue))?Number(line.volumePrimaryValue):null})}
 if(!quotes.some(q=>canonicalCurrency(q.name)==='exaltedorb'))quotes.push({name:'Exalted Orb',value:1,category:'Currency',volume:null});return quotes;
}
export function normalizeScout(rows){
 if(!Array.isArray(rows))throw Error('Изменился формат ответа PoE2 Scout');
 const get=(x,a,b)=>x[a]??x[b];const exalt=rows.find(x=>canonicalCurrency(get(x,'Text','text'))==='exaltedorb');const base=Number(exalt&&(get(exalt,'CurrentPrice','currentPrice')));
 if(!positive(base))throw Error('PoE2 Scout не вернул опорный курс Exalted Orb');
 return rows.filter(x=>get(x,'ApiId','apiId')&&!get(x,'Name','name')&&positive(get(x,'CurrentPrice','currentPrice'))).map(x=>({name:get(x,'Text','text'),value:Number(get(x,'CurrentPrice','currentPrice'))/base,category:get(x,'CategoryApiId','categoryApiId')||'Currency',volume:null})).filter(x=>x.name&&positive(x.value));
}
export function marketKey(provider,league){return provider+'::'+league}
export function snapshotIndex(snapshot){const index=new Map();for(const q of snapshot?.quotes||[]){const key=canonicalCurrency(q.name);if(key&&positive(q.value)){const previous=index.get(key);if(!previous||(q.volume??0)>(previous.volume??0))index.set(key,q)}}return index}
export function selectQuote(settings,legacyRates,currency,now=Date.now()){
 if(canonicalCurrency(currency)==='exaltedorb')return {value:1,origin:'base',unit:'Exalted Orb'};
 const scoped=settings?.overrides?.[marketKey(settings.provider,settings.league)]?.[canonicalCurrency(currency)];if(Number.isFinite(scoped)&&scoped>=0)return {value:scoped,origin:'manual',provider:settings.provider,league:settings.league,unit:'Exalted Orb'};
 if(!settings?.enabled){const v=legacyRates?.[currency];return {value:Number.isFinite(v)&&v>=0?v:null,origin:Number.isFinite(v)?'manual':'missing',unit:'Exalted Orb'}}
 const key=marketKey(settings.provider,settings.league),manual=settings.overrides?.[key]?.[canonicalCurrency(currency)];
 if(Number.isFinite(manual)&&manual>=0)return {value:manual,origin:'manual',provider:settings.provider,league:settings.league,unit:'Exalted Orb'};
 const s=settings.snapshots?.[key];if(!s||s.provider!==settings.provider||s.league!==settings.league)return {value:null,origin:'missing',provider:settings.provider,league:settings.league,unit:'Exalted Orb'};
 const age=now-Date.parse(s.fetchedAt);const quote=snapshotIndex(s).get(canonicalCurrency(currency));
 return {value:quote&&Number.isFinite(age)&&age>=-300000&&age<=RATE_MAX_AGE?quote.value:null,origin:quote?'market':'missing',provider:s.provider,league:s.league,fetchedAt:s.fetchedAt,sourceAsOf:s.sourceAsOf||null,stale:!Number.isFinite(age)||age>RATE_TTL,expired:!Number.isFinite(age)||age>RATE_MAX_AGE,category:quote?.category,unit:'Exalted Orb'};
}
export function quoteProvenance(quote,value){if(value===null)return {origin:'unknown',unit:'Exalted Orb'};if(quote?.value!==null&&Number.isFinite(quote?.value)&&Math.abs(quote.value-value)<=Math.max(1,Math.abs(value))*1e-10)return {...quote};return {origin:'manual-entry',unit:'Exalted Orb',provider:quote?.provider||null,league:quote?.league||null}}
export function validateSnapshot(s){if(!s||!['ninja','scout'].includes(s.provider)||typeof s.league!=='string'||s.league.length>100||!Number.isFinite(Date.parse(s.fetchedAt))||!Array.isArray(s.quotes)||s.quotes.length>10000)throw Error('Некорректный снимок курсов');const quotes=s.quotes.filter(q=>q&&typeof q.name==='string'&&q.name.length<=200&&positive(q.value)).map(q=>({name:q.name,value:Number(q.value),category:String(q.category||'').slice(0,80),volume:Number.isFinite(q.volume)?q.volume:null}));if(!quotes.some(q=>canonicalCurrency(q.name)==='exaltedorb'&&Math.abs(q.value-1)<1e-8))throw Error('Нет корректной опорной валюты Exalted Orb');return {provider:s.provider,league:s.league,fetchedAt:s.fetchedAt,sourceAsOf:s.sourceAsOf||null,quotes,partial:!!s.partial,errors:Array.isArray(s.errors)?s.errors.map(String).slice(0,20):[]}}
