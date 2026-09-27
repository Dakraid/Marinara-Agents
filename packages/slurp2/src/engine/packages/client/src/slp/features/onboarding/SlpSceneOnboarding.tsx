// The role-play Creator sign-up (overnight plan item 7): pick who signs up and how, then play the
// scene while the page fills in beside the chat. "Finish registration" is always there; the old
// wizard stays one tap away as "Quick setup".
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { useTranslation as useUiTranslation } from "react-i18next";
import type { SlpScenePreset } from "../../../../../shared/src/slp/slp-scene.js";
import type { SlpAccount, SlpIdentityDisclosure } from "../../../../../shared/src/slp/slp-social.types.js";
import { cn } from "../../../lib/utils";
import { Avatar, SLP_GROUP_CLASS, SLP_TYPE, useSlpMediaQuery } from "../../base/chrome/SlpChrome";
import { noteSlpAiUseOnce } from "../../modules/chrome/SlpAiMark";
import { playSlpBurst } from "../../modules/sparkle/SlpSparkle";
import { SlpChip, SlpPrimaryButton, SlpSegment } from "../../modules/chrome/SlpButton";
import { SlpRadioRow, SlpSheet } from "../../modules/chrome/SlpSheet";
import { SlpWizardFooter, SlpWizardProgress } from "../../modules/chrome/SlpWizardChrome";
import { ChoiceSetting } from "../../modules/settings/SlpSettingsInputs";
import { useCreatorAccounts } from "../creators/slp-creators-contract";
import { useSlurpSettings } from "../settings/slp-settings-contract";
import { SlpSceneActions } from "./SlpSceneActions";
import { SlpSceneChat } from "./SlpSceneChat";
import { useSlpSceneModel, type SlpSceneSetup } from "./slp-scene-model";
import { SlpScenePreview } from "./SlpScenePreview";
import { SlpSceneShoot } from "./SlpSceneShoot";

/** The presets a player can pick today. */
export const SLP_SCENE_OFFERED: readonly SlpScenePreset[] = ["friend", "support", "seat"];

type SlpScenePerson = Pick<SlpAccount, "id" | "displayName" | "handle" | "avatarUrl">;

export function SlpSceneOnboarding({
  accounts,
  connectionId,
  defaultDisclosure = "hinted",
  onBack,
  onQuickSetup,
  onFinished,
  onSeeFeed,
}: {
  accounts: readonly SlpAccount[];
  connectionId?: string;
  /** The page-name choice from the welcome, as the first pick. */
  defaultDisclosure?: SlpIdentityDisclosure;
  onBack: () => void;
  onQuickSetup: () => void;
  onFinished: () => void;
  onSeeFeed: () => void;
}) {
  const [setup, setSetup] = useState<SlpSceneSetup | null>(null);
  const [session, setSession] = useState(0);
  if (!setup) {
    return (
      <SceneSetup
        accounts={accounts}
        defaultDisclosure={defaultDisclosure}
        onBack={onBack}
        onQuickSetup={onQuickSetup}
        onStart={(next) => {
          setSetup({ ...next, ...(connectionId ? { connectionId } : {}) });
          setSession((value) => value + 1);
        }}
      />
    );
  }
  return (
    <SceneStage
      key={session}
      setup={setup}
      onBack={() => setSetup(null)}
      onQuickSetup={onQuickSetup}
      onFinished={onFinished}
      onSeeFeed={onSeeFeed}
      onAnother={() => setSetup(null)}
    />
  );
}

function SceneSetup({
  accounts,
  defaultDisclosure,
  onBack,
  onQuickSetup,
  onStart,
}: {
  accounts: readonly SlpAccount[];
  defaultDisclosure: SlpIdentityDisclosure;
  onBack: () => void;
  onQuickSetup: () => void;
  onStart: (setup: Omit<SlpSceneSetup, "connectionId">) => void;
}) {
  const { t } = useUiTranslation();
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [preset, setPreset] = useState<SlpScenePreset>(SLP_SCENE_OFFERED[0]);
  const [disclosure, setDisclosure] = useState<SlpIdentityDisclosure>(defaultDisclosure);
  const [helperId, setHelperId] = useState<string | null>(null);
  // The creator seat needs somebody already on Slurp to do the helping.
  const creators = useCreatorAccounts().data ?? [];
  const offered = SLP_SCENE_OFFERED.filter((option) => option !== "seat" || creators.length > 0);
  const source = accounts.find((account) => account.id === sourceId) ?? null;
  const helper = preset === "seat" ? (creators.find((creator) => creator.id === helperId) ?? null) : null;
  const reason = !source
    ? t("ui.slurp.scene.setup.pickOne")
    : preset === "seat" && !helper
      ? t("ui.slurp.scene.setup.pickHelper")
      : "";
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4 max-sm:py-2.5">
        <div>
          <h3 tabIndex={-1} data-autofocus className={cn(SLP_TYPE.screen, "text-balance outline-none")}>
            {t("ui.slurp.scene.setup.title")}
          </h3>
          <p className={cn(SLP_TYPE.body, "mt-1 text-pretty text-[var(--slurp-muted)]")}>
            {t("ui.slurp.scene.setup.help")}
          </p>
        </div>
        <PickList
          label={t("ui.slurp.scene.setup.who")}
          name="slp-scene-source"
          people={accounts}
          value={sourceId}
          onChange={setSourceId}
          empty={t("ui.slurp.scene.setup.nobody")}
        />
        {offered.length > 1 && (
          <ChoiceSetting
            label={t("ui.slurp.scene.setup.how")}
            variant="cards"
            value={preset}
            onChange={setPreset}
            options={offered.map((option) => ({
              value: option,
              label: t(`ui.slurp.scene.preset.${option}.title`),
              detail: t(`ui.slurp.scene.preset.${option}.detail`),
            }))}
          />
        )}
        {preset === "seat" && (
          <PickList
            label={t("ui.slurp.scene.setup.helper")}
            name="slp-scene-helper"
            people={creators}
            value={helperId}
            onChange={setHelperId}
            heading
          />
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className={cn(SLP_TYPE.body, "font-semibold")}>{t("ui.slurp.scene.setup.identity")}</p>
            <p className={cn(SLP_TYPE.meta, "text-pretty text-[var(--slurp-muted)]")}>
              {t(`ui.slurp.scene.setup.identity.${disclosure === "open" ? "open" : "hinted"}`)}
            </p>
          </div>
          <SlpSegment
            label={t("ui.slurp.scene.setup.identity")}
            value={disclosure === "open" ? "open" : "hinted"}
            onChange={setDisclosure}
            options={(["hinted", "open"] as const).map((option) => ({
              value: option,
              label: t(`ui.noodle.noodlerwizard.disclosure.${option}.title`),
            }))}
          />
        </div>
      </div>
      <SlpWizardFooter
        back={{ label: t("ui.noodle.noodlerwizard.back"), onClick: onBack }}
        skip={{ label: t("ui.slurp.scene.quick"), onClick: onQuickSetup }}
        primary={
          <SlpPrimaryButton
            disabled={Boolean(reason)}
            onClick={() => {
              if (!source || reason) return;
              noteSlpAiUseOnce(t);
              onStart({ preset, source, helper, disclosureMode: disclosure });
            }}
          >
            {t("ui.slurp.scene.setup.start")}
            <ChevronRight size={16} aria-hidden="true" className="shrink-0 rtl:rotate-180" />
          </SlpPrimaryButton>
        }
        note={reason}
      />
    </>
  );
}

/** One pick out of a list of people (who signs up, who helps), as radio rows with avatars. */
function PickList({
  label,
  name,
  people,
  value,
  onChange,
  empty,
  heading = false,
}: {
  label: string;
  name: string;
  people: readonly SlpScenePerson[];
  value: string | null;
  onChange: (id: string) => void;
  empty?: string;
  heading?: boolean;
}) {
  return (
    <div>
      {heading && <p className={cn(SLP_TYPE.body, "mb-1.5 font-semibold")}>{label}</p>}
      <div role="radiogroup" aria-label={label} className={cn(SLP_GROUP_CLASS, "divide-y-0 p-1")}>
        {people.length === 0 && empty && (
          <p className={cn(SLP_TYPE.body, "px-3 py-3 text-[var(--slurp-muted)]")}>{empty}</p>
        )}
        {people.map((person) => (
          <SlpRadioRow key={person.id} name={name} checked={person.id === value} onChange={() => onChange(person.id)}>
            <span className="flex min-w-0 items-center gap-2.5 py-1">
              <Avatar account={person} size="sm" />
              <span className="min-w-0">
                <span className="block truncate font-semibold">{person.displayName}</span>
                <span className={cn(SLP_TYPE.meta, "block truncate text-[var(--slurp-muted)]")}>@{person.handle}</span>
              </span>
            </span>
          </SlpRadioRow>
        ))}
      </div>
    </div>
  );
}

function SceneStage({
  setup,
  onBack,
  onQuickSetup,
  onFinished,
  onSeeFeed,
  onAnother,
}: {
  setup: SlpSceneSetup;
  onBack: () => void;
  onQuickSetup: () => void;
  onFinished: () => void;
  onSeeFeed: () => void;
  onAnother: () => void;
}) {
  const { t } = useUiTranslation();
  const settings = useSlurpSettings();
  const allowedTags = useMemo(
    () => settings.data?.discoveryTags.map((entry) => entry.tag) ?? [],
    [settings.data?.discoveryTags],
  );
  const hostName = setup.helper?.displayName ?? t(`ui.slurp.scene.host.${setup.preset}`);
  const model = useSlpSceneModel(setup, hostName);
  const [pageOpen, setPageOpen] = useState(false);
  const phone = useSlpMediaQuery("(max-width: 639px)");
  const [missingNote, setMissingNote] = useState("");
  const liveRef = useRef<HTMLDivElement | null>(null);
  // Closing the dialog after the photo shoot still finishes the page (step 10 answer): limits line,
  // first post, kept chat and the first run marked done. No half-registered Creators.
  const latest = useRef({ model, onFinished });
  latest.current = { model, onFinished };
  useEffect(
    () => () => {
      const { model: last, onFinished: done } = latest.current;
      if (!last.accountId || last.created || last.registering) return;
      void last.finishOnClose().then((finished) => finished && done());
    },
    [],
  );
  useEffect(() => {
    if (!model.created) return;
    // A page going live is a reward moment: a Burst off the new photo.
    if (liveRef.current) playSlpBurst(liveRef.current, 12);
    onFinished();
    // Once per page: onFinished marks the first run as done.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.created]);

  const newcomerName = model.draft.displayName || setup.source.displayName;
  // After the photo shoot the page wears its new photo everywhere.
  const newcomerAvatar = model.photos.avatarUrl ?? setup.source.avatarUrl;
  const newcomer = { name: newcomerName, avatarUrl: newcomerAvatar, mine: false };
  const showMissing = (missing: string[]) => {
    setMissingNote(
      t("ui.slurp.scene.missing", {
        list: missing.map((field) => t(`ui.slurp.scene.field.${field}`)).join(", "),
      }),
    );
    if (phone) setPageOpen(true);
  };
  // In the seat the helper talks; the player only whispers, so both speakers sit on the left.
  const host = { name: hostName, avatarUrl: setup.helper?.avatarUrl ?? null, mine: setup.preset !== "seat" };
  const lastPatch = [...model.items].reverse().find((item) => item.kind === "patch");
  const recent =
    lastPatch?.kind === "patch" && !model.chips.find((chip) => chip.id === lastPatch.chipId)?.undone
      ? lastPatch.fields
      : [];
  const fixed = setup.disclosureMode === "open" ? (["displayName", "handle"] as const) : [];
  const momentIndex = model.moments.indexOf(model.moment);
  const pageTitle = t(`ui.slurp.scene.page.title.${setup.preset === "support" ? "support" : "page"}`);
  const preview = (heading: boolean) => (
    <SlpScenePreview
      title={pageTitle}
      heading={heading}
      draft={model.draft}
      locked={model.locked}
      fixed={fixed}
      recent={recent}
      allowedTags={allowedTags}
      avatarUrl={newcomerAvatar}
      bannerUrl={model.photos.bannerUrl}
      updating={model.updating}
      onUpdatePage={() => void model.updatePage()}
      onEdit={model.edit}
      onToggleLock={model.toggleLock}
    />
  );

  if (model.created) {
    return (
      <>
        <div className="my-auto flex flex-col items-center gap-3 py-6 text-center">
          <div ref={liveRef}>
            <Avatar account={{ displayName: model.created.displayName, avatarUrl: newcomerAvatar }} size="lg" />
          </div>
          <h3 tabIndex={-1} data-autofocus className={cn(SLP_TYPE.screen, "text-balance outline-none")}>
            {t("ui.slurp.scene.done.title", { name: model.created.displayName })}
          </h3>
          <p className={cn(SLP_TYPE.body, "max-w-sm text-pretty text-[var(--slurp-muted)]")}>
            {t("ui.slurp.scene.done.help", { handle: model.created.handle })}
          </p>
          {model.created.kept && (
            <p className={cn(SLP_TYPE.meta, "max-w-sm text-pretty text-[var(--slurp-muted)]")}>
              {t("ui.slurp.scene.done.kept", { name: model.created.displayName })}
            </p>
          )}
        </div>
        <SlpWizardFooter
          skip={{ label: t("ui.slurp.scene.done.another"), onClick: onAnother }}
          primary={<SlpPrimaryButton onClick={onSeeFeed}>{t("ui.slurp.scene.done.feed")}</SlpPrimaryButton>}
        />
      </>
    );
  }

  const status = model.registering
    ? t("ui.slurp.scene.registering")
    : model.updating
      ? t("ui.slurp.scene.updating")
      : missingNote;
  return (
    <>
      <SlpWizardProgress
        current={momentIndex + 1}
        total={model.moments.length}
        stepOf={t(`ui.slurp.scene.progress.${setup.preset === "support" ? "support" : "moment"}`, {
          current: momentIndex + 1,
          total: model.moments.length,
        })}
        label={t(`ui.slurp.scene.moment.${model.moment}`)}
      />
      {/* Support asks in order; the other roles can skip, go back or linger in any moment. */}
      {setup.preset !== "support" && (
        <div
          role="toolbar"
          aria-label={t("ui.slurp.scene.momentsLabel")}
          className="-mx-1 -mt-1 flex gap-1 overflow-x-auto px-1 pb-2 [scrollbar-width:none]"
        >
          {model.moments.map((entry) => (
            <SlpChip
              key={entry}
              selected={entry === model.moment}
              aria-current={entry === model.moment ? "step" : undefined}
              disabled={model.busy}
              className="min-h-8 shrink-0 whitespace-nowrap px-2.5 text-xs"
              onClick={() => model.goTo(entry)}
            >
              {model.doneMoments.includes(entry) && <Check size={12} aria-hidden="true" />}
              {t(`ui.slurp.scene.moment.${entry}`)}
            </SlpChip>
          ))}
        </div>
      )}
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex min-h-0 min-w-0 flex-col">
          {/* Phones: the page as one line on top, the whole page in a sheet. */}
          <button
            type="button"
            onClick={() => setPageOpen(true)}
            className="mb-1 flex min-h-11 items-center gap-2.5 rounded-2xl bg-[var(--slurp-surface-raised)] px-3 py-1.5 text-start shadow-[var(--slurp-shadow-raised),var(--slurp-highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)] sm:hidden"
          >
            <Avatar account={{ displayName: newcomerName, avatarUrl: newcomerAvatar }} size="sm" />
            <span className="min-w-0 flex-1">
              <span className={cn(SLP_TYPE.body, "block truncate font-semibold")}>
                {model.draft.displayName || t("ui.slurp.scene.page.noName")}
              </span>
              <span className={cn(SLP_TYPE.meta, "block truncate text-[var(--slurp-muted)]")}>
                {recent.length
                  ? t("ui.slurp.scene.patch", {
                      fields: recent.map((field) => t(`ui.slurp.scene.field.${field}`)).join(", "),
                    })
                  : `@${model.draft.handle || t("ui.slurp.scene.page.noHandle")}`}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-0.5 text-xs font-bold text-[var(--slurp-ink)]">
              {pageTitle}
              <ChevronRight size={14} aria-hidden="true" className="rtl:rotate-180" />
            </span>
          </button>
          <SlpSceneChat
            model={model}
            host={host}
            newcomer={newcomer}
            placeholder={t(`ui.slurp.scene.composer.${setup.preset}`, { name: hostName })}
          >
            {model.moment === "shoot" && <SlpSceneShoot model={model} onMissing={showMissing} />}
            <SlpSceneActions model={model} />
          </SlpSceneChat>
        </div>
        <div className="min-h-0 overflow-y-auto pe-1 max-sm:hidden">{preview(true)}</div>
      </div>
      <SlpSheet open={phone && pageOpen} onClose={() => setPageOpen(false)} title={pageTitle}>
        <div className="px-1 pb-4">{preview(false)}</div>
      </SlpSheet>
      <SlpWizardFooter
        // Once the page is saved (the photo shoot does that), leaving would strand a half-registered
        // Creator with no limits, first post or kept chat: from here the way out is Finish.
        back={
          model.accountId
            ? undefined
            : { label: t("ui.noodle.noodlerwizard.back"), onClick: onBack, disabled: model.registering }
        }
        skip={
          model.accountId
            ? undefined
            : { label: t("ui.slurp.scene.quick"), onClick: onQuickSetup, disabled: model.registering }
        }
        primary={
          <SlpPrimaryButton
            disabled={model.busy}
            onClick={async () => {
              setMissingNote("");
              const missing = await model.finish();
              if (missing?.length) showMissing(missing);
            }}
          >
            {model.registering && <Loader2 size={16} aria-hidden="true" className="animate-spin" />}
            {t("ui.slurp.scene.finish")}
          </SlpPrimaryButton>
        }
        note={status}
      />
    </>
  );
}
