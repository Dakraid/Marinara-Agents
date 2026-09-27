import { useCallback, useEffect, useRef, useState } from "react";
import {
  SLP_SCENE_MOMENTS,
  SLP_SCENE_TRANSCRIPT_MAX,
  type SlpSceneAction,
  type SlpSceneDraft,
  type SlpSceneField,
  type SlpSceneLine,
  type SlpSceneMoment,
  type SlpScenePatch,
  type SlpScenePreset,
} from "../../../../../shared/src/slp/slp-scene.js";
import type { SlpAccount, SlpIdentityDisclosure } from "../../../../../shared/src/slp/slp-social.types.js";
import { generateClientId } from "../../../lib/utils";
import {
  useCreateCreatorStageProfile,
  useGenerateCreatorStageProfileDraft,
  useUpdateCreatorStrategy,
} from "../creators/slp-creators-contract";
import {
  applySlpScenePatch,
  editSlpSceneField,
  slpSceneInitialState,
  slpSceneLimitsText,
  slpSceneMissing,
  slpSceneRedraftPatch,
  slpSceneStageProfile,
  toggleSlpSceneLock,
  undoSlpSceneChip,
  type SlpSceneDraftState,
} from "./slp-scene-draft";
import { useEnqueueCreatorFirstPosts } from "./slp-first-post-hooks";
import { useSlpSceneTurn } from "./slp-scene-hooks";

export type SlpSceneItem =
  | { id: string; kind: "line"; speaker: SlpSceneLine["speaker"]; text: string }
  | { id: string; kind: "patch"; chipId: string; fields: SlpSceneField[]; redraft: boolean }
  | { id: string; kind: "note"; text: string };

export type SlpSceneSetup = {
  preset: SlpScenePreset;
  source: Pick<SlpAccount, "id" | "displayName" | "handle" | "avatarUrl">;
  disclosureMode: SlpIdentityDisclosure;
  connectionId?: string;
};

/** What the transcript sends back: the lines only, newest last, capped. */
export function slpSceneTranscript(items: readonly SlpSceneItem[]): SlpSceneLine[] {
  return items
    .flatMap((item) => (item.kind === "line" ? [{ speaker: item.speaker, text: item.text }] : []))
    .slice(-SLP_SCENE_TRANSCRIPT_MAX);
}

/** The chat as guidance for a full redraft: newest lines first win the 2000 characters. */
export function slpSceneGuidance(items: readonly SlpSceneItem[], hostLabel: string, direction: string): string {
  const lines = slpSceneTranscript(items).map(
    (line) => `${line.speaker === "host" ? hostLabel : "Newcomer"}: ${line.text}`,
  );
  const head = [
    "Build the page from what the newcomer said in this sign-up chat. Keep their words and taste.",
    direction ? `Direction: ${direction}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const kept: string[] = [];
  let length = head.length;
  for (const line of lines.reverse()) {
    if (length + line.length + 1 > 1990) break;
    kept.unshift(line);
    length += line.length + 1;
  }
  return [head, ...kept].join("\n");
}

/**
 * The role-play sign-up's whole working state: the chat, the live page draft with its locks and
 * chips, the current moment, and the actions (say, update page, finish).
 */
export function useSlpSceneModel(setup: SlpSceneSetup, hostLabel: string) {
  const moments = SLP_SCENE_MOMENTS[setup.preset] as readonly SlpSceneMoment[];
  const open = setup.disclosureMode === "open";
  const [items, setItems] = useState<SlpSceneItem[]>([]);
  const [draftState, setDraftState] = useState<SlpSceneDraftState>(() =>
    slpSceneInitialState(
      open ? { displayName: setup.source.displayName, handle: setup.source.handle } : {},
      // An open page keeps its public name: nothing may patch it.
      open ? ["displayName", "handle"] : [],
    ),
  );
  const draftRef = useRef(draftState);
  const [moment, setMoment] = useState<SlpSceneMoment>(moments[0]);
  const [doneMoments, setDoneMoments] = useState<SlpSceneMoment[]>([]);
  const [direction, setDirection] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; displayName: string; handle: string } | null>(null);
  const turn = useSlpSceneTurn();
  const redraft = useGenerateCreatorStageProfileDraft();
  const create = useCreateCreatorStageProfile();
  const strategy = useUpdateCreatorStrategy();
  const firstPost = useEnqueueCreatorFirstPosts();
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const commit = useCallback((next: SlpSceneDraftState) => {
    draftRef.current = next;
    setDraftState(next);
  }, []);
  const applyPatch = useCallback(
    (patch: SlpScenePatch, redrafted: boolean): SlpSceneItem | null => {
      const chipId = generateClientId();
      const { state, chip } = applySlpScenePatch(draftRef.current, patch, chipId);
      if (!chip) return null;
      commit(state);
      return { id: generateClientId(), kind: "patch", chipId, fields: chip.fields, redraft: redrafted };
    },
    [commit],
  );

  const lastAction = useRef<SlpSceneAction | null>(null);
  const send = useCallback(
    async (action: SlpSceneAction, retry = false) => {
      if (turn.isPending) return false;
      setError(null);
      lastAction.current = action;
      // The player's own words are a host line, except in the seat, where they are a whisper. A
      // retry sends the same words again without writing them twice.
      const own: SlpSceneItem[] =
        !retry && action.kind === "say" && setup.preset !== "seat"
          ? [{ id: generateClientId(), kind: "line", speaker: "host", text: action.text }]
          : [];
      const before = [...itemsRef.current, ...own];
      if (own.length) setItems(before);
      try {
        const result = await turn.mutateAsync({
          preset: setup.preset,
          sourceAccountId: setup.source.id,
          disclosureMode: setup.disclosureMode,
          moment,
          action,
          transcript: slpSceneTranscript(before),
          draft: draftRef.current.draft,
          locked: draftRef.current.locked,
          direction,
          ...(setup.connectionId ? { connectionId: setup.connectionId } : {}),
        });
        const lines: SlpSceneItem[] = result.lines.map((line) => ({
          id: generateClientId(),
          kind: "line",
          speaker: line.speaker,
          text: line.text,
        }));
        const chip = applyPatch(result.patch, false);
        setItems((current) => [...current, ...lines, ...(chip ? [chip] : [])]);
        if (result.momentDone) {
          setDoneMoments((current) => (current.includes(moment) ? current : [...current, moment]));
          // Support asks one question after another; the other roles linger until the player moves on.
          const next = moments[moments.indexOf(moment) + 1];
          if (setup.preset === "support" && next) setMoment(next);
        }
        return true;
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : String(reason));
        return false;
      }
    },
    [applyPatch, direction, moment, moments, setup, turn],
  );

  // The newcomer speaks first.
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    void send({ kind: "open" });
  }, [send]);

  /** A full redraft from the whole chat through the stage draft service. Locked fields stay. */
  const updatePage = useCallback(async () => {
    setError(null);
    try {
      const result = await redraft.mutateAsync({
        noodleAccountId: setup.source.id,
        disclosureMode: setup.disclosureMode,
        guidance: slpSceneGuidance(itemsRef.current, hostLabel, direction),
        // Empty fields are left out: the draft schema refuses an empty name.
        currentDraft: Object.fromEntries(
          Object.entries(slpSceneStageProfile(draftRef.current.draft, setup.disclosureMode)).filter(
            ([key, value]) => typeof value === "string" && value !== "" && key !== "gender",
          ),
        ),
        ...(setup.connectionId ? { connectionId: setup.connectionId } : {}),
      });
      const chip = applyPatch(slpSceneRedraftPatch(result), true);
      if (chip) setItems((current) => [...current, chip]);
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      return false;
    }
  }, [applyPatch, direction, hostLabel, redraft, setup]);

  /** Register the page. A page that still misses its basics gets one redraft first. */
  const finish = useCallback(async () => {
    setError(null);
    if (slpSceneMissing(draftRef.current.draft).length && !(await updatePage())) return null;
    const missing = slpSceneMissing(draftRef.current.draft);
    if (missing.length) return missing;
    try {
      const draft: SlpSceneDraft = draftRef.current.draft;
      const profile = await create.mutateAsync({
        sourceAccountId: setup.source.id,
        stageProfile: slpSceneStageProfile(draft, setup.disclosureMode),
      });
      const limits = slpSceneLimitsText(draft);
      // The page exists now; a missed strategy line is not worth failing the sign-up over.
      if (limits) await strategy.mutateAsync({ accountId: profile.id, strategyText: limits }).catch(() => undefined);
      // The first post is written in the background, like "first posts now" in Quick setup.
      firstPost.mutate({ executionId: generateClientId(), accountIds: [profile.id] });
      setCreated({ id: profile.id, displayName: profile.displayName, handle: profile.handle });
      return [];
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      return null;
    }
  }, [create, firstPost, setup, strategy, updatePage]);

  return {
    setup,
    moments,
    moment,
    setMoment,
    doneMoments,
    items,
    draft: draftState.draft,
    locked: draftState.locked,
    chips: draftState.chips,
    direction,
    setDirection,
    error,
    created,
    busy: turn.isPending || redraft.isPending || create.isPending,
    talking: turn.isPending,
    updating: redraft.isPending,
    registering: create.isPending,
    send,
    retry: () => (lastAction.current ? send(lastAction.current, true) : Promise.resolve(false)),
    updatePage,
    finish,
    undo: (chipId: string) => commit(undoSlpSceneChip(draftRef.current, chipId)),
    edit: <F extends SlpSceneField>(field: F, value: SlpSceneDraft[F]) =>
      commit(editSlpSceneField(draftRef.current, field, value)),
    toggleLock: (field: SlpSceneField) => commit(toggleSlpSceneLock(draftRef.current, field)),
  };
}

export type SlpSceneModel = ReturnType<typeof useSlpSceneModel>;
