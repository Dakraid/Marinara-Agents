/**
 * What the local model slots are expected to cost on a GPU, and whether that fits.
 *
 * "Supported" is a property of a model and a machine together, not of the machine
 * alone, so the verdict function takes the slots the user has configured and the
 * device they land on. The same code answers "can I add this model" for a preflight
 * and "is what I already run too heavy" for support diagnostics, which is why it
 * lives in shared types rather than inside either caller.
 *
 * Every number here is an estimate and the UI says so. The launch-time recheck and
 * the load-failure attribution are the backstop.
 */
/** Headroom below which a fit is reported as tight rather than recommended. */
export const SIDECAR_FOOTPRINT_HEADROOM_BYTES = 1_500_000_000;
//# sourceMappingURL=sidecar-footprint.js.map