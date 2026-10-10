# NOTE — Card Editor 1.7.1 duplicate-name affixes completion (tasks #297/#298)

From coordinator, 2026-10-10. SPEC: 2026-10-10_20-08; ARCH: 2026-10-10_20-09; DESIGN bible §2.

## Marinara-Agents (commit `b4a8548a`, pushed to `customized`; includes prior docs commit `4c3a4eb4`)

**T1 (backend)**
- `schema.ts`: `duplicateSuffix` optional (no `" (Edited)"` injection in `normalizeSessionConfig`); new optional `duplicateRemovePrefix`/`duplicateRemoveSuffix`; all four via `optionalAffix(..., preserve=true)`; `isStoredConfig` undefined-safe parity.
- `text.ts`: `DuplicateNameAffixes` + `computeDuplicateName` — case-insensitive strip-once via lowercased edge compare with original-casing splice, post-strip trim, empty-after-strip → pre-strip base, both append affixes apply; blank affix strings treated as absent (defense in depth).
- `apply.ts`: `ApplyOperation.duplicateThenPatch` carries `namePrefix?/nameSuffix?/stripNamePrefix?/stripNameSuffix?`; `planApply` emits exactly the affixes present (prefix-wins selection deleted); `planDuplicateApplied` forwards all four conditionally.
- `routes.ts`/`runner.ts`: conditional spreads for the now-optional fields (verdict route + queue-drain).
- `apply-ops.ts` `executeOp`: `data.name = computeDuplicateName(baseName, …)`; base `(" (Copy)"` strip) unchanged.

**T2 (frontend)**
- `BulkDispatchDialog.tsx`: `duplicateSuffix` seed `stored ?? " (Edited)"`; remove fields seed `stored ?? ""`; dispatch config trim-gated conditional spreads (verbatim values); approved stacked layout (prefix, suffix, dashed `ce-divider-caption` "Remove from name", remove prefix, remove suffix) + live `Copy name:` preview from `targets[0]`.
- `styles.ts`: `.ce-divider-caption` (dashed top border caption).
- Locales (source UI catalog): `duplicatePrefixHint` + `saving.caption` de-prefix-winsed; `duplicateSuffix(+Placeholder)`, `duplicateRemoveGroup`, `duplicateRemovePrefix/Suffix(+Placeholder)`, `duplicateNamePreview` ("Copy name: {{name}}"). Metadata catalog sync = zero diff.
- Tests: dialog-ui AC4 ordered-marker suite (order/seed/omit/preview, no "wins over"); panel-ui fixture materializes legacy `" (Edited)"` (intent: session-suffix rename).

**Release 1.7.1**: three pins together — `manifest.json`, `build-feature-packages.mjs` feature version, `card-editor-routing.regression.mjs` assert; CHANGELOG entry dated 2026-10-10; bundles + `artifacts/card-editor-1.7.1.zip` rebuilt via `build-feature-packages.mjs card-editor`; catalog lanes/notes regenerated. Stray `artifacts/card-editor-1.7.1.zip2` builder temp removed.

## Gates (fresh, coordinator-run)
- `npm run check`: 0 errors (warnings pre-existing repo-wide).
- `test-catalog-lanes` / `validate-package-locales` / `validate-catalog` (42=42 lanes) / `catalog-release-notes.regression`: all pass.
- Card-editor regressions: routing, bulk, runner, dialog-ui, panel-ui, prompt-presets — all pass.
- `code_verify`: WARN only from lexical orphans inside regenerated minified bundles (expected generated-output noise); 0 LSP diagnostics.
- Bundle smoke: `grep -c "duplicate-applied" client.js` = 2; `server.mjs` carries `stripNamePrefix/Suffix`; `client.js` carries preview/affix markers.

## Notes
- No engine work (per SPEC non-goals); engine `customized` untouched this release.
- AC1–AC7 all covered; AC5 legacy round-trip pinned in bulk regression.
