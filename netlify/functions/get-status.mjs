import { getStore } from "@netlify/blobs";

// Função sob demanda: o front-end (index.html) chama
// /.netlify/functions/get-status ao carregar a página e recebe o resultado
// mais recente salvo pela função agendada (check-status.mjs), que roda de
// hora em hora direto contra cada tribunal.
export default async () => {
  const store = getStore("tribunais-status");
  const latest = (await store.get("latest", { type: "json" })) || {
    checkedAt: null,
    statuses: [],
  };
  const incidents = (await store.get("incidents", { type: "json" })) || [];

  return new Response(JSON.stringify({ ...latest, incidents }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // cache curto: evita bater no Blobs a cada refresh, mas não deixa
      // a página presa em um resultado velho por muito tempo
      "Cache-Control": "public, max-age=60",
    },
  });
};
