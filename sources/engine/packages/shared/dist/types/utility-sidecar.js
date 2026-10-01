/**
 * A second, independent local model slot.
 *
 * The existing sidecar holds exactly one model and is wired to generation, scene
 * analysis and tracker agents. Some agents want a small purpose-trained model of
 * their own — an extractor, say — and installing that into the main slot would
 * displace whatever the operator is already running there.
 *
 * So this is a parallel slot: its own config file, its own model directory, its own
 * llama-server process on its own port. It reuses the installed llama.cpp runtime
 * read-only and shares nothing else. Nothing here reads or writes the main sidecar's
 * configuration, model files, process or connections.
 */
/** Bounds the UI and the route both enforce, so a bad number cannot reach llama-server. */
export const UTILITY_SIDECAR_LIMITS = {
    contextSize: { min: 512, max: 131072 },
    gpuLayers: { min: -1, max: 999 },
    maxParallelJobs: { min: 1, max: 8 },
};
export const UTILITY_SIDECAR_DEFAULT_CONFIG = {
    models: {},
    activeModelId: null,
    // The extractor's prompts and prose fit comfortably in 8k; larger just costs memory.
    contextSize: 8192,
    // Max GPU offload, falling back to CPU if that start fails. These are small
    // purpose-trained models — an 0.8B extractor is under a gigabyte of VRAM — so the
    // GPU is both the right place for them and the cheaper one: on CPU they are slow
    // *and* they spend system RAM the machine is more likely to be short of.
    gpuLayers: -1,
    maxParallelJobs: 1,
    decisionThinking: "auto",
};
//# sourceMappingURL=utility-sidecar.js.map