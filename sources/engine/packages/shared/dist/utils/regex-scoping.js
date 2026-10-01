/** An explicit chat choice wins; unset/cleared overrides inherit the preset. */
export function resolveScopedRegexMode(override, presetDefault) {
    for (const value of [override, presetDefault]) {
        if (value === "disabled" || value === "exclusive" || value === "chat")
            return value;
    }
    return "disabled";
}
//# sourceMappingURL=regex-scoping.js.map