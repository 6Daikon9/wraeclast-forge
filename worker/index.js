import {createMarketService} from '../server/market-proxy.mjs';
const marketService=createMarketService();
export default {async fetch(request,env,ctx){const url=new URL(request.url);if(url.pathname.startsWith('/api/market/')){
 const key=new URL(url.origin+url.pathname);key.searchParams.set('provider',url.searchParams.get('provider')||'ninja');if(url.searchParams.has('league'))key.searchParams.set('league',url.searchParams.get('league'));const cache=globalThis.caches?.default;
 if(request.method==='GET'&&cache){const hit=await cache.match(key.toString());if(hit)return hit}
 const response=await marketService.handle(request);if(request.method==='GET'&&response.ok&&cache)ctx.waitUntil(cache.put(key.toString(),response.clone()).catch(()=>{}));return response;
 }
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});let pathname;try{pathname=decodeURIComponent(url.pathname)}catch{return new Response('Bad request',{status:400})}const file=STATIC_ASSETS[pathname==='/'?'/index.html':pathname];if(!file)return new Response('Not found',{status:404});const headers={'Content-Type':file.type,'Cache-Control':file.type.startsWith('image/')?'public, max-age=86400':'no-cache','X-Content-Type-Options':'nosniff'};let body=null;if(request.method!=='HEAD'){const bytes=Uint8Array.from(atob(file.body),c=>c.charCodeAt(0));body=file.gzip?new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')):bytes}return new Response(body,{headers});}};
