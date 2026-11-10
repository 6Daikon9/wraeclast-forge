# Currency API integration

Version 1.1.0. API integration verified 2026-11-08; released 2026-11-10.

## Sources

- [poe.ninja API reference](https://poe.ninja/docs/api): `/poe2/api/economy/leagues` and `/poe2/api/economy/exchange/current/overview?league=...&type=...`.
- [PoE2 Scout canonical OpenAPI](https://api.poe2scout.com/openapi/v1.json), [Swagger](https://api.poe2scout.com/swagger), [official source repository](https://github.com/poe2scout/poe2scout): `/poe2/Leagues` and `/poe2/Leagues/{leagueName}/Items`. The route parameter is RealmApiId `poe2`, not the full realm selector Value `poe2/poe2`.

Only the public economy endpoints are used. No account token is required. The backend identifies itself as `WraeclastForge/1.1.0 (+https://github.com/6Daikon9/wraeclast-forge)`.

## Local API

`GET /api/market/leagues?provider=ninja|scout`

`GET /api/market/rates?provider=ninja|scout&league=<exact league id>`

The backend restricts sources and upstream paths; it is not a general URL proxy. The selected league must occur in that provider's league list. It returns normalized quotes in Exalted Orb, fetch time, optional upstream Last-Modified, coverage/errors and provider/league identity.

poe.ninja categories: Currency, Ritual, Essences, Abyss, Runes, SoulCores, Idols, Breach, Verisium, Expedition, Delirium. A failed category results in partial coverage, not invented or zero prices. Scout uses one item feed, excludes named uniques, and converts using its observed Exalted Orb reference quote.

## Conversion and matching

For poe.ninja, `line.primaryValue` is multiplied by the number of Exalted Orbs per primary currency from `core.rates`. For example, primary Divine, rate Exalted=500 and primaryValue=0.1 gives 50 ex. It is not divided by 500. If needed, the reciprocal of the Exalted line's primaryValue supplies the reference factor. If the primary is already Exalted, the factor is 1.

Scout values are divided by the observed Exalted Orb CurrentPrice. This remains valid if its reference unit changes. Missing/nonpositive/invalid anchors reject the snapshot.

Currency names are matched by exact Unicode-normalized alphanumeric keys, ignoring punctuation, apostrophes, underscores and case. There is no fuzzy prefix matching between ordinary, Greater and Perfect variants. An absent quote remains unknown. Manual zero is permitted as an intentional user override; API zero is not a usable quote.

## Caching and historical costs

- Upstream requests are cached for 30 minutes and concurrent identical requests are combined.
- Revalidation uses ETag/If-None-Match and Last-Modified/If-Modified-Since where supplied.
- Failed requests back off and HTTP Retry-After is respected.
- The Worker uses the same bounded in-memory cache as the local server; it does not require Cloudflare's default cache, which Sites does not grant.
- Browser caches and overrides are isolated by provider and exact league. Changing the source or league never silently uses another market's quotes.
- Auto-refresh is at most every 30 minutes while the page is visible. No background automation is created.
- Cached quotes older than 30 minutes are marked as saved/stale. Quotes older than 24 hours are not automatically applied.
- Each newly recorded expense stores its numeric unit price and provenance at the time of confirmation. Updating market snapshots does not reprice the journal. Editing an old entry preserves its original price unless the user changes it.

Fetched time is the time this application obtained/revalidated its snapshot, not a claim that every underlying trade occurred then. Source updates can be less frequent and estimates differ between providers.

## Deployment and portable mode

`server.mjs` serves static files and the same proxy locally. `worker/index.js`, built with `scripts/build-worker.mjs`, provides equivalent routes in Cloudflare Workers and embeds compressed static resources. It needs no runtime credentials or additional storage bindings.

The standalone HTML deliberately uses cached/manual rates and snapshot import/export. Fresh synchronization requires the online application or the local server. This avoids unsupported upstream browser calls and respects poe.ninja's documented recommendation to proxy requests through a backend.

## Validation

Tests cover conversion direction, missing anchors, source/league isolation, expiry, manual overrides, historic price stability, caching, concurrent request coalescing, partial failures, rate limiting and ETag revalidation. Live browser checks covered both providers and manual override prefill in the expense form.
