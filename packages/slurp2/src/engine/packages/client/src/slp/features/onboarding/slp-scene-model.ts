import { useCallback, useEffect, useRef, useState } from "react";
import {
  SLP_SCENE_MOMENTS,
  type SlpSceneAction,
  type SlpSceneDraft,
  type SlpSceneField,
  type SlpSceneMoment,
  type SlpScenePatch,
  type SlpScenePreset,
} from "../../../../../shared/src/slp/slp-scene.js";
import type { SlpAccount, SlpIdentityDisclosure } from "../../../../../shared/src/slp/slp-social.types.js";
import { generateClientId } from "../../../lib/utils";
import {
  useCreateCreatorStageProfile,
  useGenerateCreatorArtwork,
  useGenerateCreatorStageProfileDraft,
  useUpdateCreatorStageProfile,
  useUpdateCreatorStrategy,
} from "../creators/slp-creators-contract";
import {
  applySlpScenePatch,
  editSlpSceneField,
  slpSceneInitialState,
  slpSceneLimitsText,
  slpSceneMissing,
  slpSceneRedraftPatch,
  slpSceneShootGuidance,
  slpSceneStageProfile,
  toggleSlpSceneLock,
  undoSlpSceneChip,
  slpSceneGuidance,
  slpSceneTranscript,
  type SlpSceneDraftState,
  type SlpSceneItem,
} from "./slp-scene-draft";
import { useEnqueueCreatorFirstPosts } from "./slp-first-post-hooks";
import { useSlpSceneTurn } from "./slp-scene-hooks";

export type SlpSceneSetup = {
  preset: SlpScenePreset;
  source: Pick<SlpAccount, "id" | "displayName" | "handle" | "avatarUrl">;
  disclosureMode: SlpIdentityDisclosure;
  connectionId?: string;
};

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
  const update = useUpdateCreatorStageProfile();
  const artwork = useGenerateCreatorArtwork();
  const strategy = useUpdateCreatorStrategy();
  const firstPost = useEnqueueCreatorFirstPosts();
  // The chat is read back by the next turn before React renders (autopilot), so writes go through the ref.
  const itemsRef = useRef(items);
  const append = useCallback((added: SlpSceneItem[]) => {
    itemsRef.current = [...itemsRef.current, ...added];
    setItems(itemsRef.current);
  }, []);
  // Autopilot runs several turns from one press; each turn must see the moment and direction of now.
  const momentRef = useRef(moment);
  momentRef.current = moment;
  const directionRef = useRef(direction);
  directionRef.current = direction;
  const [autoLeft, setAutoLeft] = useState(0);
  const autoStop = useRef(false);

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
      if (own.length) append(own);
      const before = itemsRef.current;
      const moment = momentRef.current;
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
          direction: directionRef.current,
          ...(setup.connectionId ? { connectionId: setup.connectionId } : {}),
        });
        const lines: SlpSceneItem[] = result.lines.map((line) => ({
          id: generateClientId(),
          kind: "line",
          speaker: line.speaker,
          text: line.text,
        }));
        const chip = applyPatch(result.patch, false);
        append([...lines, ...(chip ? [chip] : [])]);
        if (result.momentDone) {
          setDoneMoments((current) => (current.includes(moment) ? current : [...current, moment]));
          // Support asks one question after another; the other roles linger until the player moves on.
          const next = moments[moments.indexOf(moment) + 1];
          if (setup.preset === "support" && next) {
            momentRef.current = next;
            setMoment(next);
          }
        }
        return true;
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : String(reason));
        return false;
      }
    },
    [append, applyPatch, moments, setup, turn],
  );

  /** Let the scene run by itself for a few exchanges; stops on the first failure or on Stop. */
  const autopilot = useCallback(
    async (turns = 3) => {
      autoStop.current = false;
      for (let left = turns; left > 0 && !autoStop.current; left--) {
        setAutoLeft(left);
        if (!(await send({ kind: "continue" }))) break;
      }
      setAutoLeft(0);
    },
    [send],
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
      if (chip) append([chip]);
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      return false;
    }
  }, [append, applyPatch, direction, hostLabel, redraft, setup]);

  const [accountId, setAccountId] = useState<string | null>(null);
  const accountRef = useRef<string | null>(null);
  /**
   * Save the page as it is now: create it the first time, update it after that (the photo shoot
   * needs a real page to hang the pictures on). A page that still misses its basics gets one
   * redraft first; what is still missing after that comes back for the player to fill in.
   */
  const savePage = useCallback(async (): Promise<{ id: string } | { missing: string[] } | null> => {
    setError(null);
    if (slpSceneMissing(draftRef.current.draft).length && !(await updatePage())) return null;
    const missing = slpSceneMissing(draftRef.current.draft);
    if (missing.length) return { missing };
    const stageProfile = slpSceneStageProfile(draftRef.current.draft, setup.disclosureMode);
    try {
      if (accountRef.current) {
        await update.mutateAsync({ accountId: accountRef.current, ...stageProfile });
        return { id: accountRef.current };
      }
      const profile = await create.mutateAsync({ sourceAccountId: setup.source.id, stageProfile });
      accountRef.current = profile.id;
      setAccountId(profile.id);
      return { id: profile.id };
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      return null;
    }
  }, [create, setup, update, updatePage]);

  /** "Finish registration": save the page, then its limits line and the first post. */
  const finish = useCallback(async () => {
    const saved = await savePage();
    if (!saved || "missing" in saved) return saved ? saved.missing : null;
    const draft: SlpSceneDraft = draftRef.current.draft;
    const limits = slpSceneLimitsText(draft);
    // The page exists now; a missed strategy line is not worth failing the sign-up over.
    if (limits) await strategy.mutateAsync({ accountId: saved.id, strategyText: limits }).catch(() => undefined);
    // The first post is written in the background, like "first posts now" in Quick setup.
    firstPost.mutate({ executionId: generateClientId(), accountIds: [saved.id] });
    setCreated({ id: saved.id, displayName: draft.displayName, handle: draft.handle });
    return [];
  }, [firstPost, savePage, strategy]);

  /**
   * The first photo shoot: the real image pipeline draws the profile photo, then the cover, from
   * the chosen outfit and place. The page is saved first so the pictures have somewhere to live.
   */
  const [shooting, setShooting] = useState<"avatar" | "banner" | null>(null);
  const [photos, setPhotos] = useState<{ avatarUrl: string | null; bannerUrl: string | null }>({
    avatarUrl: null,
    bannerUrl: null,
  });
  const shoot = useCallback(
    async (outfit: string, place: string) => {
      const saved = await savePage();
      if (!saved || "missing" in saved) return saved ? saved.missing : null;
      for (const kind of ["avatar", "banner"] as const) {
        setShooting(kind);
        try {
          const profile = (await artwork.mutateAsync({
            accountId: saved.id,
            kind,
            guidance: slpSceneShootGuidance(kind, outfit, place),
          })) as { avatarUrl: string | null; bannerUrl?: string | null };
          const imageUrl = kind === "avatar" ? profile.avatarUrl : (profile.bannerUrl ?? null);
          setPhotos((current) => ({ ...current, [kind === "avatar" ? "avatarUrl" : "bannerUrl"]: imageUrl }));
          if (imageUrl) append([{ id: generateClientId(), kind: "photo", photo: kind, imageUrl }]);
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : String(reason));
          break;
        }
      }
      setShooting(null);
      return [];
    },
    [append, artwork, savePage],
  );

  return {
    setup,
    moments,
    moment,
    doneMoments,
    items,
    draft: draftState.draft,
    locked: draftState.locked,
    chips: draftState.chips,
    direction,
    setDirection,
    error,
    created,
    busy:
      turn.isPending || redraft.isPending || create.isPending || update.isPending || autoLeft > 0 || shooting !== null,
    talking: turn.isPending,
    updating: redraft.isPending,
    registering: create.isPending || update.isPending,
    accountId,
    shooting,
    photos,
    shoot,
    send,
    autopilot,
    autoLeft,
    stopAutopilot: () => {
      autoStop.current = true;
    },
    /** Move to another moment: skip ahead, go back, or linger by not moving at all. */
    goTo: (next: SlpSceneMoment) => {
      momentRef.current = next;
      setMoment(next);
    },
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
