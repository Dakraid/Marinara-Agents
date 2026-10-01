import type {
  CapabilityPersistenceSession,
  CapabilitySpatialSnapshotWrite,
  SpatialAssessedTravel,
  SpatialContextSnapshot,
  SpatialSnapshotSource,
} from "@marinara-engine/shared";
import { getPackagePersistence, newTimeSortableId, now } from "../spatial-context/package-runtime.js";

type SpatialSnapshotPersistence = Pick<CapabilityPersistenceSession, "spatialSnapshots">;

export interface CreateSpatialSnapshotInput {
  chatId: string;
  messageId?: string;
  swipeIndex?: number;
  currentLocationId: string | null;
  definitionRevision: number;
  source: SpatialSnapshotSource;
  transitionCommandId?: string | null;
  transitionPayloadHash?: string | null;
  travel?: SpatialAssessedTravel | null;
}

function snapshotWrite(input: CreateSpatialSnapshotInput): CapabilitySpatialSnapshotWrite {
  return {
    id: newTimeSortableId(),
    chatId: input.chatId,
    messageId: input.messageId ?? "",
    swipeIndex: input.swipeIndex ?? 0,
    currentLocationId: input.currentLocationId,
    definitionRevision: input.definitionRevision,
    source: input.source,
    transitionCommandId: input.transitionCommandId ?? null,
    transitionPayloadHash: input.transitionPayloadHash ?? null,
    travel: input.travel ?? null,
    createdAt: now(),
  };
}

function normalizeSnapshot(snapshot: SpatialContextSnapshot | null): SpatialContextSnapshot | null {
  return snapshot ? { ...snapshot, travel: snapshot.travel ?? null } : null;
}

function normalizeSnapshots(snapshots: SpatialContextSnapshot[]): SpatialContextSnapshot[] {
  return snapshots.map((snapshot) => ({ ...snapshot, travel: snapshot.travel ?? null }));
}

export function createSpatialContextStorage(persistence: SpatialSnapshotPersistence = getPackagePersistence()) {
  const snapshots = persistence.spatialSnapshots;
  return {
    async getById(id: string): Promise<SpatialContextSnapshot | null> {
      return normalizeSnapshot(await snapshots.getById(id));
    },

    async getByAnchor(chatId: string, messageId: string, swipeIndex: number): Promise<SpatialContextSnapshot | null> {
      return normalizeSnapshot(await snapshots.getByAnchor(chatId, messageId, swipeIndex));
    },

    async getByCommand(chatId: string, commandId: string): Promise<SpatialContextSnapshot | null> {
      return normalizeSnapshot(await snapshots.getByCommand(chatId, commandId));
    },

    listByAnchors(
      chatId: string,
      anchors: Array<{ messageId: string; swipeIndex: number }>,
    ): Promise<SpatialContextSnapshot[]> {
      return snapshots.listByAnchors(chatId, anchors).then(normalizeSnapshots);
    },

    listForChat(chatId: string): Promise<SpatialContextSnapshot[]> {
      return snapshots.listForChat(chatId).then(normalizeSnapshots);
    },

    hasMessageSnapshots(chatId: string): Promise<boolean> {
      return snapshots.hasMessageSnapshots(chatId);
    },

    async getLatest(chatId: string): Promise<SpatialContextSnapshot | null> {
      return normalizeSnapshot(await snapshots.getLatest(chatId));
    },

    async getBootstrap(chatId: string): Promise<SpatialContextSnapshot | null> {
      return normalizeSnapshot(await snapshots.getBootstrap(chatId));
    },

    async create(input: CreateSpatialSnapshotInput): Promise<SpatialContextSnapshot> {
      return normalizeSnapshot(await snapshots.create(snapshotWrite(input)))!;
    },

    async replaceBootstrap(
      input: Omit<CreateSpatialSnapshotInput, "messageId" | "swipeIndex">,
    ): Promise<SpatialContextSnapshot> {
      return normalizeSnapshot(
        await snapshots.replaceBootstrap(snapshotWrite({ ...input, messageId: "", swipeIndex: 0 })),
      )!;
    },

    async replaceAtAnchor(input: CreateSpatialSnapshotInput): Promise<SpatialContextSnapshot> {
      return normalizeSnapshot(await snapshots.replaceAtAnchor(snapshotWrite(input)))!;
    },
  };
}
