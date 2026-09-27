// The live page of the role-play sign-up: what the chat has filled in so far, how far it is, and
// the field the chat just changed, lit up for a moment. Every field can be edited by hand (which
// locks it, so the chat keeps it); a locked field shows its lock and can be unlocked.
import { useEffect, useRef, useState } from "react";
import { Check, Lock, Pencil } from "lucide-react";
import { useTranslation as useUiTranslation } from "react-i18next";
import {
  SLP_SCENE_FIELD_LIMITS,
  SLP_SCENE_SPICE,
  type SlpSceneDraft,
  type SlpSceneField,
} from "../../../../../shared/src/slp/slp-scene.js";
import { cn } from "../../../lib/utils";
import { Avatar, SLP_GROUP_CLASS, SLP_IMG_FRAME_CLASS, SLP_TYPE, SlurpMediaImg } from "../../base/chrome/SlpChrome";
import { SlpSparkleGlyph } from "../../base/chrome/SlpGlyphs";
import { slpPrefersReducedMotion } from "../../base/chrome/slp-motion";
import { SlpButton, SlpChip, SlpSegment } from "../../modules/chrome/SlpButton";
import { slpSceneProgress, type SlpSceneProgressPart } from "./slp-scene-draft";

const ROWS: SlpSceneField[] = [
  "displayName",
  "handle",
  "bio",
  "stagePersonality",
  "appearance",
  "wardrobe",
  "locations",
  "gender",
  "tags",
  "spice",
  "turnOns",
  "hardNoes",
];
const LONG: SlpSceneField[] = ["bio", "stagePersonality", "appearance", "wardrobe", "locations"];
/** The label of each progress part, borrowed from the field or moment it stands for. */
export const SLP_SCENE_PART_LABEL: Record<SlpSceneProgressPart, string> = {
  name: "ui.slurp.scene.field.displayName",
  look: "ui.slurp.scene.field.appearance",
  bio: "ui.slurp.scene.field.bio",
  voice: "ui.slurp.scene.field.stagePersonality",
  tags: "ui.slurp.scene.field.tags",
  limits: "ui.slurp.scene.moment.limits",
};

/** "3 of 6 done" with a thin bar; `parts` adds the checklist chips under it. */
export function SlpSceneProgressBar({
  progress,
  parts = false,
}: {
  progress: ReturnType<typeof slpSceneProgress>;
  parts?: boolean;
}) {
  const { t } = useUiTranslation();
  const label = t("ui.slurp.scene.progress.count", { done: progress.done, total: progress.total });
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className={cn(SLP_TYPE.meta, "shrink-0 whitespace-nowrap font-semibold text-[var(--slurp-text)]")}>
          {label}
        </span>
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.done}
          className="h-1 min-w-10 flex-1 overflow-hidden rounded-full bg-[var(--noodle-divider)]"
        >
          <span
            className="block h-full rounded-full bg-[var(--noodle-accent)] transition-[width] duration-[var(--slurp-motion-slow)] ease-[var(--slurp-ease)] motion-reduce:transition-none"
            style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
          />
        </div>
      </div>
      {parts && (
        <ul className="mt-2 flex flex-wrap gap-1">
          {progress.parts.map((part) => (
            <li
              key={part.id}
              className={cn(
                "inline-flex min-h-7 items-center gap-1 rounded-full px-2.5 text-xs font-semibold",
                part.done
                  ? "bg-[var(--slurp-tint)] text-[var(--slurp-text)]"
                  : "text-[var(--slurp-muted)] ring-1 ring-inset ring-[var(--noodle-divider)]",
              )}
            >
              {part.done && <Check size={12} aria-hidden="true" className="shrink-0 text-[var(--slurp-ink)]" />}
              {t(SLP_SCENE_PART_LABEL[part.id])}
              <span className="sr-only">
                {part.done ? t("ui.slurp.scene.progress.done") : t("ui.slurp.scene.page.empty")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SlpScenePreview({
  title,
  heading = true,
  draft,
  locked,
  fixed,
  recent,
  recentKey,
  progress,
  allowedTags,
  avatarUrl,
  bannerUrl,
  onEdit,
  onToggleLock,
}: {
  title: string;
  /** Off inside a sheet that already shows the title. */
  heading?: boolean;
  draft: SlpSceneDraft;
  locked: readonly SlpSceneField[];
  /** Fields the page cannot change at all (an open page's public name and handle). */
  fixed: readonly SlpSceneField[];
  /** Fields the newest patch changed, marked for a moment. */
  recent: readonly SlpSceneField[];
  /** Changes with every new patch, so the glow plays again for the next one. */
  recentKey?: string;
  progress: ReturnType<typeof slpSceneProgress>;
  allowedTags: readonly string[];
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  onEdit: <F extends SlpSceneField>(field: F, value: SlpSceneDraft[F]) => void;
  onToggleLock: (field: SlpSceneField) => void;
}) {
  const { t } = useUiTranslation();
  const [editing, setEditing] = useState<SlpSceneField | null>(null);
  const name = draft.displayName || t("ui.slurp.scene.page.noName");
  const glow = (field: SlpSceneField) => recent.includes(field);
  // A new name shows on the page card at the top: bring the top back instead of the row.
  const firstRecent = ROWS.find(glow);
  const topRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (recentKey && (firstRecent === "displayName" || firstRecent === "handle"))
      topRef.current?.scrollIntoView({ block: "nearest", behavior: slpPrefersReducedMotion() ? "auto" : "smooth" });
  }, [recentKey, firstRecent]);
  return (
    <section aria-label={title} className="flex min-h-0 flex-col gap-3">
      {heading && <h4 className={cn(SLP_TYPE.title, "flex min-h-11 min-w-0 items-center truncate")}>{title}</h4>}
      <div ref={topRef}>
        <SlpSceneProgressBar progress={progress} parts />
      </div>
      <div className="overflow-hidden rounded-2xl bg-[var(--slurp-surface-raised)] shadow-[var(--slurp-shadow-raised),var(--slurp-highlight)]">
        <div className={cn(SLP_IMG_FRAME_CLASS, "relative h-20 bg-[image:var(--slurp-nav-active)]")}>
          {bannerUrl && (
            <SlurpMediaImg
              src={bannerUrl}
              alt=""
              className="slp-crop-top absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
        <div className="-mt-8 flex items-start gap-3 px-4 pb-3">
          <Avatar
            account={{ displayName: name, avatarUrl: avatarUrl ?? null }}
            className="h-16 w-16 ring-2 ring-[var(--slurp-surface-raised)]"
          />
          <div className="min-w-0 pt-9">
            <p
              key={glow("displayName") ? recentKey : undefined}
              className={cn(
                SLP_TYPE.title,
                "truncate rounded-md",
                !draft.displayName && "text-[var(--slurp-muted)]",
                glow("displayName") && "slp-field-glow",
              )}
            >
              {name}
            </p>
            <p className={cn(SLP_TYPE.meta, "truncate text-[var(--slurp-muted)]")}>
              @{draft.handle || t("ui.slurp.scene.page.noHandle")}
            </p>
          </div>
        </div>
      </div>
      <p className={cn(SLP_TYPE.meta, "-mb-1 px-1 text-pretty text-[var(--slurp-muted)]")}>
        {t("ui.slurp.scene.page.lockHint")}
      </p>
      <ul className={SLP_GROUP_CLASS}>
        {ROWS.map((field) => (
          <FieldRow
            // A new patch remounts the row it changed, so its glow plays again.
            key={glow(field) ? `${field}-${recentKey}` : field}
            field={field}
            draft={draft}
            locked={locked.includes(field)}
            fixed={fixed.includes(field)}
            recent={recent.includes(field)}
            scrollTo={field === firstRecent && field !== "displayName" && field !== "handle"}
            editing={editing === field}
            allowedTags={allowedTags}
            onEditStart={() => setEditing(field)}
            onEditEnd={() => setEditing(null)}
            onEdit={onEdit}
            onToggleLock={() => onToggleLock(field)}
          />
        ))}
      </ul>
    </section>
  );
}

function FieldRow({
  field,
  draft,
  locked,
  fixed,
  recent,
  scrollTo,
  editing,
  allowedTags,
  onEditStart,
  onEditEnd,
  onEdit,
  onToggleLock,
}: {
  field: SlpSceneField;
  draft: SlpSceneDraft;
  locked: boolean;
  fixed: boolean;
  recent: boolean;
  /** This row is the first one the newest patch changed. */
  scrollTo: boolean;
  editing: boolean;
  allowedTags: readonly string[];
  onEditStart: () => void;
  onEditEnd: () => void;
  onEdit: <F extends SlpSceneField>(field: F, value: SlpSceneDraft[F]) => void;
  onToggleLock: () => void;
}) {
  const { t } = useUiTranslation();
  const label = t(`ui.slurp.scene.field.${field}`);
  const value = draft[field];
  // The first field the chat just filled scrolls into view, so its glow is seen (rows remount per patch).
  const rowRef = useRef<HTMLLIElement | null>(null);
  useEffect(() => {
    if (scrollTo)
      rowRef.current?.scrollIntoView({ block: "nearest", behavior: slpPrefersReducedMotion() ? "auto" : "smooth" });
  }, [scrollTo]);
  const shown =
    field === "gender"
      ? draft.gender && t(`ui.slurp.scene.gender.${draft.gender}`)
      : field === "spice"
        ? draft.spice && t(`ui.slurp.scene.spice.${draft.spice}`)
        : field === "tags"
          ? draft.tags.join(" · ")
          : (value as string);
  return (
    <li
      ref={rowRef}
      className={cn(
        "px-4 py-2.5 transition-colors duration-[var(--slurp-motion-slow)] motion-reduce:transition-none",
        recent && "slp-field-glow bg-[var(--slurp-tint)]",
      )}
    >
      <div className="flex items-center gap-1">
        <span
          className={cn(SLP_TYPE.meta, "flex min-w-0 flex-1 items-center gap-1 truncate text-[var(--slurp-muted)]")}
        >
          {recent && <SlpSparkleGlyph size={12} aria-hidden="true" className="shrink-0 text-[var(--slurp-ink)]" />}
          <span className="truncate">{label}</span>
          {fixed && <span className="shrink-0 ps-0.5">· {t("ui.slurp.scene.page.publicName")}</span>}
        </span>
        {!fixed && !editing && (
          <>
            {/* Only a locked field shows its lock (tap to unlock); an edit locks the field by itself. */}
            {locked && (
              <IconButton label={t("ui.slurp.scene.page.unlock", { field: label })} pressed onClick={onToggleLock}>
                <Lock size={14} aria-hidden="true" />
              </IconButton>
            )}
            <IconButton label={t("ui.slurp.scene.page.edit", { field: label })} onClick={onEditStart}>
              <Pencil size={14} aria-hidden="true" />
            </IconButton>
          </>
        )}
      </div>
      {editing ? (
        <FieldEditor
          field={field}
          draft={draft}
          allowedTags={allowedTags}
          onSave={(next) => {
            onEdit(field, next as never);
            onEditEnd();
          }}
          onCancel={onEditEnd}
        />
      ) : (
        <p
          className={cn(
            SLP_TYPE.body,
            "line-clamp-4 whitespace-pre-wrap break-words text-pretty",
            !shown && "text-[var(--slurp-muted)]",
          )}
        >
          {shown || t("ui.slurp.scene.page.empty")}
        </p>
      )}
    </li>
  );
}

function IconButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)] [&_svg]:!text-current",
        pressed ? "text-[var(--slurp-ink)]" : "text-[var(--slurp-muted)]",
      )}
    >
      {children}
    </button>
  );
}

function FieldEditor({
  field,
  draft,
  allowedTags,
  onSave,
  onCancel,
}: {
  field: SlpSceneField;
  draft: SlpSceneDraft;
  allowedTags: readonly string[];
  onSave: (value: SlpSceneDraft[SlpSceneField]) => void;
  onCancel: () => void;
}) {
  const { t } = useUiTranslation();
  const [value, setValue] = useState<SlpSceneDraft[SlpSceneField]>(draft[field]);
  const label = t(`ui.slurp.scene.field.${field}`);
  const inputClass =
    "mt-1.5 w-full rounded-xl bg-[var(--slurp-canvas)] px-3 py-2 text-base text-[var(--slurp-text)] outline-none ring-1 ring-inset ring-[var(--noodle-divider)] focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)] sm:text-[13px]";
  return (
    <div>
      {field === "gender" ? (
        <SlpSegment
          className="mt-1.5"
          label={label}
          value={(value as SlpSceneDraft["gender"]) ?? "other"}
          onChange={setValue}
          options={(["female", "male", "other"] as const).map((option) => ({
            value: option,
            label: t(`ui.slurp.scene.gender.${option}`),
          }))}
        />
      ) : field === "spice" ? (
        <SlpSegment
          className="mt-1.5"
          label={label}
          value={(value as SlpSceneDraft["spice"]) ?? "flirty"}
          onChange={setValue}
          options={SLP_SCENE_SPICE.map((option) => ({ value: option, label: t(`ui.slurp.scene.spice.${option}`) }))}
        />
      ) : field === "tags" ? (
        <div role="group" aria-label={label} className="mt-1.5 flex flex-wrap gap-1.5">
          {allowedTags.map((tag) => {
            const selected = (value as string[]).includes(tag);
            return (
              <SlpChip
                key={tag}
                selected={selected}
                className="min-h-9 px-3"
                onClick={() =>
                  setValue(
                    selected
                      ? (value as string[]).filter((entry) => entry !== tag)
                      : [...(value as string[]), tag].slice(0, 8),
                  )
                }
              >
                {tag}
              </SlpChip>
            );
          })}
        </div>
      ) : LONG.includes(field) ? (
        <textarea
          aria-label={label}
          value={value as string}
          maxLength={SLP_SCENE_FIELD_LIMITS[field as keyof typeof SLP_SCENE_FIELD_LIMITS]}
          rows={4}
          onChange={(event) => setValue(event.target.value)}
          className={cn(inputClass, "resize-y")}
        />
      ) : (
        <input
          aria-label={label}
          value={value as string}
          maxLength={SLP_SCENE_FIELD_LIMITS[field as keyof typeof SLP_SCENE_FIELD_LIMITS]}
          onChange={(event) => setValue(event.target.value)}
          className={inputClass}
        />
      )}
      <div className="mt-2 flex justify-end gap-1.5">
        <SlpButton variant="tertiary" className="min-h-9" onClick={onCancel}>
          {t("ui.slurp.scene.page.cancel")}
        </SlpButton>
        <SlpButton className="min-h-9" onClick={() => onSave(value)}>
          {t("ui.slurp.scene.page.save")}
        </SlpButton>
      </div>
    </div>
  );
}
