/**
 * Session persistence for Card Editor bulk runs (ARCH §2/§3, SPEC F5.4). Sessions live in the
 * capability document store: one document per session (kind "bulk-session", id = session id) plus
 * one prompt-material companion (kind "bulk-session-material", id "<sessionId>:material") holding
 * the dispatch-time lorebook/behavior-character material that retries re-render from. Material
 * stays out of the session document so polling GETs never haul it over the wire.
 *
 * All reads pass through migrateSessionDocument: unknown or garbage documents read as null (the
 * routes answer 404). Writes for the same session id are funneled through a per-id promise queue
 * so concurrent route and runner mutations can never lose each other's updates; the store's
 * expectedRevision check is the backstop and surfaces as an error, never a silent clobber.
 */
import {
  migrateSessionDocument,
  recomputeStats,
  type BulkSession,
} from "../../../../shared/src/features/agents/card-editor/schema.ts";
import type { CharacterLike, LorebookLike } from "./context.ts";

export const CARD_EDITOR_PACKAGE_ID = "card-editor";
const SESSION_KIND = "bulk-session";
const MATERIAL_KIND = "bulk-session-material";
const MATERIAL_DESCRIPTION = "Card Editor bulk session prompt material";
const SESSION_DESCRIPTION = "Card Editor bulk session";

/** Prompt material captured at dispatch (Coordinator decision 1: the server never fetches engine
 *  data, so everything a re-dispatch needs is persisted here). */
export interface SessionPromptMaterial {
  version: 1;
  lorebooks: LorebookLike[];
  behaviorCharacter: CharacterLike | null;
}

/** Structural subset of the capability document store (keeps the module importable in tests). */
export interface SessionDocumentStore {
  list(packageId: string, kind: string): Promise<SessionDocumentRecord[]>;
  getById(packageId: string, id: string): Promise<SessionDocumentRecord | null>;
  create(input: {
    id: string;
    packageId: string;
    kind: string;
    name: string;
    description: string;
    data: unknown;
    createdAt: string;
    updatedAt: string;
  }): Promise<SessionDocumentRecord>;
  update(input: {
    id: string;
    packageId: string;
    expectedRevision: number;
    name: string;
    description: string;
    data: unknown;
    updatedAt: string;
  }): Promise<SessionDocumentRecord | null>;
  remove(packageId: string, id: string, expectedRevision: number): Promise<boolean>;
}

export interface SessionDocumentRecord {
  id: string;
  revision: number;
  data: unknown;
}

export interface SessionStore {
  createSession(session: BulkSession, material: SessionPromptMaterial): Promise<BulkSession>;
  getSession(id: string): Promise<BulkSession | null>;
  getSessionMaterial(id: string): Promise<SessionPromptMaterial | null>;
  listSessions(): Promise<BulkSession[]>;
  updateSession(id: string, mutate: (session: BulkSession) => BulkSession): Promise<BulkSession | null>;
  deleteSession(id: string): Promise<boolean>;
}

function materialDocumentId(sessionId: string): string {
  return `${sessionId}:material`;
}

function sourceRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function migrateMaterial(value: unknown): SessionPromptMaterial | null {
  const source = sourceRecord(value);
  if (!source || source.version !== 1) return null;
  return {
    version: 1,
    lorebooks: Array.isArray(source.lorebooks) ? (source.lorebooks as LorebookLike[]) : [],
    behaviorCharacter: sourceRecord(source.behaviorCharacter) as CharacterLike | null,
  };
}

export function createSessionStore(documents: SessionDocumentStore): SessionStore {
  // Per-session-id write serialization: a route verdict and a runner batch completion can target
  // the same session concurrently; each mutation runs after the previous one settled.
  const writeQueues = new Map<string, Promise<unknown>>();

  function enqueueWrite<T>(id: string, work: () => Promise<T>): Promise<T> {
    const tail = writeQueues.get(id) ?? Promise.resolve();
    const run = tail.then(work);
    writeQueues.set(
      id,
      run.then(
        () => undefined,
        () => undefined,
      ),
    );
    return run;
  }

  return {
    async createSession(session, material) {
      const now = new Date().toISOString();
      await documents.create({
        id: session.id,
        packageId: CARD_EDITOR_PACKAGE_ID,
        kind: SESSION_KIND,
        name: session.label,
        description: SESSION_DESCRIPTION,
        data: session,
        createdAt: now,
        updatedAt: now,
      });
      try {
        await documents.create({
          id: materialDocumentId(session.id),
          packageId: CARD_EDITOR_PACKAGE_ID,
          kind: MATERIAL_KIND,
          name: session.label,
          description: MATERIAL_DESCRIPTION,
          data: material,
          createdAt: now,
          updatedAt: now,
        });
      } catch (error) {
        // Never leave a session whose retries cannot re-render prompts: roll the session back.
        const created = await documents.getById(CARD_EDITOR_PACKAGE_ID, session.id);
        if (created) await documents.remove(CARD_EDITOR_PACKAGE_ID, session.id, created.revision).catch(() => false);
        throw error;
      }
      return session;
    },

    async getSession(id) {
      const record = await documents.getById(CARD_EDITOR_PACKAGE_ID, id);
      if (!record) return null;
      return migrateSessionDocument(record.data);
    },

    async getSessionMaterial(id) {
      const record = await documents.getById(CARD_EDITOR_PACKAGE_ID, materialDocumentId(id));
      return record ? migrateMaterial(record.data) : null;
    },

    async listSessions() {
      const records = await documents.list(CARD_EDITOR_PACKAGE_ID, SESSION_KIND);
      return records
        .map((record) => migrateSessionDocument(record.data))
        .filter((session): session is BulkSession => session !== null)
        .sort((a, b) =>
          a.createdAt === b.createdAt ? b.id.localeCompare(a.id) : b.createdAt.localeCompare(a.createdAt),
        );
    },

    async updateSession(id, mutate) {
      return enqueueWrite(id, async () => {
        const record = await documents.getById(CARD_EDITOR_PACKAGE_ID, id);
        if (!record) return null;
        const current = migrateSessionDocument(record.data);
        if (!current) return null;
        const next = recomputeStats(mutate(current));
        const saved = await documents.update({
          id,
          packageId: CARD_EDITOR_PACKAGE_ID,
          expectedRevision: record.revision,
          name: next.label,
          description: SESSION_DESCRIPTION,
          data: next,
          updatedAt: new Date().toISOString(),
        });
        if (!saved) throw new Error("Card Editor session changed while it was being saved. Try again.");
        return next;
      });
    },

    async deleteSession(id) {
      return enqueueWrite(id, async () => {
        const record = await documents.getById(CARD_EDITOR_PACKAGE_ID, id);
        if (!record) return false;
        const material = await documents.getById(CARD_EDITOR_PACKAGE_ID, materialDocumentId(id));
        if (material) await documents.remove(CARD_EDITOR_PACKAGE_ID, material.id, material.revision);
        return documents.remove(CARD_EDITOR_PACKAGE_ID, id, record.revision);
      });
    },
  };
}
