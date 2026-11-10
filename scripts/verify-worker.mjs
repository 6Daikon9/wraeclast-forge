import assert from 'node:assert/strict';import worker from '../dist/server/index.js';
const r=await worker.fetch(new Request('https://example.test/'),{},{});assert.equal(r.status,200);assert.equal(r.headers.get('content-encoding'),null);const html=await r.text();assert.ok(html.includes('market-ui')||html.includes('app.js'));assert.ok(html.includes('Крафт PoE2'));
const module=await worker.fetch(new Request('https://example.test/market-rates.mjs'),{},{});assert.equal(module.status,200);assert.ok((await module.text()).includes('normalizeNinja'));
const invalid=await worker.fetch(new Request('https://example.test/api/market/rates?provider=invalid'),{},{});assert.equal(invalid.status,400);console.log('Worker: static assets, compressed modules, and API routing verified');
