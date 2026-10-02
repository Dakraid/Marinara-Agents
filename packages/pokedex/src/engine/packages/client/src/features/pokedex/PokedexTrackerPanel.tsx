import { BookOpen, ChevronDown, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { deletePokedexEntry, fetchPokedexState, removePokedexHaremMember, resolvePokedexPregnancy } from "./api";
import { usePokedexTranslation } from "./localization";
import { PokedexCard, pokedexGenderSymbol, pokedexGlyphRating } from "./PokedexCard";
import type { CapabilityProps, DexEntry, PokedexVault } from "./types";

type Translation = ReturnType<typeof usePokedexTranslation>["t"];

function formatWhen(value: string, t: Translation): string {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return value;
  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (seconds < 60) return t("pokedex.time.justNow");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("pokedex.time.minutesAgo", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("pokedex.time.hoursAgo", { count: hours });
  return t("pokedex.time.daysAgo", { count: Math.floor(hours / 24) });
}

function entryFor(vault: PokedexVault, key: string): DexEntry | null {
  return vault.dex[key] ?? null;
}

export function PokedexTrackerPanel({ props }: { props: CapabilityProps }) {
  const { t } = usePokedexTranslation();
  const chatId = props.chatId ?? "";
  const enabled = props.chatMode === "roleplay" && Boolean(chatId);
  const mobileCompact = props.mobileCompact === true;
  const [collapsed, setCollapsed] = useState(false);
  const [message, setMessage] = useState("");
  const state = useQuery({
    enabled,
    queryKey: ["pokedex", "state", chatId],
    queryFn: () => fetchPokedexState(chatId),
    refetchInterval: 2500,
  });
  const vault = state.data ?? null;
  const entries = vault ? Object.values(vault.dex).sort((a, b) => a.dexNumber - b.dexNumber) : [];
  const encounters = vault ? [...vault.recentEncounters].sort((a, b) => b.at.localeCompare(a.at)) : [];

  const confirm = async (title: string, text: string, confirmLabel: string): Promise<boolean> =>
    props.confirmAction
      ? props.confirmAction({ title, message: text, confirmLabel, tone: "destructive" })
      : window.confirm(text);

  const runCorrection = async (action: () => Promise<unknown>) => {
    setMessage("");
    try {
      await action();
      await state.refetch();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const removeMember = async (key: string, name: string) => {
    const confirmed = await confirm(
      t("pokedex.tracker.removeMemberTitle"),
      t("pokedex.tracker.removeMemberMessage", { name }),
      t("pokedex.tracker.removeMember"),
    );
    if (confirmed) await runCorrection(() => removePokedexHaremMember(chatId, key));
  };

  const markLaid = async (key: string, name: string) => {
    const confirmed = await confirm(
      t("pokedex.tracker.markLaidTitle"),
      t("pokedex.tracker.markLaidMessage", { name }),
      t("pokedex.tracker.markLaid"),
    );
    if (confirmed) await runCorrection(() => resolvePokedexPregnancy(chatId, key));
  };

  const deleteEntry = async (key: string, name: string) => {
    const confirmed = await confirm(
      t("pokedex.tracker.deleteEntryTitle"),
      t("pokedex.tracker.deleteEntryMessage", { name }),
      t("pokedex.tracker.deleteEntry"),
    );
    if (confirmed) await runCorrection(() => deletePokedexEntry(chatId, key));
  };

  if (!enabled) return null;
  const heading = (
    <>
      {!mobileCompact ? (
        <span className="pd-tracker-chevron-frame" aria-hidden="true">
          <ChevronDown className={`pd-tracker-chevron${collapsed ? " pd-tracker-chevron--collapsed" : ""}`} />
        </span>
      ) : null}
      <span className="pd-tracker-icon" aria-hidden="true">
        <BookOpen className="pd-tracker-panel-icon" />
      </span>
      <strong className="pd-tracker-title">{t("pokedex.tracker.title")}</strong>
      {entries.length > 0 ? (
        <span className="pd-tracker-count" aria-hidden="true">
          {t("pokedex.tracker.scanned", { count: entries.length })}
        </span>
      ) : null}
    </>
  );
  return (
    <section
      className={`pd-shell pd-tracker${mobileCompact ? " pd-tracker--mobile-compact" : ""}`}
      aria-label={t("pokedex.tracker.title")}
    >
      {!mobileCompact ? <div className="pd-tracker-veil" aria-hidden="true" /> : null}
      <div className="pd-tracker-content">
        <div className="pd-tracker-header">
          {mobileCompact ? (
            <div className="pd-tracker-toggle pd-tracker-toggle--static">{heading}</div>
          ) : (
            <button
              type="button"
              className="pd-tracker-toggle"
              aria-expanded={!collapsed}
              aria-label={t("pokedex.tracker.title")}
              onClick={() => setCollapsed((value) => !value)}
            >
              {heading}
            </button>
          )}
        </div>
        {mobileCompact || !collapsed ? (
          <div className="pd-tracker-body">
            {state.isPending ? (
              <div className="pd-status" role="status">
                <LoaderCircle className="pd-icon pd-spin" aria-hidden="true" />
                {t("pokedex.tracker.loading")}
              </div>
            ) : state.isError || !vault ? (
              <div className="pd-status pd-status--error" role="alert">
                <span>{state.error instanceof Error ? state.error.message : t("pokedex.tracker.error")}</span>
                <button
                  type="button"
                  className="mari-chrome-control mari-chrome-control--small"
                  aria-label={t("pokedex.error.retry")}
                  onClick={() => void state.refetch()}
                >
                  <RefreshCw className="pd-icon" aria-hidden="true" />
                  {t("pokedex.error.retry")}
                </button>
              </div>
            ) : (
              <>
                <section className="pd-section" aria-labelledby="pd-harem-heading">
                  <h3 className="pd-section-heading" id="pd-harem-heading">
                    {t("pokedex.tracker.harem")}
                  </h3>
                  {vault.harem.length === 0 ? (
                    <p className="pd-empty">{t("pokedex.tracker.haremEmpty")}</p>
                  ) : (
                    <ul className="pd-tree">
                      {vault.harem.map((member) => {
                        const entry = entryFor(vault, member.key);
                        const name = entry?.name ?? member.key;
                        return (
                          <li className="pd-tree-member" key={member.key}>
                            <div className="pd-tree-row">
                              <span className="pd-tree-name">
                                {name}
                                {entry ? ` #${entry.dexNumber}` : ""}
                                {entry ? ` | ${pokedexGenderSymbol(entry.gender)}` : ""}
                              </span>
                              <button
                                type="button"
                                className="mari-chrome-control mari-chrome-control--small pd-action"
                                aria-label={`${t("pokedex.tracker.removeMember")}: ${name}`}
                                onClick={() => void removeMember(member.key, name)}
                              >
                                {t("pokedex.tracker.removeMember")}
                              </button>
                            </div>
                            <div className="pd-tree-sub">
                              {t("pokedex.tracker.relationship")}: {member.relationshipStatus}
                            </div>
                            {entry ? (
                              <div className="pd-tree-sub">
                                {t("pokedex.tracker.affection")}:{" "}
                                {pokedexGlyphRating(entry.affection.rating, "❤️", "💔")} ({entry.affection.state})
                              </div>
                            ) : null}
                            <div className="pd-tree-sub">
                              {t("pokedex.tracker.lastInteraction")}: {member.lastInteraction}
                            </div>
                            <div className="pd-tree-sub">
                              {t("pokedex.tracker.status")}: {member.currentStatus}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
                <section className="pd-section" aria-labelledby="pd-pregnancy-heading">
                  <h3 className="pd-section-heading" id="pd-pregnancy-heading">
                    {t("pokedex.tracker.pregnancy")}
                  </h3>
                  {vault.pregnancies.length === 0 ? (
                    <p className="pd-empty">{t("pokedex.tracker.pregnancyEmpty")}</p>
                  ) : (
                    <ul className="pd-tree">
                      {vault.pregnancies.map((pregnancy) => {
                        const entry = entryFor(vault, pregnancy.key);
                        const name = entry?.name ?? pregnancy.key;
                        return (
                          <li className="pd-tree-member" key={pregnancy.key}>
                            <div className="pd-tree-row">
                              <span className="pd-tree-name">{name}</span>
                              <button
                                type="button"
                                className="mari-chrome-control mari-chrome-control--small pd-action"
                                aria-label={`${t("pokedex.tracker.markLaid")}: ${name}`}
                                onClick={() => void markLaid(pregnancy.key, name)}
                              >
                                {t("pokedex.tracker.markLaid")}
                              </button>
                            </div>
                            <div className="pd-tree-sub">
                              {t("pokedex.tracker.eggsExpected", { count: pregnancy.eggsExpected })} ·{" "}
                              <span title={pregnancy.bredAt}>
                                {t("pokedex.tracker.bred", { when: formatWhen(pregnancy.bredAt, t) })}
                              </span>{" "}
                              · {t("pokedex.tracker.sire", { name: pregnancy.sire })}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
                <section className="pd-section" aria-labelledby="pd-encounters-heading">
                  <h3 className="pd-section-heading" id="pd-encounters-heading">
                    {t("pokedex.tracker.encounters")}
                  </h3>
                  {encounters.length === 0 ? (
                    <p className="pd-empty">{t("pokedex.tracker.encountersEmpty")}</p>
                  ) : (
                    <ul className="pd-tree">
                      {encounters.map((encounter, index) => {
                        const entry = entryFor(vault, encounter.key);
                        const name = entry?.name ?? encounter.key;
                        return (
                          <li className="pd-tree-row" key={`${encounter.key}-${encounter.at}-${index}`}>
                            <span className="pd-tree-name">
                              {name}
                              {entry ? ` #${entry.dexNumber}` : ""}
                            </span>
                            <span className="pd-tree-detail">
                              {t(`pokedex.tracker.outcome.${encounter.outcome}`)} ·{" "}
                              <span title={encounter.at}>{formatWhen(encounter.at, t)}</span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
                <section className="pd-section" aria-labelledby="pd-collection-heading">
                  <h3 className="pd-section-heading" id="pd-collection-heading">
                    {t("pokedex.tracker.collection")}
                  </h3>
                  {entries.length === 0 ? (
                    <p className="pd-empty">{t("pokedex.tracker.collectionEmpty")}</p>
                  ) : (
                    <div className="pd-card-grid">
                      {entries.map((entry) => (
                        <div className="pd-card-frame" key={entry.key}>
                          <PokedexCard entry={entry} />
                          <div className="pd-card-actions">
                            <button
                              type="button"
                              className="mari-chrome-control mari-chrome-control--small pd-icon-button"
                              title={t("pokedex.tracker.deleteEntry")}
                              aria-label={`${t("pokedex.tracker.deleteEntry")}: ${entry.name}`}
                              onClick={() => void deleteEntry(entry.key, entry.name)}
                            >
                              <Trash2 className="pd-icon" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
            {message ? (
              <div className="pd-status" role="status">
                {message}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
