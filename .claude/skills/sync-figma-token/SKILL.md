---
name: sync-figma-token
description: "Syncs design tokens between code and Figma variables with drift detection. Use when user says '토큰 동기화', 'drift 체크', '변수 비교', 'token sync'. For naming issues use cds-naming-enforcer, for property issues use cds-property-optimizer."
---

# sync-figma-token

Use this skill for token parity workflows (code tokens vs Figma variables).

**MANDATORY prerequisite**: load `figma-use` before every `use_figma` call.

## CDS-Specific Configuration

- **CDS fileKey**: `H36eNEd6o7ZTv4R7VcyLf2`
- **Direction default**: `code_to_figma`
- **deletePolicy**: `archive_only`
- **conflictPolicy**: `manual_review`

## Non-negotiable safety rule

After producing dry-run output, you MUST STOP and ask for approval.

- Do NOT run any write `use_figma` calls in the same turn as dry-run output.
- Ask a normal confirmation question (example: "Apply these changes? (yes/no)").
- Only proceed on explicit affirmative approval.

## Standard source formats (required)

Prefer real token sources in this order:
1. Design Tokens JSON (`tokens.json`, `tokens/*.json`, DTCG-style)
2. Style Dictionary input JSON
3. Platform theme sources (Compose/Kotlin/TS) only when JSON source is unavailable

## Normalization rules

Normalize both sides to canonical rows:
- `key` (canonical token name)
- `type` (`COLOR`, `FLOAT`, `STRING`, `BOOLEAN`)
- `modeValues` (light/dark/etc.)
- `aliasTarget`
- `scopes`
- `codeSyntax`

## Value validation (required)

- COLOR: compare RGBA with tolerance `epsilon = 0.0001`
- FLOAT: strict numeric comparison
- STRING/BOOLEAN: strict equality
- Aliases: compare canonical alias targets

## Drift categories

Each drift item must include one of:
- `missing_in_figma`
- `missing_in_code`
- `value_mismatch`
- `alias_mismatch`
- `type_mismatch`
- `mode_mismatch`
- `scope_mismatch`
- `code_syntax_mismatch`
- `broken_alias`

## Dry-run output format

1) Headline summary:
```json
{ "create": 0, "update": 0, "aliasFix": 0, "scopeFix": 0, "syntaxFix": 0, "archive": 0, "delete": 0 }
```

2) Detailed drift list with token keys and before/after values.

Then ask: `Dry-run complete. Apply these changes? (yes/no)`

## Apply order

1. Ensure collections/modes
2. Create missing primitives
3. Create/update semantic aliases
4. Apply value updates
5. Apply scopes and code syntax
6. Archive stale tokens per `deletePolicy`

Never parallelize write `use_figma` calls.

## Success condition

After apply, run a fresh diff.
Success = unresolved drift is zero, or only explicitly approved exceptions remain.
