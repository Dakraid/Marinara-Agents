// The role-play Creator sign-up (overnight plan item 7): pick who signs up and how, then play the
// scene while the page fills in beside the chat. "Finish registration" is always there; the old
// wizard stays one tap away as "Quick setup".
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { useTranslation as useUiTranslation } from "react-i18next";
import type { SlpScenePreset } from "../../../../../shared/src/slp/slp-scene.js";
import type { SlpAccount, SlpIdentityDisclosure } from "../../../../../shared/src/slp/slp-social.types.js";
import { cn } from "../../../lib/utils";
import { Avatar, SLP_GROUP_CLASS, SLP_TYPE, useSlpMediaQuery } from "../../base/chrome/SlpChrome";
import { noteSlpAiUseOnce } from "../../modules/chrome/SlpAiMark";
import { SlpPrimaryButton, SlpSegment } from "../../modules/chrome/SlpButton";
import { SlpRadioRow, SlpSheet } from "../../modules/chrome/SlpSheet";
import { SlpWizardFooter, SlpWizardProgress } from "../../modules/chrome/SlpWizardChrome";
import { ChoiceSetting } from "../../modules/settings/SlpSettingsInputs";
import { useSlurpSettings } from "../settings/slp-settings-contract";
import { SlpSceneActions } from "./SlpSceneActions";
import { SlpSceneChat } from "./SlpSceneChat";
import { useSlpSceneModel, type SlpSceneSetup } from "./slp-scene-model";
import { SlpScenePreview } from "./SlpScenePreview";

/** The presets a player can pick today. */
export const SLP_SCENE_OFFERED: readonly SlpScenePreset[] = ["support"];

export function SlpSceneOnboarding({
  accounts,
  connectionId,
  onBack,
  onQuickSetup,
  onFinished,
  onSeeFeed,
}: {
  accounts: readonly SlpAccount[];
  connectionId?: string;
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
  onBack,
  onQuickSetup,
  onStart,
}: {
  accounts: readonly SlpAccount[];
  onBack: () => void;
  onQuickSetup: () => void;
  onStart: (setup: Omit<SlpSceneSetup, "connectionId">) => void;
}) {
  const { t } = useUiTranslation();
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [preset, setPreset] = useState<SlpScenePreset>(SLP_SCENE_OFFERED[0]);
  const [disclosure, setDisclosure] = useState<SlpIdentityDisclosure>("hinted");
  const source = accounts.find((account) => account.id === sourceId) ?? null;
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
        <div
          role="radiogroup"
          aria-label={t("ui.slurp.scene.setup.who")}
          className={cn(SLP_GROUP_CLASS, "divide-y-0 p-1")}
        >
          {accounts.length === 0 && (
            <p className={cn(SLP_TYPE.body, "px-3 py-3 text-[var(--slurp-muted)]")}>
              {t("ui.slurp.scene.setup.nobody")}
            </p>
          )}
          {accounts.map((account) => (
            <SlpRadioRow
              key={account.id}
              name="slp-scene-source"
              checked={account.id === sourceId}
              onChange={() => setSourceId(account.id)}
            >
              <span className="flex min-w-0 items-center gap-2.5 py-1">
                <Avatar account={account} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{account.displayName}</span>
                  <span className={cn(SLP_TYPE.meta, "block truncate text-[var(--slurp-muted)]")}>
                    @{account.handle}
                  </span>
                </span>
              </span>
            </SlpRadioRow>
          ))}
        </div>
        {SLP_SCENE_OFFERED.length > 1 && (
          <ChoiceSetting
            label={t("ui.slurp.scene.setup.how")}
            variant="cards"
            value={preset}
            onChange={setPreset}
            options={SLP_SCENE_OFFERED.map((option) => ({
              value: option,
              label: t(`ui.slurp.scene.preset.${option}.title`),
              detail: t(`ui.slurp.scene.preset.${option}.detail`),
            }))}
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
            disabled={!source}
            onClick={() => {
              if (!source) return;
              noteSlpAiUseOnce(t);
              onStart({ preset, source, disclosureMode: disclosure });
            }}
          >
            {t("ui.slurp.scene.setup.start")}
            <ChevronRight size={16} aria-hidden="true" className="shrink-0 rtl:rotate-180" />
          </SlpPrimaryButton>
        }
        note={source ? "" : t("ui.slurp.scene.setup.pickOne")}
      />
    </>
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
  const hostName = t(`ui.slurp.scene.host.${setup.preset}`);
  const model = useSlpSceneModel(setup, hostName);
  const [pageOpen, setPageOpen] = useState(false);
  const phone = useSlpMediaQuery("(max-width: 639px)");
  const [missingNote, setMissingNote] = useState("");
  useEffect(() => {
    if (model.created) onFinished();
    // Once per page: onFinished marks the first run as done.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.created]);

  const newcomerName = model.draft.displayName || setup.source.displayName;
  const newcomer = { name: newcomerName, avatarUrl: setup.source.avatarUrl, mine: false };
  const host = { name: hostName, avatarUrl: null, mine: setup.preset !== "seat" };
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
      avatarUrl={setup.source.avatarUrl}
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
          <Avatar account={{ displayName: model.created.displayName, avatarUrl: setup.source.avatarUrl }} size="lg" />
          <h3 tabIndex={-1} data-autofocus className={cn(SLP_TYPE.screen, "text-balance outline-none")}>
            {t("ui.slurp.scene.done.title", { name: model.created.displayName })}
          </h3>
          <p className={cn(SLP_TYPE.body, "max-w-sm text-pretty text-[var(--slurp-muted)]")}>
            {t("ui.slurp.scene.done.help", { handle: model.created.handle })}
          </p>
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
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex min-h-0 min-w-0 flex-col">
          {/* Phones: the page as one line on top, the whole page in a sheet. */}
          <button
            type="button"
            onClick={() => setPageOpen(true)}
            className="mb-1 flex min-h-11 items-center gap-2.5 rounded-2xl bg-[var(--slurp-surface-raised)] px-3 py-1.5 text-start shadow-[var(--slurp-shadow-raised),var(--slurp-highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)] sm:hidden"
          >
            <Avatar account={{ displayName: newcomerName, avatarUrl: setup.source.avatarUrl }} size="sm" />
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
            <SlpSceneActions model={model} />
          </SlpSceneChat>
        </div>
        <div className="min-h-0 overflow-y-auto pe-1 max-sm:hidden">{preview(true)}</div>
      </div>
      <SlpSheet open={phone && pageOpen} onClose={() => setPageOpen(false)} title={pageTitle}>
        <div className="px-1 pb-4">{preview(false)}</div>
      </SlpSheet>
      <SlpWizardFooter
        back={{ label: t("ui.noodle.noodlerwizard.back"), onClick: onBack, disabled: model.registering }}
        skip={{ label: t("ui.slurp.scene.quick"), onClick: onQuickSetup, disabled: model.registering }}
        primary={
          <SlpPrimaryButton
            disabled={model.busy}
            onClick={async () => {
              setMissingNote("");
              const missing = await model.finish();
              if (missing?.length) {
                setMissingNote(
                  t("ui.slurp.scene.missing", {
                    list: missing.map((field) => t(`ui.slurp.scene.field.${field}`)).join(", "),
                  }),
                );
                if (phone) setPageOpen(true);
              }
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
