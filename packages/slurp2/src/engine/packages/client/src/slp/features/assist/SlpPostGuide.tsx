/**
 * The guided post (0.3.14, reworked in 0.3.31): a wish in, the page's normal post out. It is one
 * bar on top of the composer, shaped like a message box: the wish, then what rides along as chips
 * (a picture, a storyline, a saved idea, a wardrobe look, an owed #ad, a collab) and "Write it". The
 * server writes it with the post generator for the audience the composer is set to, and the title,
 * text and picture land in the composer's own fields below. Nothing is posted until Post is pressed.
 */
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, Handshake, ImagePlus, Lightbulb, Loader2, Megaphone, Shirt } from "lucide-react";
import { cn } from "../../../lib/utils";
import { getApiErrorMessage } from "../../../lib/api-client";
import type { SlurpContentDelivery, SlurpContentIntent } from "../../../../../shared/src/slp/slp-content-axes.js";
import { SLP_TYPE } from "../../base/chrome/SlpChrome";
import { SlpSparkleGlyph } from "../../base/chrome/SlpGlyphs";
import { SlpAutoGrowTextarea } from "../../base/ui/SlpAutoGrowTextarea";
import { SlpUsesAiMark } from "../../modules/chrome/SlpAiMark";
import { SlpChip, SlpPrimaryButton } from "../../modules/chrome/SlpButton";
import { useSlurpCreatorSteering, useSlurpWardrobe } from "../creators/slp-creators-contract";
import { useSlurpProjects, useSlurpTies } from "../projects/slp-projects-contract";
import { runSlpAction } from "./slp-assist-hooks";

export type SlpPostGuideDraft = {
  title: string;
  text: string;
  image: string | null;
  imageError: string | null;
  dealId: string | null;
  collabId: string | null;
  /** The saved idea this draft was written from; posting it uses the idea up. */
  ideaId: string | null;
};

type AddKind = "storyline" | "idea" | "look";

export function SlpPostGuide({
  accountId,
  personaId,
  story,
  access,
  hasImage = false,
  contentIntent = null,
  contentDelivery = null,
  disabled = false,
  initialIdea = "",
  autoRun = false,
  onDraft,
  onPendingChange,
}: {
  accountId: string;
  personaId: string | null;
  story: boolean;
  /** Who the post is for. It is the composer's own setting: the draft is written for this audience. */
  access: "public" | "locked";
  /** The composer already holds a picture: the draft is written around it, none is drawn. */
  hasImage?: boolean;
  /** The one-shot purpose picked under Advanced, when there is one. */
  contentIntent?: SlurpContentIntent | null;
  contentDelivery?: SlurpContentDelivery | null;
  disabled?: boolean;
  /** An idea handed over from Stir; with `autoRun` the draft starts at once. */
  initialIdea?: string;
  autoRun?: boolean;
  onDraft: (draft: SlpPostGuideDraft) => void;
  onPendingChange?: (pending: boolean) => void;
}) {
  const { t } = useTranslation();
  const ties = useSlurpTies(personaId).data;
  const projects = useSlurpProjects(personaId, accountId).data?.projects ?? [];
  const ideas = useSlurpCreatorSteering(accountId).data?.steering.nudges ?? [];
  const looks = (useSlurpWardrobe(accountId).data?.looks ?? []).filter((look) => look.enabled);
  const [idea, setIdea] = useState(initialIdea);
  const [picture, setPicture] = useState(true);
  const [dealId, setDealId] = useState<string | null>(null);
  const [collabId, setCollabId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [lookId, setLookId] = useState<string | null>(null);
  const [openKind, setOpenKind] = useState<AddKind | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // What this page owes or plans: an accepted #ad not posted yet, a collab that is on.
  const deals = (ties?.deals ?? []).filter((deal) => deal.creatorId === accountId && deal.owesPost);
  const collabs = (ties?.collabs ?? []).filter(
    (collab) =>
      (collab.hostId === accountId || collab.partnerId === accountId) &&
      (collab.status === "agreed" || collab.status === "planned"),
  );
  const nameOf = (id: string) => ties?.creators.find((creator) => creator.id === id)?.name ?? "";
  // What Slurp has for this page, one group per kind. An empty kind still shows, so the row is findable.
  const groups: {
    kind: AddKind;
    icon: typeof BookOpen;
    selected: string | null;
    options: { id: string; label: string }[];
    pick: (id: string | null) => void;
  }[] = [
    {
      kind: "storyline" as const,
      icon: BookOpen,
      selected: projectId,
      options: projects.filter((project) => project.status === "active").map(({ id, title }) => ({ id, label: title })),
      pick: setProjectId,
    },
    {
      kind: "idea" as const,
      icon: Lightbulb,
      selected: ideaId,
      options: ideas.map(({ id, text }) => ({ id, label: text })),
      // A saved idea is the wish itself: it goes into the box, where it can still be changed.
      pick: (id: string | null) => {
        setIdeaId(id);
        const picked = ideas.find((entry) => entry.id === id);
        if (picked) setIdea(picked.text);
      },
    },
    {
      kind: "look" as const,
      icon: Shirt,
      selected: lookId,
      options: looks.map(({ id, name }) => ({ id, label: name })),
      pick: setLookId,
    },
  ];
  const open = groups.find((group) => group.kind === openKind) ?? null;

  async function write(text = idea) {
    if (!text.trim() || pending) return;
    setPending(true);
    onPendingChange?.(true);
    setError(null);
    setOpenKind(null);
    try {
      const draft = await runSlpAction("draft-post", {
        accountId,
        idea: text.trim(),
        story,
        picture: picture && !hasImage,
        access,
        ...(dealId ? { dealId } : {}),
        ...(collabId ? { collabId } : {}),
        ...(projectId ? { projectId } : {}),
        ...(lookId ? { lookId } : {}),
        ...(contentIntent ? { contentIntent, ...(contentDelivery ? { contentDelivery } : {}) } : {}),
      });
      if (draft.imageError) setError(t("ui.slurp.postGuide.noPicture", { reason: draft.imageError }));
      // A saved idea is used up only by a draft written from its own words.
      const fromIdea = ideas.find((entry) => entry.id === ideaId)?.text.trim() === text.trim();
      onDraft({ ...draft, title: draft.title ?? "", dealId, collabId, ideaId: fromIdea ? ideaId : null });
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("ui.slurp.postGuide.failed")));
    } finally {
      setPending(false);
      onPendingChange?.(false);
    }
  }

  // An idea from Stir drafts once, as soon as the composer opens with it.
  const autoRan = useRef<string | null>(null);
  useEffect(() => {
    if (!autoRun) {
      autoRan.current = null;
      return;
    }
    if (autoRan.current === initialIdea || !initialIdea.trim()) return;
    autoRan.current = initialIdea;
    setIdea(initialIdea);
    void write(initialIdea);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per handed-over idea
  }, [autoRun, initialIdea]);

  const busy = disabled || pending;
  const question = t(story ? "ui.slurp.postGuide.storyQuestion" : "ui.slurp.postGuide.question");
  return (
    <section aria-label={t("ui.slurp.postGuide.label")} className="space-y-1.5">
      <form
        className="space-y-2 rounded-2xl bg-[var(--slurp-canvas)] p-2 ring-1 ring-inset ring-[var(--noodle-divider)] focus-within:ring-2 focus-within:ring-[var(--slurp-focus)]"
        onSubmit={(event) => {
          event.preventDefault();
          void write();
        }}
      >
        <label className="flex items-start gap-2 px-2 pt-1.5">
          <span className="grid h-6 shrink-0 place-items-center text-[var(--slurp-ink)] [&_svg]:!text-current">
            <SlpSparkleGlyph size={16} aria-hidden="true" />
          </span>
          <span className="sr-only">{question}</span>
          <SlpAutoGrowTextarea
            value={idea}
            maxLength={600}
            rows={2}
            disabled={busy}
            onChange={(event) => setIdea(event.target.value)}
            placeholder={`${question} ${t("ui.slurp.postGuide.placeholder")}`}
            className="min-h-12 w-full resize-none border-0 bg-transparent text-base leading-6 text-[var(--slurp-text)] outline-none placeholder:text-[var(--slurp-muted)] disabled:opacity-60 sm:text-[15px]"
          />
        </label>

        {/* What rides along, then the action: chips wrap on a phone and "Write it" keeps the right edge. */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t("ui.slurp.postGuide.addLabel")}>
          {!hasImage && (
            <SlpChip
              selected={picture}
              disabled={busy}
              onClick={() => setPicture((value) => !value)}
              className="min-h-9"
            >
              <ImagePlus size={14} aria-hidden="true" />
              {t("ui.slurp.postGuide.withPicture")}
            </SlpChip>
          )}
          {groups.map((group) => {
            const picked = group.options.find((option) => option.id === group.selected);
            return (
              <SlpChip
                key={group.kind}
                selected={Boolean(picked)}
                aria-expanded={openKind === group.kind}
                disabled={busy}
                onClick={() => setOpenKind((current) => (current === group.kind ? null : group.kind))}
                className="min-h-9 max-w-full"
              >
                <group.icon size={14} aria-hidden="true" className="shrink-0" />
                <span className="truncate">{picked?.label ?? t(`ui.slurp.postGuide.${group.kind}`)}</span>
              </SlpChip>
            );
          })}
          {deals.map((deal) => (
            <SlpChip
              key={deal.id}
              selected={dealId === deal.id}
              disabled={busy}
              onClick={() => setDealId((current) => (current === deal.id ? null : deal.id))}
              className="min-h-9 max-w-full"
            >
              <Megaphone size={14} aria-hidden="true" className="shrink-0" />
              <span className="truncate">{t("ui.slurp.postGuide.deal", { brand: deal.brand })}</span>
            </SlpChip>
          ))}
          {collabs.map((collab) => (
            <SlpChip
              key={collab.id}
              selected={collabId === collab.id}
              disabled={busy}
              onClick={() => setCollabId((current) => (current === collab.id ? null : collab.id))}
              className="min-h-9 max-w-full"
            >
              <Handshake size={14} aria-hidden="true" className="shrink-0" />
              <span className="truncate">
                {t("ui.slurp.postGuide.collab", {
                  name: nameOf(collab.hostId === accountId ? collab.partnerId : collab.hostId),
                })}
              </span>
            </SlpChip>
          ))}
          <SlpPrimaryButton type="submit" disabled={busy || !idea.trim()} className="ms-auto px-4">
            {pending ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <SlpSparkleGlyph size={16} aria-hidden="true" />
            )}
            {pending ? t("ui.slurp.postGuide.writing") : t("ui.slurp.postGuide.write")}
            <SlpUsesAiMark />
          </SlpPrimaryButton>
        </div>
        {open && (
          <ul
            aria-label={t(`ui.slurp.postGuide.${open.kind}`)}
            className="max-h-44 space-y-1 overflow-y-auto rounded-xl bg-[var(--slurp-surface-raised)] p-1 shadow-[var(--slurp-highlight)]"
          >
            {open.options.length === 0 && (
              <li className={cn(SLP_TYPE.meta, "px-3 py-2.5 text-[var(--slurp-muted)]")}>
                {t(`ui.slurp.postGuide.none.${open.kind}`)}
              </li>
            )}
            {open.options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  aria-pressed={open.selected === option.id}
                  disabled={busy}
                  onClick={() => {
                    open.pick(open.selected === option.id ? null : option.id);
                    setOpenKind(null);
                  }}
                  className={cn(
                    SLP_TYPE.body,
                    "flex min-h-11 w-full items-center rounded-lg px-3 py-2 text-start hover:bg-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--slurp-focus)] disabled:opacity-60",
                    open.selected === option.id && "bg-[var(--slurp-tint)] font-semibold",
                  )}
                >
                  <span className="line-clamp-2 break-words">{option.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>
      {error && (
        <p role="alert" className={cn(SLP_TYPE.meta, "px-2 text-[var(--slurp-danger)]")}>
          {error}
        </p>
      )}
    </section>
  );
}
