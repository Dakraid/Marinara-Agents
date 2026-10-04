import type { FastifyPluginAsync } from "fastify";

type ActivationContext = {
  api: {
    registerPrivilegedRoutes(routes: FastifyPluginAsync, options: { prefix: string }): Promise<() => void>;
  };
};

const cardEditorRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({ ok: true }));
};

let ready = false;

export async function activate({ api }: ActivationContext) {
  const releaseRoutes = await api.registerPrivilegedRoutes(cardEditorRoutes, { prefix: "/api/card-editor" });
  ready = true;
  return () => {
    ready = false;
    releaseRoutes();
  };
}

export async function selfCheck() {
  if (!ready) throw new Error("Card Editor did not initialize");
}
