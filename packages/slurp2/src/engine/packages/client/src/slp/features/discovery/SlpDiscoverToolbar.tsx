import { Check, Coins, LayoutGrid, List, Tags, UsersRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation as useUiTranslation } from "react-i18next";
import { useSlurpSettings } from "../settings/slp-settings-contract";
import { groupSlurpDiscoveryTags, type SlurpDiscoverLayout, type SlurpDiscoverSort } from "./slp-discovery";
import type { SlurpDiscoveryGender } from "../../base/state/slp-state-types";
import { cn } from "../../../lib/utils";
import { SlpChip, SlpSegment } from "../../modules/chrome/SlpButton";
import { useKeepInViewport } from "../../base/chrome/slp-popover-hooks";

const triggerClass =
  "inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--noodle-divider)] bg-[var(--slurp-surface)] px-3 text-xs font-bold transition-colors hover:border-[var(--noodle-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--noodle-accent)]";

function FilterMenu({
  label,
  icon: Icon,
  active,
  menuId,
  openMenu,
  setOpenMenu,
  children,
}: {
  label: string;
  icon: typeof UsersRound;
  active?: boolean;
  menuId: string;
  openMenu: string | null;
  setOpenMenu: (id: string | null) => void;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const shift = useKeepInViewport(openMenu === menuId, panelRef);
  return (
    <details
      className="group relative"
      open={openMenu === menuId}
      onToggle={(event) => setOpenMenu(event.currentTarget.open ? menuId : openMenu === menuId ? null : openMenu)}
    >
      <summary
        className={cn(
          triggerClass,
          "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
          active && "border-[var(--noodle-accent)] bg-[var(--noodle-accent)]/12 text-[var(--noodle-accent-foreground)]",
        )}
      >
        <Icon size={15} aria-hidden="true" />
        {label}
      </summary>
      <div
        ref={panelRef}
        style={shift ? { transform: `translateX(${shift}px)` } : undefined}
        className="absolute left-0 top-full z-30 mt-2 min-w-64 rounded-xl border border-[var(--noodle-divider)] bg-[var(--slurp-surface-raised,var(--background))] p-3 shadow-[var(--slurp-shadow-modal)]"
      >
        {children}
      </div>
    </details>
  );
}

export function SlurpDiscoverToolbar({
  notSubscribed,
  onNotSubscribedChange,
  genders,
  onGenderToggle,
  minimumPrice,
  maximumPrice,
  onMinimumPriceChange,
  onMaximumPriceChange,
  tags,
  customTags,
  onTagToggle,
  sort,
  onSortChange,
  layout,
  onLayoutChange,
  filteredCount,
  filtersActive,
  onClear,
}: {
  notSubscribed: boolean;
  onNotSubscribedChange: (value: boolean) => void;
  genders: ReadonlySet<SlurpDiscoveryGender>;
  onGenderToggle: (value: SlurpDiscoveryGender) => void;
  minimumPrice: string;
  maximumPrice: string;
  onMinimumPriceChange: (value: string) => void;
  onMaximumPriceChange: (value: string) => void;
  tags: ReadonlySet<string>;
  customTags: readonly string[];
  onTagToggle: (value: string) => void;
  sort: SlurpDiscoverSort;
  onSortChange: (value: SlurpDiscoverSort) => void;
  layout: SlurpDiscoverLayout;
  onLayoutChange: (value: SlurpDiscoverLayout) => void;
  filteredCount: number;
  filtersActive: boolean;
  onClear: () => void;
}) {
  const { t: localizeUi } = useUiTranslation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const tagGroups = groupSlurpDiscoveryTags(useSlurpSettings().data?.discoveryTags);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !(event.target as Element).closest("details")) setOpenMenu(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <div className="space-y-3 border-y border-[var(--noodle-divider)] bg-[linear-gradient(110deg,color-mix(in_srgb,var(--slurp-surface)_96%,transparent),color-mix(in_srgb,var(--noodle-accent)_5%,var(--slurp-surface)))] px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <SlpChip selected={notSubscribed} onClick={() => onNotSubscribedChange(!notSubscribed)}>
          {notSubscribed && <Check size={14} aria-hidden="true" />}
          {localizeUi("ui.slurp.discover.notSubscribed", { defaultValue: "Not subscribed" })}
        </SlpChip>
        <FilterMenu
          label={`${localizeUi("ui.slurp.discover.genderLabel", { defaultValue: "Gender" })}${genders.size ? ` · ${genders.size}` : ""}`}
          icon={UsersRound}
          active={genders.size > 0}
          menuId="gender"
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        >
          <fieldset className="space-y-1">
            <legend className="sr-only">
              {localizeUi("ui.slurp.discover.genderLabel", { defaultValue: "Gender" })}
            </legend>
            {(["female", "male", "other"] as const).map((gender) => (
              <label
                key={gender}
                className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-[var(--accent)]"
              >
                <input
                  type="checkbox"
                  checked={genders.has(gender)}
                  onChange={() => onGenderToggle(gender)}
                  className="accent-[var(--noodle-accent)]"
                />
                {localizeUi(`ui.slurp.discover.gender.${gender}`, { defaultValue: gender })}
              </label>
            ))}
          </fieldset>
        </FilterMenu>
        <FilterMenu
          label={localizeUi("ui.slurp.discover.price", { defaultValue: "Price" })}
          icon={Coins}
          active={Boolean(minimumPrice || maximumPrice)}
          menuId="price"
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-xs font-bold">
              <span>{localizeUi("ui.slurp.discover.minimum", { defaultValue: "Minimum" })}</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={minimumPrice}
                onChange={(event) => onMinimumPriceChange(event.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--noodle-divider)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--noodle-accent)]"
              />
            </label>
            <label className="space-y-1 text-xs font-bold">
              <span>{localizeUi("ui.slurp.discover.maximum", { defaultValue: "Maximum" })}</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={maximumPrice}
                onChange={(event) => onMaximumPriceChange(event.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--noodle-divider)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--noodle-accent)]"
              />
            </label>
          </div>
        </FilterMenu>
        <FilterMenu
          label={`${localizeUi("ui.slurp.discover.tagsLabel", { defaultValue: "Tags" })}${tags.size ? ` · ${tags.size}` : ""}`}
          icon={Tags}
          active={tags.size > 0}
          menuId="tags"
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        >
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {tagGroups.map((group) => (
              <fieldset key={group.id}>
                <legend className="mb-1 text-[11px] font-black uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                  {localizeUi(`ui.slurp.discover.tagGroup.${group.id}`, { defaultValue: group.id })}
                </legend>
                {group.tags.map((tag) => (
                  <label
                    key={tag}
                    className="flex min-h-9 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-[var(--accent)]"
                  >
                    <input
                      type="checkbox"
                      checked={tags.has(tag)}
                      onChange={() => onTagToggle(tag)}
                      className="accent-[var(--noodle-accent)]"
                    />
                    {localizeUi(`ui.slurp.tags.${tag}`, { defaultValue: tag })}
                  </label>
                ))}
              </fieldset>
            ))}
            {customTags.length > 0 && (
              <fieldset>
                <legend className="mb-1 text-[11px] font-black uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                  {localizeUi("ui.slurp.discover.tagGroup.custom", { defaultValue: "Custom" })}
                </legend>
                {customTags.map((tag) => (
                  <label
                    key={tag}
                    className="flex min-h-9 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-[var(--accent)]"
                  >
                    <input
                      type="checkbox"
                      checked={tags.has(tag)}
                      onChange={() => onTagToggle(tag)}
                      className="accent-[var(--noodle-accent)]"
                    />
                    {tag}
                  </label>
                ))}
              </fieldset>
            )}
          </div>
        </FilterMenu>
        <label className="ml-auto flex min-h-10 items-center gap-2 rounded-full border border-[var(--noodle-divider)] bg-[var(--slurp-surface)] px-3 text-xs font-bold">
          <span className="sr-only">{localizeUi("ui.slurp.discover.sortBy", { defaultValue: "Sort by" })}</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SlurpDiscoverSort)}
            className="bg-transparent outline-none"
          >
            {(["recommended", "newest", "liked", "subscribed"] as const).map((value) => (
              <option key={value} value={value}>
                {localizeUi(`ui.slurp.discover.sort.${value}`, { defaultValue: value })}
              </option>
            ))}
          </select>
        </label>
        <SlpSegment
          label={localizeUi("ui.slurp.discover.view", { defaultValue: "Creator view" })}
          value={layout}
          onChange={onLayoutChange}
          options={(["grid", "list"] as const).map((value) => {
            const Icon = value === "grid" ? LayoutGrid : List;
            return {
              value,
              label: localizeUi(`ui.slurp.discover.view.${value}`, { defaultValue: `${value} view` }),
              icon: <Icon size={15} aria-hidden="true" />,
            };
          })}
        />
      </div>
      {filtersActive && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--muted-foreground)]" aria-live="polite">
            {localizeUi("ui.slurp.discover.resultCount", {
              count: filteredCount,
              defaultValue: `${filteredCount} creators`,
            })}
          </p>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-[var(--noodle-accent-foreground)] hover:bg-[var(--noodle-accent)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--noodle-accent)]"
          >
            <X size={14} aria-hidden="true" />
            {localizeUi("ui.slurp.discover.clearFilters", { defaultValue: "Clear filters" })}
          </button>
        </div>
      )}
    </div>
  );
}
