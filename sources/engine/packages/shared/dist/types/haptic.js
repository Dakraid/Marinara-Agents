// ──────────────────────────────────────────────
// Types: Haptic Feedback (Buttplug.io)
// ──────────────────────────────────────────────
/** Normalize model- and user-authored action names to protocol-backed actions. */
export function normalizeHapticAction(value) {
    if (typeof value !== "string")
        return null;
    const key = value
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
    if (key === "positionwithduration" ||
        key === "hwpositionwithduration" ||
        key === "linear" ||
        key === "stroke" ||
        key === "stroker" ||
        key === "thrust" ||
        key === "thrusting" ||
        key === "pump" ||
        key === "pumping")
        return "position";
    if (key === "vibrate" || key === "vibration" || key === "vibrating")
        return "vibrate";
    if (key === "rotate" || key === "rotation" || key === "spin" || key === "spinning")
        return "rotate";
    if (key === "oscillate" || key === "oscillation" || key === "oscillating")
        return "oscillate";
    if (key === "constrict" || key === "constriction" || key === "squeeze" || key === "squeezing")
        return "constrict";
    if (key === "inflate" || key === "inflation" || key === "airpump")
        return "inflate";
    if (key === "position")
        return "position";
    if (key === "temperature" || key === "temp" || key === "heat" || key === "heating")
        return "temperature";
    if (key === "spray" || key === "dispense" || key === "dispensing")
        return "spray";
    if (key === "led" || key === "light" || key === "lighting")
        return "led";
    if (key === "stop")
        return "stop";
    return null;
}
/** Normalize optional named patterns used by automatic and inline commands. */
export function normalizeHapticPattern(value) {
    if (typeof value !== "string")
        return undefined;
    const key = value
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
    if (key === "steady")
        return "steady";
    if (key === "tap" || key === "tapping")
        return "tap";
    if (key === "pulse" || key === "pulsing")
        return "pulse";
    if (key === "wave" || key === "waves")
        return "wave";
    if (key === "ramp" || key === "ramping")
        return "ramp";
    if (key === "impact")
        return "impact";
    return undefined;
}
//# sourceMappingURL=haptic.js.map