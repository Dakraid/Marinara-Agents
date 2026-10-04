/**
 * Card Editor package server entry (ARCH §2). activate() wires the session store and runner
 * registry against the capability runtime host, marks sessions stranded by a server restart as
 * interrupted (SPEC F5.3), and registers the privileged routes. Cleanup aborts in-flight LLM
 * calls without touching session state — sessions stay readable and a later activation resumes
 * ownership (ARCH §5: package deactivated mid-session).
 */
import type { CapabilityRuntimeHost } from "@marinara-engine/shared";
import type { FastifyPluginAsync } from "fastify";
import { createCardEditorRoutes } from "./routes.ts";
import { interruptActiveSession, runnerRegistrySize, stopAllRunners } from "./runner.ts";
import { createSessionStore, type SessionDocumentStore, type SessionStore } from "./session-store.ts";

type ActivationContext = {
  api: {
    runtime: CapabilityRuntimeHost;
    registerPrivilegedRoutes(routes: FastifyPluginAsync, options: { prefix: string }): Promise<() => void>;
  };
};

let ready = false;
let activeStore: SessionStore | null = null;
let activeDocuments: SessionDocumentStore | null = null;

export async function activate({ api }: ActivationContext) {
  const documents = api.runtime.persistence.documents;
  const store = createSessionStore(documents);
  const deps = { store, languageModels: api.runtime.languageModels, logger: api.runtime.logger };
  // SPEC F5.3: a restart strands in-flight work — mark every active session interrupted before
  // serving traffic so the runs panel reflects reality (rerun = a fresh session dispatch).
  for (const session of await store.listSessions()) {
    if (session.status !== "active") continue;
    await store.updateSession(session.id, (current) => interruptActiveSession(current));
  }
  const releaseRoutes = await api.registerPrivilegedRoutes(createCardEditorRoutes(deps), {
    prefix: "/api/card-editor",
  });
  activeStore = store;
  activeDocuments = documents;
  ready = true;
  return () => {
    ready = false;
    activeStore = null;
    activeDocuments = null;
    stopAllRunners();
    releaseRoutes();
  };
}

export async function selfCheck() {
  if (!ready || !activeStore || !activeDocuments) throw new Error("Card Editor did not initialize");
  if (!Number.isInteger(runnerRegistrySize()) || runnerRegistrySize() < 0) {
    throw new Error("Card Editor runner registry is not sane");
  }
  // Store-writability probe: create + remove a throwaway document (kind "self-check" never
  // collides with session listings, which query kind "bulk-session").
  const probeId = "__marinara_capability_self_check__";
  const now = new Date().toISOString();
  // A previous probe that crashed between create and remove must not fail this check.
  const stale = await activeDocuments.getById("card-editor", probeId);
  if (stale) await activeDocuments.remove("card-editor", probeId, stale.revision);
  const probe = await activeDocuments.create({
    id: probeId,
    packageId: "card-editor",
    kind: "self-check",
    name: "self-check",
    description: "Card Editor self-check probe",
    data: { probe: true },
    createdAt: now,
    updatedAt: now,
  });
  const removed = await activeDocuments.remove("card-editor", probe.id, probe.revision);
  if (!removed) throw new Error("Card Editor document store is not writable");
}
