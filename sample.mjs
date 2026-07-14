#!/usr/bin/env node
// Hourly sampler of dYdX v4 (Cosmos appchain) PUBLIC CHAIN STATE via neutral third-party
// LCD endpoints: per-perpetual cumulative funding_index + open_interest, block-stamped.
// funding rates = deltas of funding_index between samples (dYdX applies funding hourly);
// we archive the raw cumulative values so any window can be recomputed deterministically.
//
// Sources are general-purpose Cosmos infra providers (no dYdX-operated hosts):
// PublicNode primary, Polkachu fallback. Pure HTTP GETs of public blockchain records.
const LCDS = ['https://dydx-rest.publicnode.com', 'https://dydx-api.polkachu.com'];

import { appendFileSync, mkdirSync } from 'fs';

async function getJson(path) {
  let lastErr;
  for (const base of LCDS) {
    try {
      const r = await fetch(base + path, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'dydx-archive (github.com/GTCC777/dydx-archive)' } });
      if (!r.ok) throw new Error(`http_${r.status}`);
      return { data: await r.json(), source: base };
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

const { data: blk } = await getJson('/cosmos/base/tendermint/v1beta1/blocks/latest');
const height = Number(blk.block?.header?.height);
const chainTime = blk.block?.header?.time;
if (!Number.isFinite(height) || !chainTime) throw new Error('bad_block_header');

const { data: perps, source } = await getJson('/dydxprotocol/perpetuals/perpetual?pagination.limit=1000');
if (!Array.isArray(perps.perpetual) || perps.perpetual.length < 50) throw new Error(`suspicious_perp_count_${perps.perpetual?.length}`);

const markets = {};
for (const p of perps.perpetual) {
  const t = p.params?.ticker;
  if (!t) continue;
  markets[t] = { fi: p.funding_index, oi: p.open_interest, ar: p.params.atomic_resolution };
}

const row = JSON.stringify({ ts: new Date().toISOString(), height, chain_time: chainTime, source, n: Object.keys(markets).length, markets });
const month = new Date().toISOString().slice(0, 7);
mkdirSync('data', { recursive: true });
appendFileSync(`data/${month}.jsonl`, row + '\n');
console.log(`sampled ${Object.keys(markets).length} markets at height ${height} -> data/${month}.jsonl`);
