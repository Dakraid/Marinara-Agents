// The live page of the role-play sign-up: what the chat has filled in so far. Every field can be
// edited by hand (which locks it) and locked or unlocked; a locked field is never patched again.
import { useState } from "react";
import { Loader2, Lock, LockOpen, Pencil } from "lucide-react";
import { useTranslation as useUiTranslation } from "react-i18next";
import {
  SLP_SCENE_FIELD_LIMITS,
  SLP_SCENE_SPICE,
  type SlpSceneDraft,
  type SlpSceneField,
} from "../../../../../shared/src/slp/slp-scene.js";
import { cn } from "../../../lib/utils";
import { Avatar, SLP_GROUP_CLASS, SLP_TYPE } from "../../base/chrome/SlpChrome";
import { SlpUsesAiMark } from "../../modules/chrome/SlpAiMark";
import { SlpButton, SlpChip, SlpSegment } from "../../modules/chrome/SlpButton";

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

export function SlpScenePreview({
  title,
  heading = true,
  draft,
  locked,
  fixed,
  recent,
  allowedTags,
  avatarUrl,
  bannerUrl,
  updating,
  onUpdatePage,
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
  allowedTags: readonly string[];
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  updating: boolean;
  onUpdatePage: () => void;
  onEdit: <F extends SlpSceneField>(field: F, value: SlpSceneDraft[F]) => void;
  onToggleLock: (field: SlpSceneField) => void;
}) {
  const { t } = useUiTranslation();
  const [editing, setEditing] = useState<SlpSceneField | null>(null);
  const name = draft.displayName || t("ui.slurp.scene.page.noName");
  return (
    <section aria-label={title} className="flex min-h-0 flex-col gap-3">
      <div className="flex min-h-11 items-center justify-between gap-2">
        {heading && <h4 className={cn(SLP_TYPE.title, "min-w-0 truncate")}>{title}</h4>}
        <SlpButton
          variant="quiet"
          className="ms-auto min-h-9 shrink-0 px-3 text-xs"
          disabled={updating}
          onClick={onUpdatePage}
        >
          {updating ? <Loader2 size={14} aria-hidden="true" className="animate-spin" /> : <SlpUsesAiMark />}
          {t("ui.slurp.scene.page.update")}
        </SlpButton>
      </div>
      <div className="overflow-hidden rounded-2xl bg-[var(--slurp-surface-raised)] shadow-[var(--slurp-shadow-raised),var(--slurp-highlight)]">
        <div
          className="h-20 bg-[image:var(--slurp-nav-active)] bg-cover bg-center"
          style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
        />
        <div className="-mt-8 flex items-end gap-3 px-4 pb-3">
          <Avatar
            account={{ displayName: name, avatarUrl: avatarUrl ?? null }}
            className="h-16 w-16 ring-2 ring-[var(--slurp-surface-raised)]"
          />
          <div className="min-w-0 pb-0.5">
            <p className={cn(SLP_TYPE.title, "truncate", !draft.displayName && "text-[var(--slurp-muted)]")}>{name}</p>
            <p className={cn(SLP_TYPE.meta, "truncate text-[var(--slurp-muted)]")}>
              @{draft.handle || t("ui.slurp.scene.page.noHandle")}
            </p>
          </div>
        </div>
      </div>
      <ul className={SLP_GROUP_CLASS}>
        {ROWS.map((field) => (
          <FieldRow
            key={field}
            field={field}
            draft={draft}
            locked={locked.includes(field)}
            fixed={fixed.includes(field)}
            recent={recent.includes(field)}
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
      className={cn(
        "px-4 py-2.5 transition-colors duration-[var(--slurp-motion-slow)] motion-reduce:transition-none",
        recent && "bg-[var(--slurp-tint)]",
      )}
    >
      <div className="flex items-center gap-1">
        <span className={cn(SLP_TYPE.meta, "min-w-0 flex-1 truncate text-[var(--slurp-muted)]")}>
          {label}
          {fixed && <span className="ps-1.5">· {t("ui.slurp.scene.page.publicName")}</span>}
        </span>
        {!fixed && !editing && (
          <>
            <IconButton label={t("ui.slurp.scene.page.edit", { field: label })} onClick={onEditStart}>
              <Pencil size={14} aria-hidden="true" />
            </IconButton>
            <IconButton
              label={t(locked ? "ui.slurp.scene.page.unlock" : "ui.slurp.scene.page.lock", { field: label })}
              pressed={locked}
              onClick={onToggleLock}
            >
              {locked ? <Lock size={14} aria-hidden="true" /> : <LockOpen size={14} aria-hidden="true" />}
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
