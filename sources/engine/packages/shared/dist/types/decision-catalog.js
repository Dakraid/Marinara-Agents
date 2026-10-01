/** Which installer and launcher run an entry. A new kind is a real new runtime. */
export const DECISION_RUNTIME_KINDS = ["open_jev_torch"];
/**
 * Artifact types a published checkpoint can declare, mapped to the runtime that can
 * load it.
 *
 * This is what makes a pasted repository safe to consider: Open-Jev's checkpoints ship
 * a `release-manifest.json` naming their `artifact_type`, their base model and its
 * pinned revision, so compatibility is read rather than assumed. A type that is not in
 * this table has no runtime here and is refused by name.
 */
export const DECISION_ARTIFACT_RUNTIMES = {
    qwen_lora_adapter_plus_scalar_decision_head: "open_jev_torch",
};
/**
 * The runtime that can load this artifact type, or null.
 *
 * Deliberately not a bare index. `DECISION_ARTIFACT_RUNTIMES["constructor"]` returns
 * a function from `Object.prototype`, and every member of it is truthy, so a manifest
 * declaring `"constructor"` or `"toString"` would otherwise pass the one check that
 * decides whether a pasted repository is installable at all.
 */
export function runtimeForArtifactType(artifactType) {
    return Object.hasOwn(DECISION_ARTIFACT_RUNTIMES, artifactType) ? DECISION_ARTIFACT_RUNTIMES[artifactType] : null;
}
/** The same guard for the runtime table, for exactly the same reason. */
export function decisionRuntimeDefaults(runtime) {
    return Object.hasOwn(DECISION_RUNTIME_DEFAULTS, runtime)
        ? DECISION_RUNTIME_DEFAULTS[runtime]
        : null;
}
/**
 * Is this a HuggingFace repository id and nothing else?
 *
 * Load bearing rather than cosmetic. A pasted id is interpolated into hub URLs, and a
 * segment of dots survives a naive character-class check while collapsing the path:
 * `../name` resolves `…/api/models/../name/tree/x` to `…/api/name/tree/x`, which is a
 * different endpoint than the one this code believes it is calling.
 */
export function isSafeRepoId(value) {
    const segments = value.split("/");
    if (segments.length !== 2)
        return false;
    return segments.every((segment) => /^[A-Za-z0-9._-]+$/u.test(segment) && /[A-Za-z0-9]/u.test(segment) && !/^\.+$/u.test(segment));
}
/**
 * Is this a git ref this code is willing to put in a URL?
 *
 * Either an exact commit or a plain branch or tag name. No dot-only segments, no
 * leading dash, nothing that needs escaping.
 */
export function isSafeGitRef(value) {
    if (/^[0-9a-f]{40}$/u.test(value))
        return true;
    if (value.length > 100 || value.startsWith("-"))
        return false;
    return value.split("/").every((segment) => /^[A-Za-z0-9._-]+$/u.test(segment) && !/^\.+$/u.test(segment));
}
/**
 * Curated entries, shipped with releases. Each one is a reviewed, pinned change.
 *
 * A model reached by pasting its repository is handled separately and is not listed
 * here: it is checked against `DECISION_ARTIFACT_RUNTIMES` at the moment it is pasted.
 */
export const SIDECAR_DECISION_MODELS = [
    {
        id: "open-jev-2b",
        label: "Open-Jev 2B",
        description: "An independent research model that answers yes/no questions without writing a reply. Faster and a little smaller than a general local model, but less accurate on roleplay.",
        runtime: "open_jev_torch",
        artifacts: [
            { repoId: "ZefanCai/Open-Jev-2B", revision: "0c7aa498b1627be8da4acf34c863ff0ee0a92785", paths: ["package/"] },
            { repoId: "Qwen/Qwen3.5-2B", revision: "15852e8c16360a2fea060d615a32b45270f8a8fc" },
        ],
        // 12 MB checkpoint plus 4,548,221,488 bytes of base weights, both measured from
        // the pinned revisions and verified by sha256 after download.
        downloadSizeBytes: 4_560_000_000,
        // Weights on disk plus the runtime's own Python environment, which measured 5.4 GB.
        diskBytes: 10_000_000_000,
        // Measured at 4576 MiB peak while serving at max-length 4096.
        vramBytes: 4_798_283_776,
        maxLengthTokens: 4096,
        // Not 1: `candidate_batches` treats this as a per-forward-pass sequence limit, so
        // 1 serialises every question in a group instead of answering them together.
        batchSize: 8,
        platforms: [{ os: "linux", arch: "x64", gpuVendor: "nvidia", minDriver: "580" }],
        minComputeCapability: "7.5",
        // Measured, not assumed. On eight roleplay turns this model answered yes between
        // 0.15 and 0.59 and no between 0.009 and 0.026, so the documented 0.5 would skip
        // every relevant turn. Any threshold from roughly 0.03 to 0.15 classified all
        // eight correctly; 0.1 sits in the middle of that band.
        calibration: { defaultThreshold: 0.1, questionShape: "task_object" },
        // Measured through the engine on the longest chat it sends: 24 statements took
        // 5.9 s and 32 took 7.9 s, and a Choice option costs the same as a statement. With
        // the flat 4 s budget both got no answers at all, so every statement read as no.
        // A scene at the model's own full length (3,479 tokens) costs 0.33 s a statement,
        // hence 350 rather than the 250 an English chat needs.
        perQuestionMs: 350,
        // Read from the LICENSE file at each pinned revision. Qwen3.5-2B is Apache-2.0 there.
        licenses: ["MIT (source)", "Apache-2.0 (adapter)", "Apache-2.0 (base weights)"],
        thirdParty: true,
    },
    {
        id: "open-jev-9b",
        label: "Open-Jev 9B",
        description: "The larger Open-Jev: more accurate than 2B in our tests, but it needs about 22 GB of GPU memory, so on a 24 GB card nothing else fits beside it, and it takes about a second per question.",
        runtime: "open_jev_torch",
        artifacts: [
            { repoId: "ZefanCai/Open-Jev-9B", revision: "47e966881e489511c0c7f5633a9e1960a676a551", paths: ["package/"] },
            { repoId: "Qwen/Qwen3.5-9B", revision: "c202236235762e1c871ad0ccb60c8ee5ba337b9a" },
        ],
        // 25,588,410 bytes of checkpoint plus 19,329,393,661 bytes of base weights, from
        // the pinned revisions.
        downloadSizeBytes: 19_354_982_071,
        // Measured after a real install on 2026-09-23: weights plus the runtime
        // environment, with uv's cache already pruned (25,274,581,531 bytes).
        diskBytes: 25_300_000_000,
        // Measured at 22,492 MiB peak serving a full batch of eight near max-length 4096.
        vramBytes: 23_584_571_392,
        maxLengthTokens: 4096,
        batchSize: 8,
        platforms: [{ os: "linux", arch: "x64", gpuVendor: "nvidia", minDriver: "580" }],
        minComputeCapability: "7.5",
        // Measured, like 2B. On the eight roleplay turns (object-shaped question) it
        // answered yes between 0.135 and 0.79 and no at 0.019 or below, and it scored 31
        // of 32 recommended-statement turns at 0.1. Any threshold from about 0.02 to 0.13
        // separates the roleplay set; 0.1 matches 2B's operating point.
        calibration: { defaultThreshold: 0.1, questionShape: "task_object" },
        // About 1.0 s for one question on a short scene, 3.35 s for four and 6.6 s for
        // eight: the prefix cache stays off, so each question re-reads the scene.
        perQuestionMs: 800,
        licenses: ["MIT (source)", "Apache-2.0 (adapter)", "Apache-2.0 (base weights)"],
        thirdParty: true,
    },
];
/**
 * What a runtime kind imposes on anything it loads.
 *
 * A pasted checkpoint declares which runtime can load it but not what that runtime
 * costs, so these come from the runtime rather than from the repository. A model's
 * own manifest is not allowed to claim a lower driver floor or a wider GPU range than
 * the wheels actually support.
 */
export const DECISION_RUNTIME_DEFAULTS = {
    open_jev_torch: {
        maxLengthTokens: 4096,
        batchSize: 8,
        platforms: [{ os: "linux", arch: "x64", gpuVendor: "nvidia", minDriver: "580" }],
        minComputeCapability: "7.5",
        calibration: { defaultThreshold: 0.1, questionShape: "task_object" },
    },
};
/**
 * Judge a pasted checkpoint by what it declares about itself.
 *
 * This is the whole safety gate for a bring-your-own model: compatibility is read from
 * the repository's own manifest and matched against a runtime this engine ships,
 * rather than assumed from a name. Anything it cannot vouch for is refused by reason,
 * never installed hopefully.
 */
export function readDecisionManifest(manifest) {
    if (!manifest || typeof manifest !== "object")
        return { refusal: "unreadable_manifest" };
    const declared = typeof manifest.artifact_type === "string" ? manifest.artifact_type : "";
    const runtime = runtimeForArtifactType(declared);
    if (!runtime)
        return { refusal: "unknown_artifact_type" };
    const baseModel = typeof manifest.base_model === "string" ? manifest.base_model.trim() : "";
    // The manifest is third-party text and this id goes into a URL, so it gets the same
    // check a pasted one does rather than a looser shape test.
    if (!isSafeRepoId(baseModel))
        return { refusal: "missing_base_model" };
    const baseRevision = typeof manifest.base_revision === "string" ? manifest.base_revision.trim() : "";
    // A branch name would let the weights change under a pinned adapter.
    if (!/^[0-9a-f]{40}$/u.test(baseRevision))
        return { refusal: "unpinned_base_revision" };
    // A package that ships its own base weights is a different install shape: this
    // downloader fetches the checkpoint and then the base model the manifest names, so
    // it would pull weights the package already contains.
    if (manifest.base_weights_included === true)
        return { refusal: "base_weights_included" };
    return { runtime, baseModel, baseRevision };
}
export function findDecisionModel(id) {
    return SIDECAR_DECISION_MODELS.find((model) => model.id === id) ?? null;
}
export const DECISION_SIDECAR_SETTINGS_KEY = "decision-sidecar";
export const DECISION_SIDECAR_DEFAULT_SETTINGS = {
    enabled: false,
    modelId: null,
    customModel: null,
    startPolicy: "on_demand",
    confirmedAt: null,
    confirmedVerdict: null,
    cudaDevice: null,
};
/** A plausible CUDA device index. Whether that card exists is the preflight's call. */
export function isCudaDeviceIndex(value) {
    return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 64;
}
/** Accept a stored custom entry only if its runtime and floors still make sense. */
export function sanitizeCustomDecisionModel(value) {
    if (!value || typeof value !== "object")
        return null;
    const model = value;
    const defaults = decisionRuntimeDefaults(model.runtime);
    if (!defaults)
        return null;
    if (!Array.isArray(model.artifacts) || model.artifacts.length === 0)
        return null;
    // Each element is checked for shape before any field is read. A null element used
    // to throw, and the settings parser's catch then reset the whole record, losing
    // `enabled`, the start policy and the consent record over one bad entry.
    const artifactOk = (artifact) => {
        if (!artifact || typeof artifact !== "object")
            return false;
        const entry = artifact;
        if (typeof entry.revision !== "string" || !/^[0-9a-f]{40}$/u.test(entry.revision))
            return false;
        if (typeof entry.repoId !== "string" || !isSafeRepoId(entry.repoId))
            return false;
        // The downloader calls `startsWith` on every prefix.
        return (entry.paths === undefined ||
            (Array.isArray(entry.paths) && entry.paths.every((prefix) => typeof prefix === "string")));
    };
    if (!model.artifacts.every(artifactOk))
        return null;
    // Both reach the installer dialog as text.
    if (!Array.isArray(model.licenses) || !model.licenses.every((license) => typeof license === "string"))
        return null;
    if (typeof model.description !== "string")
        return null;
    // An entry with no name or a nonsense size would reach the panel and the preflight,
    // where it would render blank and be judged against zero bytes.
    if (typeof model.id !== "string" || !model.id.trim())
        return null;
    if (typeof model.label !== "string" || !model.label.trim())
        return null;
    const positive = (value) => typeof value === "number" && Number.isFinite(value) && value > 0;
    if (!positive(model.vramBytes) || !positive(model.diskBytes) || !positive(model.downloadSizeBytes))
        return null;
    // The runtime's own constraints always win over whatever was stored, and a measured
    // per-question cost belongs to curated entries only: a stored value could otherwise
    // stretch every request's budget.
    const { perQuestionMs: _unmeasured, ...rest } = model;
    return { ...rest, ...defaults };
}
export function parseDecisionSidecarSettings(raw) {
    if (!raw)
        return { ...DECISION_SIDECAR_DEFAULT_SETTINGS };
    try {
        const parsed = JSON.parse(raw);
        return {
            enabled: parsed.enabled === true,
            modelId: typeof parsed.modelId === "string" && findDecisionModel(parsed.modelId) ? parsed.modelId : null,
            // Re-validated on read: a hand-edited entry must not be able to describe a
            // runtime this engine does not ship or claim a weaker hardware floor.
            customModel: sanitizeCustomDecisionModel(parsed.customModel),
            startPolicy: parsed.startPolicy === "with_marinara" ? "with_marinara" : "on_demand",
            confirmedAt: typeof parsed.confirmedAt === "string" ? parsed.confirmedAt : null,
            confirmedVerdict: typeof parsed.confirmedVerdict === "string" ? parsed.confirmedVerdict : null,
            cudaDevice: isCudaDeviceIndex(parsed.cudaDevice) ? parsed.cudaDevice : null,
        };
    }
    catch {
        // A hand-edited or truncated value must not enable a download.
        return { ...DECISION_SIDECAR_DEFAULT_SETTINGS };
    }
}
//# sourceMappingURL=decision-catalog.js.map