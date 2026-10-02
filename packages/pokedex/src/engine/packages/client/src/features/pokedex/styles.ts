export const POKEDEX_STYLES = `
.pd-shell {
  --pd-chroma: var(--marinara-chat-chrome-accent, var(--foreground));
  --accent: var(--marinara-chat-chrome-highlight-bg);
  --accent-foreground: var(--marinara-chat-chrome-highlight-text);
  --background: var(--marinara-chat-chrome-panel-bg);
  --border: var(--marinara-chat-chrome-panel-border);
  --card: var(--marinara-chat-chrome-panel-bg);
  --foreground: var(--marinara-chat-chrome-panel-text);
  --input: var(--marinara-chat-chrome-input-border);
  --muted: var(--marinara-chat-chrome-highlight-bg);
  --muted-foreground: var(--marinara-chat-chrome-panel-muted);
  --popover: var(--marinara-chat-chrome-panel-bg);
  --popover-foreground: var(--marinara-chat-chrome-panel-text);
  --primary: var(--marinara-chat-chrome-highlight-text);
  --primary-foreground: var(--marinara-chat-chrome-panel-bg);
  --ring: var(--marinara-chat-chrome-focus-ring);
  --secondary: var(--marinara-chat-chrome-highlight-bg);
  color: var(--marinara-chat-chrome-panel-text);
  font: inherit;
}

.pd-panel {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--card);
  padding: 0.75rem;
}

.pd-stack {
  display: grid;
  gap: 0.65rem;
}

.pd-field {
  box-sizing: border-box;
  width: 100%;
  padding: 0.5rem 0.625rem;
  font: inherit;
  font-size: 0.75rem;
}

.pd-number-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--muted-foreground);
}

.pd-number-copy {
  display: grid;
  min-width: 0;
  gap: 0.125rem;
}

.pd-number-copy strong {
  color: var(--foreground);
  font-size: 0.625rem;
  font-weight: 500;
}

.pd-number-copy small {
  color: var(--muted-foreground);
  font-size: 0.59375rem;
  line-height: 1.35;
}

.pd-number-input {
  height: 2.25rem;
  min-height: 2.25rem;
  font-variant-numeric: tabular-nums;
}

.pd-check {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--muted-foreground);
  font-size: 0.625rem;
}

.pd-check input[type="checkbox"] {
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
  margin: 0.125rem 0 0;
  accent-color: var(--pd-chroma);
  cursor: pointer;
}

.pd-check input[type="checkbox"]:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}

.pd-check input[type="checkbox"]:disabled {
  cursor: default;
  opacity: 0.4;
}

.pd-check-copy {
  display: grid;
  min-width: 0;
  gap: 0.125rem;
}

.pd-check-copy strong {
  color: var(--foreground);
  font-weight: 500;
}

.pd-check-copy small {
  font-size: 0.59375rem;
  line-height: 1.35;
}

.pd-status {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--muted);
  padding: 0.5rem 0.6rem;
  font-size: 0.7rem;
}

.pd-status--error {
  justify-content: space-between;
}

.pd-icon {
  width: 0.75rem;
  height: 0.75rem;
  flex: none;
}

.pd-spin {
  animation: pd-spin 0.8s linear infinite;
}

.pd-toolbar {
  display: inline-flex;
  flex: none;
}

.pd-toolbar-button {
  position: relative;
  box-sizing: border-box;
  flex: none;
  overflow: visible;
}

.pd-toolbar-button--fallback {
  width: 2rem;
  min-width: 2rem;
  height: 2rem;
  padding: 0.25rem;
}

.pd-toolbar-label {
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  color: inherit;
  font-size: 0.375rem;
  font-weight: 600;
  line-height: 0.5rem;
  letter-spacing: -0.02em;
  text-align: center;
  white-space: nowrap;
}

.pd-toolbar-badge {
  position: absolute;
  top: -0.3125rem;
  right: -0.3125rem;
  display: flex;
  min-width: 0.8125rem;
  height: 0.8125rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--marinara-chat-chrome-panel-bg, transparent);
  border-radius: 999px;
  background: var(--marinara-chat-chrome-button-bg-active, var(--muted));
  padding: 0 0.1875rem;
  color: var(--marinara-chat-chrome-button-text-active, var(--foreground));
  font-size: 0.5rem;
  font-weight: 700;
  line-height: 1;
  pointer-events: none;
}

.pd-toolbar-button--pulse {
  animation: pd-toolbar-pulse 0.9s ease-out 3;
}

.pd-tracker {
  position: relative;
  z-index: 10;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
  background: var(--tracker-panel-section-background, color-mix(in srgb, var(--card) 5%, transparent));
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--foreground) 5%, transparent);
}

.pd-tracker-veil {
  position: absolute;
  z-index: 0;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--background) var(--tracker-profile-contrast-strong-top, 40%), transparent) 0%,
    color-mix(in srgb, var(--card) var(--tracker-profile-contrast-strong-mid, 30%), transparent) 52%,
    color-mix(in srgb, var(--background) var(--tracker-profile-contrast-strong-bottom, 42%), transparent) 100%
  );
}

.pd-tracker-content {
  position: relative;
  z-index: 10;
}

.pd-tracker-header {
  display: flex;
  min-height: 1.75rem;
  align-items: center;
  border-bottom: 1px solid color-mix(in srgb, var(--border) 42%, transparent);
  padding: 0.125rem 0.25rem;
}

.pd-tracker-toggle {
  box-sizing: border-box;
  display: flex;
  min-width: 0;
  width: 100%;
  flex: 1;
  align-self: stretch;
  align-items: center;
  gap: 0.25rem;
  border: 0;
  border-radius: 0.125rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.pd-tracker-toggle:hover {
  background: color-mix(in srgb, var(--accent) 18%, transparent);
}

.pd-tracker-toggle:focus-visible {
  outline: 1px solid var(--border);
  outline-offset: -1px;
}

.pd-tracker-chevron-frame {
  display: flex;
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
  align-items: center;
  justify-content: center;
}

.pd-tracker-chevron {
  width: 0.6875rem;
  height: 0.6875rem;
  flex: none;
  color: var(--tracker-profile-icon, var(--muted-foreground));
  opacity: 0.6;
  transition: transform 150ms ease;
}

.pd-tracker-chevron--collapsed {
  transform: rotate(-90deg);
}

.pd-tracker-icon {
  display: flex;
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
  align-items: center;
  justify-content: center;
  color: var(--tracker-profile-icon, var(--muted-foreground));
  opacity: 0.75;
}

.pd-tracker-panel-icon {
  width: 0.6875rem;
  height: 0.6875rem;
}

.pd-tracker-title {
  min-width: 0;
  overflow: hidden;
  color: color-mix(in srgb, var(--foreground) 62%, transparent);
  font-size: 0.625rem;
  font-weight: 600;
  line-height: 0.75rem;
  letter-spacing: 0.08em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.pd-tracker-count {
  flex: none;
  margin-left: auto;
  color: color-mix(in srgb, var(--foreground) 40%, transparent);
  font-size: 0.5625rem;
  font-weight: 500;
  line-height: 0.75rem;
  white-space: nowrap;
}

.pd-tracker-body {
  display: grid;
  gap: 0.5rem;
  padding: 0.5rem;
}

.pd-section {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.pd-section-heading {
  margin: 0;
  color: color-mix(in srgb, var(--foreground) 55%, transparent);
  font-size: 0.5625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 0.75rem;
  text-transform: uppercase;
}

.pd-tree {
  display: grid;
  margin: 0;
  padding: 0;
  gap: 0.45rem;
  list-style: none;
}

.pd-tree-member {
  display: grid;
  gap: 0.125rem;
}

.pd-tree-row {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
}

.pd-tree-name {
  min-width: 0;
  overflow: hidden;
  color: color-mix(in srgb, var(--foreground) 85%, transparent);
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pd-tree-sub {
  padding-left: 0.75rem;
  color: color-mix(in srgb, var(--foreground) 62%, transparent);
  font-size: 0.625rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.pd-tree-detail {
  flex: none;
  color: color-mix(in srgb, var(--foreground) 45%, transparent);
  font-size: 0.59375rem;
  line-height: 1.3;
  white-space: nowrap;
}

.pd-action {
  flex: none;
  font-size: 0.5625rem;
}

.pd-empty {
  margin: 0;
  padding: 0.125rem 0;
  color: color-mix(in srgb, var(--foreground) 35%, transparent);
  font-size: 0.625rem;
  font-style: italic;
  line-height: 1.4;
}

.pd-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: 0.5rem;
}

.pd-card-frame {
  position: relative;
  min-width: 0;
}

.pd-card {
  overflow-wrap: anywhere;
}

.pd-card-actions {
  position: absolute;
  top: 0.375rem;
  right: 0.375rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 150ms ease;
}

.pd-card-frame:hover .pd-card-actions,
.pd-card-frame:focus-within .pd-card-actions {
  opacity: 1;
}

.pd-icon-button {
  width: 1.5rem;
  min-width: 1.5rem;
  height: 1.5rem;
  min-height: 1.5rem;
  padding: 0;
  background: color-mix(in srgb, var(--popover, #111114) 82%, transparent);
}

.pd-tracker--mobile-compact {
  border-bottom: 0;
  background: transparent;
  box-shadow: none;
}

.pd-tracker--mobile-compact .pd-tracker-header {
  min-height: 0;
  border-bottom: 0;
  padding: 0.5rem 0.75rem 0.25rem;
}

.pd-tracker--mobile-compact .pd-tracker-toggle--static {
  align-self: auto;
  cursor: default;
}

.pd-tracker--mobile-compact .pd-tracker-toggle--static:hover {
  background: transparent;
}

.pd-tracker--mobile-compact .pd-tracker-icon {
  color: var(--marinara-chat-chrome-button-text-active, var(--pd-chroma));
  opacity: 1;
}

.pd-tracker--mobile-compact .pd-tracker-body {
  padding: 0.25rem 0.75rem 0.5rem;
}

@media (hover: none) {
  .pd-card-actions {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pd-toolbar-button--pulse {
    animation: none;
  }

  .pd-tracker-chevron,
  .pd-card-actions {
    transition: none;
  }
}

@keyframes pd-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pd-toolbar-pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--pd-chroma) 55%, transparent);
  }

  70% {
    box-shadow: 0 0 0 0.375rem transparent;
  }

  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}
`;
