# Card Editor Next: transform task, splits, phases, schemas, avatar studio

Status: in progress on `feat/card-editor-next` (Marinara-Agents) plus `feat/structured-output` (Marinara Engine).
Origin: the SillyTavern "Bulk Card Combine" wizard (fork branch `testing`, `public/scripts/bulk-combine/**`). It was used as orientation, not ported page by page.
Approved plan and mockups: https://claude.ai/artifact/NwvjmgWjkA6ZLbCE8ToypG

## Maintainer decisions (2026-10-20)

1. **The original card is never modified by a split.** This holds in every save mode, including in-place ("confirm"/"auto") runs. Each split character becomes a new card.
2. **Default output mode is `structured`.** The model returns schema-shaped JSON and Marinara renders Markdown, XML or JSON. The legacy method, where the model writes the document text itself, remains available as `outputMode: "document"`.
3. **The schema studio is new.** It has a text editor and a visual builder and does not reuse an existing Engine component.
4. **The Engine single-card panel (`CardEditorProposalPanel`) stays a field-diff editor.** Every new feature lives in the package workspace.

## Ownership

| Piece | Repo |
|---|---|
| Transform task, schemas, splits, lineage, phases, batching, prompts, UI (workspace, split review, schema studio, avatar studio) | Marinara-Agents `packages/card-editor` |
| Structured output: connection capability, tier resolver, `languageModels` handle `structuredOutput` + `structured` option, per-agent switch, provider mapping | Marinara Engine |

The package works on older Engines. `structured` is an optional chatComplete option, and an older host ignores it and leaves the prompt-only path.

## Transform task (`presetId: "transform"`)

The config lives in `config.transform` (`TransformConfig`, in `shared/.../card-editor/schema.ts`). The schema is snapshotted at dispatch.

- `schema`, `format` (`markdown | xml | json`)
- `outputMode`: `structured` (default) or `document`
- `multiCharacter`: `split` (default) or `merge`
- `structuredOutput`: boolean, default true. Ask the connection for provider-enforced JSON.
- `phase2?`: `{ enabled, instruction, allowSplits, override?: { schema, format } }`

### Response envelope (single and batched)

```json
{"results":[{"sourceId":"<item id>","characters":[{"name":"…","fields":{…}}],"splitReason":null}]}
```

- `sourceId` is the session **item id**, not the character id. Split children and Phase 2 items share their source card's character id.
- A single-card reply without the envelope (top-level `characters`) is accepted.
- Unknown or duplicate entries are dropped. A missing source re-runs individually, as the edit task already does.
- `structured`: `fields` follows the schema's JSON shape. Marinara renders it with `renderCharacterFields` and checks it with `validateSchemaData`. Validation issues are soft and never fail the item.
- `document`: `fields` maps each target card field to its whole document text.
- With structured output on and the connection's tier not `none`, the request carries `structured: { name: "card_editor_results", schema: transformResponseJsonSchema(...) }`. The envelope schema is strict-compatible: every object sets `additionalProperties: false` and requires all its keys.

### Item lifecycle additions

New statuses:

- `awaiting-split`: the source came back as several characters under split mode.
- `split`: the source was split. It is terminal; its children carry on.
- `staged`: a Phase 1 result held as input for Phase 2. It is terminal for its phase.

Transitions:

- `succeeded` → `awaiting-split`
- `succeeded` → `staged`
- `awaiting-split` → `split` (accept)
- `awaiting-split` → `running` (retry as one)
- `awaiting-split` → `rejected` (skip)

New item fields: `phase`, `parentItemId`, `forceSingle`, `characters[]`, `splitReason`, `lineage`, `previousOutput`.

Settling logic is in `runner.ts` (`settleTransformItem`, `finishTransformItem`):

- **Several characters, split allowed, not `forceSingle`:** the item goes to `awaiting-split`. Its batch-mates are not held back.
- **Several characters otherwise:** this covers merge mode, a phase that may not split, and a `forceSingle` reply that split anyway. All characters are rendered onto the one card, with each field's documents joined (JSON becomes one array). A `forceSingle` reply that still split gets an issue note.
- **Phase 2 enabled and this is Phase 1:** the item becomes `staged` and nothing is written.
- **Otherwise:** `updates` are derived from the rendered fields (`transformUpdates`), and the item enters the usual verdict flow.

### Split decision: `POST /sessions/:id/items/:itemId/split {decision, names?}`

- **`accept`:** the source item becomes `split`. One child item per character is inserted right after it, with lineage `{originCharacterId, originName, splitGroupId: <source item id>, splitIndex, splitCount}`. The UI may rename the characters; a renamed structured result is re-rendered so its root tags and headings carry the new name.
- **`retry-single`:** sets `forceSingle`. Only that source re-runs, individually, with `SINGLE_CARD_RULE` added to its prompt.
- **`reject`:** the source is skipped.

### Write-back for split children (`apply.ts` `planApply`)

- A split child always plans `duplicateThenPatch`: copy the source card, then set `name` to the character name, patch the fields, and add `extensions.cardEditor` = lineage plus the session label. Combined save mode is the exception and keeps collecting.
- Name affixes apply only in duplicate save mode.
- Text fields the schema does not target are cleared on the copy, so the copy does not keep the group greeting. The source card keeps everything.

### Phase 2: `POST /sessions/:id/phase2`

- **Allowed when:** the session is not active, every split has been decided, and Phase 2 has not started yet.
- **Inputs:** every `staged` item becomes a queued Phase 2 item, so 30 sources with one 1→4 split give 33 inputs. Lineage is copied, and `previousOutput` holds the Phase 1 field documents.
- **Prompt:** `previousOutput` is sent raw inside `<previous_output format="…">`, never XML-escaped. This fixes the ST entity-soup bug.
- **Instruction:** `phase2.instruction` replaces the global instruction.
- **Splits:** allowed in Phase 2 only with `phase2.allowSplits`.

## Schemas (`shared/.../card-editor/card-schema.ts`)

The text form is the XML template:

| Syntax | Meaning |
|---|---|
| `<!-- hint -->` above an element | Hint for that element |
| A comment before the root | Root hint |
| Attribute value `"a \| b"` | Vocabulary (enum) |
| Attribute value `""` | Freeform |
| Trailing `etc.` in a vocabulary | Open vocabulary: suggestions only, not an enum |
| `max="N"` | Length cap |
| `target="<card field>"` | Card field to render into. Top level only; default description |
| `repeat="true"` | List of entries |

- `parseSchemaText` is DOM-free and reports errors with line numbers. `serializeSchemaText` round-trips with it.
- **Built-ins:** `simple` and `complex`, verbatim from the Engine's `card-xml-transform.ts` forms.
- **User schemas:** package documents of kind `card-schema`. Routes are `GET /schemas`, `PUT /schemas/:id` and `DELETE /schemas/:id`. Built-ins cannot be overwritten.
- **Prompt skeleton:** structured mode always shows the JSON shape. Document mode shows the target format.
- **Rendering:** each top-level node goes to its `target`. A target holding a single plain-text leaf gets raw text; any other group is rendered as a document (XML root tag = the character name in kebab-case when the root is `character-name`).

## Tests

`tests/card-editor-transform.regression.mjs` covers:

- the schema round-trip, parse errors and render output for each format
- the strict JSON Schema
- 30 sources in batches of 5 with one 1→4 split: 6 calls, 33 results, children following their source
- write-back of split children (new card, lineage stamp, cleared group fields)
- retry-as-one
- merge mode
- Phase 2: 33 inputs, 7 calls, raw previous output, lineage carried over
- structured-output pass-through (tier `none` and switch off both fall back to the prompt path)
- document-mode prompt

## Remaining (tracked here as it lands)

- [ ] Workspace UI: enlarged three-region overlay, pipeline rail, lineage tree
- [ ] New run dialog: transform task, schema picker, format, multi-character, Phase 2, structured output
- [ ] Split review
- [ ] Schema studio (builder + text)
- [ ] Avatar studio (compositor port)
- [ ] Engine: "Process with Card Editor" prefill moves to the transform task
- [ ] Changelog, version, catalog rebuild
