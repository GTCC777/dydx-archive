# dydx-archive

Hourly archive of **public dYdX v4 chain state**: per-perpetual cumulative `funding_index`
and `open_interest`, block-stamped, sampled via neutral third-party Cosmos LCD providers
(PublicNode, Polkachu). One JSONL row per hour in `data/YYYY-MM.jsonl`:

```json
{"ts":"2026-07-14T06:08:00Z","height":97652472,"chain_time":"...","source":"...","n":296,
 "markets":{"BTC-USD":{"fi":"2227060","oi":"2779133000000","ar":-10}, ...}}
```

- `fi` — cumulative funding index (funding rate over a window = delta of `fi` between rows)
- `oi` — open interest in atomic units; multiply by `10^ar` for base units
- Rows are append-only; history never changes retroactively.

These are facts recorded on a public blockchain, collected here for convenience.
Repository content: CC0 / public domain. Maintained by The Aslan Group LLC
(info@theaslangroupllc.com) as the data layer for PulseNetwork funding-history products.
