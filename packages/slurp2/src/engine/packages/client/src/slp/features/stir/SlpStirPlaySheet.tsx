import { useEffect, useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/utils";
import { Avatar, SLP_TYPE } from "../../base/chrome/SlpChrome";
import { focusRing } from "../../base/chrome/slp-focus";
import { SlpSparkleGlyph } from "../../base/chrome/SlpGlyphs";
import { SlpButton, SlpChip, SlpPrimaryButton } from "../../modules/chrome/SlpButton";
import { SlpSheet } from "../../modules/chrome/SlpSheet";
import { Toggle } from "../../modules/settings/SlpSettingsControls";
import { errorMessage } from "../../modules/settings/slp-backstage-format";
import {
  SLP_COUPLE_STEERS,
  SLP_STORYLINE_MOVES,
  type SlpActionName,
} from "../../../../../shared/src/slp/slp-actions.js";
import { SLP_STEERING_MOODS, SLP_STEERING_PACES } from "../../../../../shared/src/slp/slp-creator-steering.js";
import { SLP_SPICE_LEVELS } from "../../../../../shared/src/slp/slp-spice.js";
import type { SlpActionPreview, SlpStirView } from "../../../../../shared/src/slp/slp-stir.js";
import { SlpTextAssist } from "../assist/slp-assist-contract";
import { useSlurpStirPreview } from "./slp-stir-hooks";
import { SlpStirCard, useSlpStirDoIt } from "./SlpStirCards";
import { SLP_STIR_DECK } from "./slp-stir-deck";
import { SlpStirBrandPick } from "./SlpStirBrandPick";

const inputClass = `min-h-11 w-full rounded-xl bg-[var(--slurp-canvas)] px-3 text-base ring-1 ring-inset ring-[var(--slurp-outline)] sm:text-sm ${focusRing}`;

type Creator = SlpStirView["creators"][number];
type Form = Record<string, string | boolean | string[] | null>;

/** What each lever may pick: the pages Slurp posts for write posts and throw shade; anyone can be set up. */
const needsAutomatic = new Set<SlpActionName>(["add-idea", "write-post", "steer-creator", "set-spice"]);

/** Who can be picked, as avatar chips. `max` 1 or 2. */
function CreatorPicker({
  creators,
  picked,
  onPick,
  max,
  label,
}: {
  creators: Creator[];
  picked: string[];
  onPick: (ids: string[]) => void;
  max: 1 | 2;
  label: string;
}) {
  const toggle = (id: string) =>
    onPick(picked.includes(id) ? picked.filter((entry) => entry !== id) : [...picked, id].slice(-max));
  return (
    <fieldset className="space-y-2">
      <legend className={cn(SLP_TYPE.meta, "font-semibold")}>{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {creators.map((creator) => {
          const on = picked.includes(creator.id);
          return (
            <button
              key={creator.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(creator.id)}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-full py-1 pe-3.5 ps-1 text-sm font-semibold ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)] motion-reduce:transition-none",
                on
                  ? "bg-[image:var(--slurp-nav-active)] text-[var(--slurp-text)] ring-[var(--noodle-accent)]/45"
                  : "bg-[var(--slurp-canvas)] text-[var(--slurp-muted)] ring-[var(--slurp-outline)] hover:text-[var(--slurp-text)]",
              )}
            >
              <Avatar account={{ displayName: creator.name, avatarUrl: creator.avatarUrl }} size="xs" />
              <span className="max-w-[9rem] truncate">{creator.name}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** One choice out of a few, as chips (steer, move, mood, pace, level). */
function Choice({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className={cn(SLP_TYPE.meta, "font-semibold")}>{label}</legend>
      <div className="flex flex-wrap gap-1.5" role="radiogroup">
        {options.map((option) => (
          <SlpChip key={option.value} selected={value === option.value} onClick={() => onChange(option.value)}>
            {option.label}
          </SlpChip>
        ))}
      </div>
    </fieldset>
  );
}

/** A picked thing in the world (a couple, a collab, a rivalry, an event, a storyline) as rows. */
function Pick({
  label,
  empty,
  items,
  value,
  onChange,
}: {
  label: string;
  empty: string;
  items: { id: string; title: string; detail?: string; who: Creator[] }[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className={cn(SLP_TYPE.meta, "font-semibold")}>{label}</legend>
      {items.length === 0 ? (
        <p className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>{empty}</p>
      ) : (
        <div className="space-y-1.5" role="radiogroup">
          {items.map((item) => {
            const on = value === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onChange(item.id)}
                className={cn(
                  "flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-2 text-start ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)] motion-reduce:transition-none",
                  on
                    ? "bg-[image:var(--slurp-nav-active)] ring-[var(--noodle-accent)]/45"
                    : "bg-[var(--slurp-canvas)] ring-[var(--slurp-outline)] hover:bg-[var(--accent)]",
                )}
              >
                {item.who.length > 0 && (
                  <span className="flex shrink-0 -space-x-2" aria-hidden="true">
                    {item.who.map((person) => (
                      <Avatar
                        key={person.id}
                        account={{ displayName: person.name, avatarUrl: person.avatarUrl }}
                        size="xs"
                        className="ring-2 ring-[var(--slurp-canvas)]"
                      />
                    ))}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className={cn(SLP_TYPE.body, "block truncate font-semibold")}>{item.title}</span>
                  {item.detail && (
                    <span className={cn(SLP_TYPE.meta, "block truncate text-[var(--slurp-muted)]")}>{item.detail}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

/** The step a filled form stands for, or null while something is missing. */
function stepOf(action: SlpActionName, form: Form): Record<string, unknown> | null {
  const one = (form.who as string[] | undefined)?.[0];
  const two = form.who as string[] | undefined;
  const text = typeof form.text === "string" ? form.text.trim() : "";
  switch (action) {
    case "add-idea":
      return one && text ? { accountId: one, text, story: form.story === true } : null;
    case "write-post":
      return one ? { accountId: one, ...(text ? { idea: text } : {}), story: form.story === true } : null;
    case "steer-creator": {
      if (!one || (!form.mood && !form.pace)) return null;
      return {
        accountId: one,
        ...(form.mood ? { mood: form.mood === "none" ? null : form.mood } : {}),
        ...(form.pace ? { pace: form.pace } : {}),
      };
    }
    case "set-spice":
      return one && form.level ? { accountId: one, level: form.level === "default" ? null : form.level } : null;
    case "set-up-couple":
      return two?.length === 2 ? { aId: two[0], bId: two[1] } : null;
    case "suggest-collab":
      return two?.length === 2 ? { aId: two[0], bId: two[1], happen: form.happen === true } : null;
    case "offer-brand-deal":
      return one && form.pick ? { accountId: one, productId: form.pick, happen: form.happen === true } : null;
    case "start-rivalry":
      return two?.length === 2 ? { fromId: two[0], toId: two[1], ...(text ? { cause: text } : {}) } : null;
    case "steer-couple":
      return form.pick && form.steer ? { coupleId: form.pick, steer: form.steer } : null;
    case "couple-page":
      return form.pick ? { coupleId: form.pick, open: form.open !== false } : null;
    case "push-collab":
      return form.pick ? { collabId: form.pick } : null;
    case "cool-rivalry":
      return form.pick ? { rivalryId: form.pick } : null;
    case "start-event":
      return form.pick ? { eventId: form.pick } : null;
    case "steer-storyline": {
      if (!form.pick || !form.move) return null;
      const [accountId, projectId] = String(form.pick).split("|");
      const needsText = form.move === "insert" || form.move === "label";
      if (needsText && !text) return null;
      return { accountId, projectId, move: form.move, ...(needsText ? { text } : {}) };
    }
    case "run-audience":
      return {};
    default:
      return null;
  }
}

/**
 * Playing one card: who (and a few options), then the preview card, then "Do it". Nothing runs
 * before the tap, and the preview is free.
 */
export function SlpStirPlaySheet({
  action,
  view,
  prefill,
  onClose,
}: {
  action: SlpActionName | null;
  view: SlpStirView | undefined;
  /** The Creator the sheet came from (the ✦ sheet, a suggestion). */
  prefill?: { who?: string[]; pick?: string };
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const textId = useId();
  const [form, setForm] = useState<Form>({});
  const [cards, setCards] = useState<SlpActionPreview[] | null>(null);
  const preview = useSlurpStirPreview();
  const doIt = useSlpStirDoIt();
  useEffect(() => {
    setForm({ who: prefill?.who ?? [], pick: prefill?.pick ?? null });
    setCards(null);
    // The prefill's ids, not its object: a caller may build a new one on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, prefill?.who?.join("|"), prefill?.pick]);
  if (!action) return null;
  const set = (patch: Form) => {
    setForm((current) => ({ ...current, ...patch }));
    setCards(null);
  };
  const creators = (view?.creators ?? []).filter((creator) => !creator.couplePage);
  const byId = new Map((view?.creators ?? []).map((creator) => [creator.id, creator]));
  const who = (...ids: string[]) => ids.flatMap((id) => (byId.get(id) ? [byId.get(id)!] : []));
  const nameOf = (id: string) => byId.get(id)?.name ?? "";
  const step = stepOf(action, form);
  const picked = (form.who as string[] | undefined) ?? [];
  const deck = SLP_STIR_DECK[action];

  const body: ReactNode[] = [];
  const textField = (label: string, placeholder: string, field?: "idea" | "chapter") =>
    body.push(
      <div key="text" className="space-y-2">
        <div className="flex flex-wrap items-center gap-x-2">
          <label htmlFor={textId} className={cn(SLP_TYPE.meta, "font-semibold")}>
            {label}
          </label>
          {field && picked[0] && (
            <SlpTextAssist
              field={field}
              value={String(form.text ?? "")}
              accountId={picked[0] ?? (typeof form.pick === "string" ? form.pick.split("|")[0] : undefined)}
              onApply={(text) => set({ text })}
            />
          )}
        </div>
        <input
          id={textId}
          value={String(form.text ?? "")}
          maxLength={160}
          placeholder={placeholder}
          onChange={(event) => set({ text: event.target.value })}
          className={inputClass}
        />
      </div>,
    );

  if (deck.targets === "creator")
    body.push(
      <CreatorPicker
        key="who"
        max={1}
        label={t("ui.slurp.stir.form.who")}
        creators={needsAutomatic.has(action) ? creators.filter((creator) => creator.automatic) : creators}
        picked={picked}
        onPick={(ids) => set(action === "offer-brand-deal" ? { who: ids, pick: null } : { who: ids })}
      />,
    );
  if (deck.targets === "pair")
    body.push(
      <CreatorPicker
        key="who"
        max={2}
        label={action === "start-rivalry" ? t("ui.slurp.stir.form.rivals") : t("ui.slurp.stir.form.two")}
        creators={creators}
        picked={picked}
        onPick={(ids) => set({ who: ids })}
      />,
    );
  switch (action) {
    case "add-idea":
      textField(t("ui.slurp.stir.form.idea"), t("ui.slurp.stir.form.ideaPlaceholder"), "idea");
      body.push(
        <Toggle
          key="story"
          compact
          label={t("ui.slurp.steering.asStory")}
          value={form.story === true}
          onChange={(story) => set({ story })}
        />,
      );
      break;
    case "write-post":
      textField(t("ui.slurp.stir.form.postIdea"), t("ui.slurp.stir.form.ideaPlaceholder"), "idea");
      body.push(
        <Toggle
          key="story"
          compact
          label={t("ui.slurp.steering.asStory")}
          value={form.story === true}
          onChange={(story) => set({ story })}
        />,
      );
      break;
    case "steer-creator":
      body.push(
        <Choice
          key="mood"
          label={t("ui.slurp.steering.mood")}
          value={(form.mood as string) ?? null}
          onChange={(mood) => set({ mood })}
          options={[
            { value: "none", label: t("ui.slurp.steering.moods.none") },
            ...SLP_STEERING_MOODS.map((mood) => ({ value: mood, label: t(`ui.slurp.steering.moods.${mood}`) })),
          ]}
        />,
        <Choice
          key="pace"
          label={t("ui.slurp.steering.pace")}
          value={(form.pace as string) ?? null}
          onChange={(pace) => set({ pace })}
          options={SLP_STEERING_PACES.map((pace) => ({ value: pace, label: t(`ui.slurp.steering.paces.${pace}`) }))}
        />,
      );
      break;
    case "set-spice":
      body.push(
        <Choice
          key="level"
          label={t("ui.slurp.stir.form.level")}
          value={(form.level as string) ?? null}
          onChange={(level) => set({ level })}
          options={[
            ...SLP_SPICE_LEVELS.map((level) => ({ value: level, label: t(`ui.slurp.spice.levels.${level}`) })),
            { value: "default", label: t("ui.slurp.stir.defaultLevel") },
          ]}
        />,
      );
      break;
    case "offer-brand-deal":
      if (picked[0])
        body.push(
          <SlpStirBrandPick
            key="pick"
            accountId={picked[0]}
            value={(form.pick as string) ?? null}
            onChange={(pick) => set({ pick })}
          />,
        );
    // falls through: a deal can be pushed like a collab ("Make it happen").
    case "suggest-collab":
      body.push(
        <div key="happen" className="space-y-1">
          <Toggle
            compact
            label={t("ui.slurp.stir.form.happen")}
            value={form.happen === true}
            onChange={(happen) => set({ happen })}
          />
          <p className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>
            {form.happen ? t("ui.slurp.stir.form.happenOn") : t("ui.slurp.stir.form.happenOff")}
          </p>
        </div>,
      );
      break;
    case "start-rivalry":
      textField(t("ui.slurp.stir.form.cause"), t("ui.slurp.stir.form.causePlaceholder"));
      break;
    case "steer-couple":
    case "couple-page": {
      const couples = (view?.couples ?? []).filter((couple) =>
        action === "couple-page" ? couple.stage === "dating" || couple.stage === "together" : true,
      );
      body.push(
        <Pick
          key="pick"
          label={t("ui.slurp.stir.form.couple")}
          empty={t("ui.slurp.stir.form.noCouples")}
          value={(form.pick as string) ?? null}
          onChange={(pick) => set({ pick, steer: null })}
          items={couples.map((couple) => ({
            id: couple.id,
            title: t("ui.slurp.stir.pair", { a: nameOf(couple.aId), b: nameOf(couple.bId) }),
            detail: t(`ui.slurp.stir.live.couple.${couple.stage}`),
            who: who(couple.aId, couple.bId),
          }))}
        />,
      );
      const couple = couples.find((entry) => entry.id === form.pick);
      if (couple && action === "steer-couple") {
        const allowed = SLP_COUPLE_STEERS.filter((steer) =>
          couple.stage === "split"
            ? steer === "reunite"
            : steer === "reunite"
              ? false
              : steer === "patchUp"
                ? couple.stage === "rocky"
                : steer === "drama"
                  ? couple.stage === "dating" || couple.stage === "together"
                  : steer === "date"
                    ? couple.stage !== "rocky"
                    : true,
        );
        body.push(
          <Choice
            key="steer"
            label={t("ui.slurp.stir.form.steer")}
            value={(form.steer as string) ?? null}
            onChange={(steer) => set({ steer })}
            options={allowed.map((steer) => ({ value: steer, label: t(`ui.slurp.stir.steer.${steer}`) }))}
          />,
        );
      }
      if (couple && action === "couple-page")
        body.push(
          <Choice
            key="open"
            label={t("ui.slurp.stir.form.page")}
            value={form.open === false ? "close" : "open"}
            onChange={(value) => set({ open: value === "open" })}
            options={[
              { value: "open", label: t("ui.slurp.stir.form.pageOpen") },
              { value: "close", label: t("ui.slurp.stir.form.pageClose") },
            ]}
          />,
        );
      break;
    }
    case "push-collab":
      body.push(
        <Pick
          key="pick"
          label={t("ui.slurp.stir.form.collab")}
          empty={t("ui.slurp.stir.form.noCollabs")}
          value={(form.pick as string) ?? null}
          onChange={(pick) => set({ pick })}
          items={(view?.collabs ?? [])
            .filter((collab) => collab.status === "asked")
            .map((collab) => ({
              id: collab.id,
              title: t("ui.slurp.stir.pair", { a: nameOf(collab.hostId), b: nameOf(collab.partnerId) }),
              detail: t("ui.slurp.stir.live.collab.asked"),
              who: who(collab.hostId, collab.partnerId),
            }))}
        />,
      );
      break;
    case "cool-rivalry":
      body.push(
        <Pick
          key="pick"
          label={t("ui.slurp.stir.form.rivalry")}
          empty={t("ui.slurp.stir.form.noRivalries")}
          value={(form.pick as string) ?? null}
          onChange={(pick) => set({ pick })}
          items={(view?.rivalries ?? [])
            .filter((rivalry) => rivalry.stage !== "cooling")
            .map((rivalry) => ({
              id: rivalry.id,
              title: t("ui.slurp.stir.versus", { a: nameOf(rivalry.fromId), b: nameOf(rivalry.toId) }),
              detail: t(`ui.slurp.stir.live.rivalry.${rivalry.stage}`),
              who: who(rivalry.fromId, rivalry.toId),
            }))}
        />,
      );
      break;
    case "start-event":
      body.push(
        <Pick
          key="pick"
          label={t("ui.slurp.stir.form.event")}
          empty={t("ui.slurp.stir.form.noEvents")}
          value={(form.pick as string) ?? null}
          onChange={(pick) => set({ pick })}
          items={[...(view?.events ?? [])]
            .sort((a, b) => Number(a.running) - Number(b.running))
            .map((event) => ({
              id: event.id,
              title: event.name,
              detail: event.running ? t("ui.slurp.stir.live.event.running") : undefined,
              who: [],
            }))}
        />,
      );
      break;
    case "steer-storyline": {
      body.push(
        <Pick
          key="pick"
          label={t("ui.slurp.stir.form.storyline")}
          empty={t("ui.slurp.stir.form.noStorylines")}
          value={(form.pick as string) ?? null}
          onChange={(pick) => set({ pick, move: null })}
          items={(view?.storylines ?? [])
            .filter((story) => !prefill?.who?.length || prefill.who.includes(story.accountId))
            .map((story) => ({
              id: `${story.accountId}|${story.projectId}`,
              title: story.title,
              detail: t("ui.slurp.stir.form.chapterNow", { name: nameOf(story.accountId), chapter: story.chapter }),
              who: who(story.accountId),
            }))}
        />,
      );
      const story = (view?.storylines ?? []).find((entry) => `${entry.accountId}|${entry.projectId}` === form.pick);
      if (story) {
        body.push(
          <Choice
            key="move"
            label={t("ui.slurp.stir.form.move")}
            value={(form.move as string) ?? null}
            onChange={(move) => set({ move })}
            options={SLP_STORYLINE_MOVES.filter((move) => (story.held ? move !== "hold" : move !== "release")).map(
              (move) => ({ value: move, label: t(`ui.slurp.stir.move.${move}`) }),
            )}
          />,
        );
        if (form.move === "insert" || form.move === "label")
          textField(t("ui.slurp.stir.form.chapter"), t("ui.slurp.projects.addNextPlaceholder"), "chapter");
      }
      break;
    }
    default:
      break;
  }

  const onPreview = () =>
    step &&
    preview.mutate([{ action, input: step }], {
      onSuccess: (answer) => setCards(answer.cards),
      onError: () => setCards([]),
    });

  return (
    <SlpSheet
      open={Boolean(action)}
      onClose={onClose}
      back
      title={t(`ui.slurp.stir.card.${action}.title`)}
      footer={
        <div className="flex gap-2 px-3 py-2">
          {cards ? (
            <>
              <SlpButton variant="quiet" className="flex-1" disabled={doIt.pending} onClick={() => setCards(null)}>
                {t("ui.slurp.stir.change")}
              </SlpButton>
              <SlpPrimaryButton
                className="flex-1"
                disabled={!cards.some((card) => !card.error) || doIt.pending}
                onClick={(event) =>
                  doIt.run(cards, "deck", { from: event.currentTarget.getBoundingClientRect(), onDone: onClose })
                }
              >
                <SlpSparkleGlyph size={16} aria-hidden="true" />
                {doIt.pending ? t("ui.slurp.stir.doing") : t("ui.slurp.stir.doIt")}
              </SlpPrimaryButton>
            </>
          ) : (
            <SlpPrimaryButton className="w-full" disabled={!step || preview.isPending} onClick={onPreview}>
              {preview.isPending ? t("ui.slurp.stir.looking") : t("ui.slurp.stir.see")}
            </SlpPrimaryButton>
          )}
        </div>
      }
    >
      <div className="space-y-4 px-2 pb-2" data-slp-stir-play={action}>
        <p className={cn(SLP_TYPE.meta, "px-1 text-[var(--slurp-muted)]")}>{t(`ui.slurp.stir.card.${action}.blurb`)}</p>
        {cards ? (
          <ul className="space-y-2">
            {cards.map((card, index) => (
              <SlpStirCard key={`${card.action}:${index}`} card={card} />
            ))}
            {preview.error && (
              <p className={cn(SLP_TYPE.meta, "text-[var(--slurp-danger)]")}>{errorMessage(preview.error)}</p>
            )}
          </ul>
        ) : (
          <div className="space-y-4 px-1">{body}</div>
        )}
      </div>
    </SlpSheet>
  );
}
