# The News Meta Processing Pipeline

This directory contains a staged implementation scaffold for The News Meta
pipeline:

1. Event detection and article clustering
2. Source bias classification (static human-rated table)
3. Deterministic linguistic analysis
4. Factual core extraction
5. Meta-analysis assembly
6. Canonical signing handoff

## Current status

- Provider adapter layer is in place (`newsapi`, `gnews`, `mediastack`) with env-driven config.
- LLM extraction/generation is placeholder-only.
- Deterministic analysis is implemented and auditable.
- Pipeline can run against local sample data today.

## Files

- `sourceRatings.mjs` - static source ratings lookup + alias resolution
- `placeholders.mjs` - news API and LLM placeholders
- `types.mjs` - schema shape helpers and validators
- `linguistics.mjs` - deterministic linguistic scoring
- `factualCore.mjs` - factual core aggregation and framing comparison
- `pipeline.mjs` - stage orchestrator
- `config.mjs` - environment-driven provider/LLM/signing config
- `providers/` - external provider adapter interfaces and normalization
- `sample-event.mjs` - local sample input data
- `run-local.mjs` - executable local run entrypoint
- `handoff-sign.mjs` - writes signed article payload + `.sig` into `articles/YYYYMMDD/`

## Run local scaffold

```bash
node "./pipeline/run-local.mjs"
```

The run writes a staged output package to:

`./pipeline/output/latest-meta-article.json`

Optional signed handoff into article artifacts:

```bash
TNM_HANDOFF_SIGN=1 node "./pipeline/run-local.mjs"
```

or run directly:

```bash
node "./pipeline/handoff-sign.mjs"
```

Config stubs:

- Copy values from `pipeline/.env.example` into your environment.
- Choose provider with `TNM_NEWS_PROVIDER` (`newsapi`, `gnews`, `mediastack`).
- Set `TNM_USE_PROVIDER=1` (and `TNM_TOPIC`) to pull real provider input instead of `sample-event.mjs`.

## Design constraints encoded

- Source lean comes from static table only (no AI source bias inference)
- Loaded language, attribution density, and emotional trend are deterministic
- LLM operations are explicit placeholders and clearly separated
- Pipeline output structure follows the agreed data model
