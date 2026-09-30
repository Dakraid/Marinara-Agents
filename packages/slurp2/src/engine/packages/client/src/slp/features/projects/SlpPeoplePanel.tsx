import { useState } from "react";
import { ChevronDown, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/utils";
import { Avatar, SLP_EYEBROW_CLASS, SLP_TYPE } from "../../base/chrome/SlpChrome";
import { SlpButton, SlpChip, SlpPrimaryButton, SlpSegment, slpTagClass } from "../../modules/chrome/SlpButton";
import { SlpCreatorChips } from "../../modules/chrome/SlpCreatorChips";
import { SlpEgoMap, type SlpEgoSpoke } from "../../modules/creator/SlpEgoMap";
import { formatRelativeTime } from "../../base/ui/slp-date-time";
import { errorMessage } from "../../modules/settings/slp-backstage-format";
import { useSlurpTies, useSlurpTiesMutations, type SlurpTiesBondKind } from "./slp-ties-hooks";
import {
  SLP_PEOPLE_EDGE_KINDS,
  slpBusiestCreator,
  slpEgoTies,
  slpPeopleEdges,
  type SlpPeopleEdge,
  type SlpPeopleEdgeKind,
} from "./slp-people-map";

/** One theme color per kind of tie, for the line, the ring and the legend. */
const KIND_COLOR: Record<SlpPeopleEdgeKind, string> = {
  couple: "var(--noodle-accent)",
  crush: "var(--slurp-coral)",
  ex: "var(--slurp-muted)",
  rival: "var(--slurp-danger)",
  roommate: "var(--slurp-violet)",
  friend: "var(--slurp-success)",
  coworker: "var(--slurp-warm)",
  collab: "var(--slurp-warning)",
};
const BOND_KINDS: readonly SlurpTiesBondKind[] = ["friend", "roommate", "coworker", "ex"];

/**
 * Who is what to whom (Drama, People map): pick a Creator, see their people around them, tap one to
 * move them to the middle, and open any tie to read why it exists. Friends, roommates, coworkers and
 * exes can be set or ended here; couples, rivalries and collabs are steered in their own panels.
 */
export function SlpPeoplePanel({ personaId }: { personaId: string }) {
  const { t, i18n } = useTranslation();
  const query = useSlurpTies(personaId);
  const actions = useSlurpTiesMutations(personaId);
  const [centerId, setCenterId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState<{ otherId: string | null; kind: SlurpTiesBondKind; level: number }>({
    otherId: null,
    kind: "friend",
    level: 1,
  });
  const view = query.data;
  if (query.isError)
    return <p className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>{t("ui.slurp.ties.loadFailed")}</p>;
  if (!view) return <p className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>{t("ui.slurp.settings.loading")}</p>;

  const people = view.creators.filter((creator) => !creator.couplePage);
  const byId = new Map(people.map((creator) => [creator.id, creator]));
  const edges = slpPeopleEdges(view).filter((edge) => byId.has(edge.aId) && byId.has(edge.bId));
  const center =
    byId.get(centerId ?? "") ??
    byId.get(
      slpBusiestCreator(
        edges,
        people.map((creator) => creator.id),
      ) ?? "",
    ) ??
    null;
  if (!center)
    return <p className={cn(SLP_TYPE.body, "text-[var(--slurp-muted)]")}>{t("ui.slurp.people.noCreators")}</p>;
  const ties = slpEgoTies(edges, center.id).filter((tie) => byId.has(tie.otherId));
  const open = ties.find((tie) => tie.otherId === openId) ?? null;
  const onError = (error: unknown) => toast.error(errorMessage(error));
  const when = (at: string) => formatRelativeTime(at, i18n.language);
  const kindLabel = (edge: SlpPeopleEdge) =>
    edge.kind === "friend" ? t(`ui.slurp.people.friendLevel.${edge.level}`) : t(`ui.slurp.people.kind.${edge.kind}`);

  const spokes: SlpEgoSpoke[] = ties.map(({ otherId, edges: list }) => {
    const main = list[0]!;
    return {
      node: { id: otherId, name: byId.get(otherId)!.name, avatarUrl: byId.get(otherId)!.avatarUrl },
      color: KIND_COLOR[main.kind],
      closeness: main.level,
      dash: main.temperature === "warm" ? undefined : main.temperature,
      label: list.map(kindLabel).join(", "),
    };
  });

  const add = () =>
    adding.otherId &&
    actions.setBond.mutate(
      {
        aId: center.id,
        bId: adding.otherId,
        kind: adding.kind,
        level: adding.kind === "friend" ? adding.level : undefined,
      },
      {
        onSuccess: () => {
          setAdding((current) => ({ ...current, otherId: null }));
          toast.success(t("ui.slurp.people.added"));
        },
        onError,
      },
    );

  return (
    <div data-slurp-people className="flex flex-col gap-5">
      <p className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>{t("ui.slurp.people.intro")}</p>
      <SlpCreatorChips
        creators={people}
        picked={[center.id]}
        onToggle={(id) => setCenterId(id)}
        label={t("ui.slurp.people.pickCenter")}
      />
      <SlpEgoMap
        center={{ id: center.id, name: center.name, avatarUrl: center.avatarUrl }}
        spokes={spokes}
        onPick={setCenterId}
        label={t("ui.slurp.people.mapLabel", { name: center.name })}
      />
      {!ties.length && (
        <p className={cn(SLP_TYPE.body, "text-center text-[var(--slurp-muted)]")}>
          {t("ui.slurp.people.empty", { name: center.name })}
        </p>
      )}
      <Legend />

      {ties.length > 0 && (
        <section className="space-y-2" aria-label={t("ui.slurp.people.listTitle", { name: center.name })}>
          <h4 className={cn(SLP_EYEBROW_CLASS, "px-1")}>{t("ui.slurp.people.listTitle", { name: center.name })}</h4>
          <ul className="divide-y divide-[var(--noodle-divider)]">
            {ties.map(({ otherId, edges: list }) => {
              const other = byId.get(otherId)!;
              return (
                <li key={otherId}>
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === otherId ? null : otherId)}
                    aria-expanded={openId === otherId}
                    className="flex min-h-11 w-full min-w-0 items-center gap-3 rounded-xl py-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)]"
                  >
                    <Avatar account={{ displayName: other.name, avatarUrl: other.avatarUrl }} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className={cn(SLP_TYPE.body, "block font-semibold [overflow-wrap:anywhere]")}>
                        {other.name}
                      </span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        {list.map((edge) => (
                          <span key={edge.id} className={slpTagClass()}>
                            <Dot color={KIND_COLOR[edge.kind]} />
                            {kindLabel(edge)}
                            {edge.temperature !== "warm" &&
                              ` · ${t(`ui.slurp.people.temperature.${edge.temperature}`)}`}
                          </span>
                        ))}
                      </span>
                    </span>
                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                      className={cn("shrink-0 text-[var(--slurp-muted)]", openId === otherId && "rotate-180")}
                    />
                  </button>
                  {open?.otherId === otherId && (
                    <div className="flex flex-col gap-4 pb-3 ps-11" data-slurp-people-tie>
                      {open.edges.map((edge) => (
                        <TieDetail
                          key={edge.id}
                          edge={edge}
                          title={kindLabel(edge)}
                          name={(id) => byId.get(id)?.name ?? t("ui.slurp.ties.someone")}
                          when={when}
                          busy={actions.setBond.isPending || actions.endBond.isPending}
                          onLevel={(level) =>
                            edge.source.type === "bond" &&
                            actions.setBond.mutate(
                              { aId: edge.aId, bId: edge.bId, kind: edge.source.bond.kind, level },
                              { onError },
                            )
                          }
                          onEnd={() =>
                            edge.source.type === "bond" &&
                            actions.endBond.mutate(edge.source.bond.id, {
                              onSuccess: () => toast.success(t("ui.slurp.people.ended")),
                              onError,
                            })
                          }
                        />
                      ))}
                      <SlpButton
                        variant="quiet"
                        onClick={() => {
                          setCenterId(otherId);
                          setOpenId(null);
                        }}
                        className="min-h-11 w-full sm:w-auto"
                      >
                        {t("ui.slurp.people.center", { name: other.name })}
                      </SlpButton>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="space-y-3" aria-label={t("ui.slurp.people.addTitle", { name: center.name })}>
        <h4 className={cn(SLP_EYEBROW_CLASS, "px-1")}>{t("ui.slurp.people.addTitle", { name: center.name })}</h4>
        <SlpCreatorChips
          creators={people.filter((creator) => creator.id !== center.id)}
          picked={adding.otherId ? [adding.otherId] : []}
          onToggle={(id) => setAdding((current) => ({ ...current, otherId: current.otherId === id ? null : id }))}
          label={t("ui.slurp.people.addWho")}
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("ui.slurp.people.addKind")}>
          {BOND_KINDS.map((kind) => (
            <SlpChip
              key={kind}
              selected={adding.kind === kind}
              onClick={() => setAdding((current) => ({ ...current, kind }))}
            >
              {t(`ui.slurp.people.kind.${kind}`)}
            </SlpChip>
          ))}
        </div>
        {adding.kind === "friend" && (
          <LevelPick value={adding.level} onChange={(level) => setAdding((current) => ({ ...current, level }))} />
        )}
        <SlpPrimaryButton
          disabled={!adding.otherId || actions.setBond.isPending}
          onClick={add}
          className="min-h-11 w-full px-4 text-sm sm:w-auto"
        >
          <UserPlus size={16} aria-hidden="true" />
          {adding.otherId ? t("ui.slurp.people.add") : t("ui.slurp.people.addPick")}
        </SlpPrimaryButton>
      </section>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span aria-hidden="true" className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
  );
}

function Legend() {
  const { t } = useTranslation();
  return (
    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1" aria-label={t("ui.slurp.people.legend")}>
      {SLP_PEOPLE_EDGE_KINDS.map((kind) => (
        <li key={kind} className={cn(SLP_TYPE.meta, "flex items-center gap-1.5 text-[var(--slurp-muted)]")}>
          <Dot color={KIND_COLOR[kind]} />
          {t(`ui.slurp.people.kind.${kind}`)}
        </li>
      ))}
    </ul>
  );
}

function LevelPick({ value, onChange }: { value: number; onChange: (level: number) => void }) {
  const { t } = useTranslation();
  return (
    <SlpSegment
      label={t("ui.slurp.people.level")}
      options={[0, 1, 2, 3].map((level) => ({
        value: String(level),
        label: t(`ui.slurp.people.friendLevel.${level}`),
      }))}
      value={String(value)}
      onChange={(level) => onChange(Number(level))}
      className="flex-wrap"
    />
  );
}

/** One tie between the two: what it is, since when, and its history in plain lines. */
function TieDetail({
  edge,
  title,
  name,
  when,
  busy,
  onLevel,
  onEnd,
}: {
  edge: SlpPeopleEdge;
  title: string;
  name: (id: string) => string;
  when: (at: string) => string;
  busy: boolean;
  onLevel: (level: number) => void;
  onEnd: () => void;
}) {
  const { t } = useTranslation();
  const lines = historyLines(edge, t, name);
  return (
    <section className="space-y-2">
      <h5 className={cn(SLP_TYPE.body, "flex items-center gap-2 font-semibold")}>
        <Dot color={KIND_COLOR[edge.kind]} />
        {title}
        <span className={cn(SLP_TYPE.meta, "font-normal text-[var(--slurp-muted)]")}>
          {t(`ui.slurp.people.temperature.${edge.temperature}`)} ·{" "}
          {t("ui.slurp.people.since", { when: when(edge.since) })}
        </span>
      </h5>
      {lines.length > 0 && (
        <ol className="space-y-1 border-s border-[var(--noodle-divider)] ps-3">
          {lines.map((line, index) => (
            <li key={index} className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)] [overflow-wrap:anywhere]")}>
              <span className="text-[var(--slurp-text)]">{line.text}</span>
              {line.at && ` · ${when(line.at)}`}
            </li>
          ))}
        </ol>
      )}
      {edge.source.type === "bond" ? (
        <div className="flex flex-col gap-2">
          {edge.source.bond.kind === "friend" && <LevelPick value={edge.level} onChange={onLevel} />}
          {edge.source.bond.locked && (
            <p className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>{t("ui.slurp.people.locked")}</p>
          )}
          <SlpButton variant="danger" disabled={busy} onClick={onEnd} className="min-h-11 w-full sm:w-auto">
            {t(`ui.slurp.people.end.${edge.source.bond.kind}`)}
          </SlpButton>
        </div>
      ) : (
        <p className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>
          {t(`ui.slurp.people.steerElsewhere.${edge.source.type}`)}
        </p>
      )}
    </section>
  );
}

type T = ReturnType<typeof useTranslation>["t"];

/** Why the tie exists, oldest first, in the world's words. */
function historyLines(edge: SlpPeopleEdge, t: T, name: (id: string) => string): { text: string; at?: string }[] {
  const source = edge.source;
  if (source.type === "bond")
    return source.bond.notes.map((entry) => ({
      text: t(`ui.slurp.people.note.${entry.code}`, { detail: entry.detail ?? "" }),
      at: entry.at,
    }));
  if (source.type === "couple")
    return source.couple.moments.slice(-6).map((moment) => ({
      text:
        moment.kind === "jealous" && moment.withId
          ? t("ui.slurp.ties.moment.jealousCollab", { name: name(moment.withId) })
          : moment.kind === "joined" && moment.withId
            ? t("ui.slurp.ties.moment.joined", { name: name(moment.withId) })
            : t(`ui.slurp.ties.moment.${moment.kind}`, { detail: moment.detail }),
      at: moment.at,
    }));
  if (source.type === "rival")
    return [
      {
        text: t("ui.slurp.ties.rivalry.cause", {
          b: name(source.rivalry.toId),
          cause: source.rivalry.cause,
        }),
      },
      {
        text: t(`ui.slurp.ties.rivalry.${source.rivalry.stage}`, {
          a: name(source.rivalry.fromId),
          b: name(source.rivalry.toId),
        }),
        at: source.rivalry.stageAt,
      },
    ];
  return [{ text: source.collab.idea, at: source.collab.askedAt }];
}
