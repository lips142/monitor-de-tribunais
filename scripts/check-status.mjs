#!/usr/bin/env node
// Checagem automatica direta nos tribunais.
// Roda pelo GitHub Actions (.github/workflows/check-status.yml), de hora em
// hora, de graca (sem limite de frequencia, sem restricao de uso comercial
// - diferente do Netlify/Vercel gratis). Le o estado anterior de arquivos
// JSON, verifica cada tribunal, e escreve o novo estado em arquivos JSON.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TARGETS_FILE = process.env.TARGETS_FILE || path.join(__dirname, "..", "data", "targets.json");
const PREVIOUS_LATEST = process.env.PREVIOUS_LATEST || path.join(__dirname, "..", "data", "latest.json");
const PREVIOUS_INCIDENTS = process.env.PREVIOUS_INCIDENTS || path.join(__dirname, "..", "data", "incidents.json");
const OUT_LATEST = process.env.OUT_LATEST || PREVIOUS_LATEST;
const OUT_INCIDENTS = process.env.OUT_INCIDENTS || PREVIOUS_INCIDENTS;

const TIMEOUT_MS = 8000; // tempo maximo de espera por tribunal
const SLOW_MS = 6000; // acima disso, mesmo respondendo, marca como "instavel"
const BLOCKED_CODES = new Set([400, 401, 403]); // bloqueio de bot/WAF, nao e evidencia de queda
const MAX_INCIDENTS = 500; // limite pra nao crescer pra sempre

function keyOf(t, s) {
  return `${t}::${s}`;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function probe(target) {
  if (!target.url) {
    return { ...target, opCode: null, opMs: null, raw: "sem-url" };
  }
  const start = Date.now();
  try {
    const res = await fetch(target.url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MonitorDeTribunaisBot/1.0; +https://monitordetribunais.netlify.app)",
      },
    });
    const ms = Date.now() - start;
    res.body?.cancel?.().catch(() => {});
    if (BLOCKED_CODES.has(res.status)) {
      return { ...target, opCode: res.status, opMs: ms, raw: "bloqueado" };
    }
    if (res.status >= 500) {
      return { ...target, opCode: res.status, opMs: ms, raw: "erro-servidor" };
    }
    return { ...target, opCode: res.status, opMs: ms, raw: "respondeu" };
  } catch (err) {
    return { ...target, opCode: null, opMs: null, raw: "falha-rede" };
  }
}

// Decide o status final considerando o resultado desta checagem + quantas vezes
// SEGUIDAS o proprio servidor ja respondeu com erro (errStreak), pra distinguir
// uma falha pontual (instavel) de uma queda persistente (indisponivel).
function classify(probeResult, previous) {
  const { raw, opMs } = probeResult;
  if (raw === "sem-url") return { opStatus: "sem-url", errStreak: 0 };
  if (raw === "bloqueado" || raw === "falha-rede") return { opStatus: "nao-verificavel", errStreak: 0 };
  if (raw === "respondeu") return { opStatus: opMs > SLOW_MS ? "instavel" : "online", errStreak: 0 };
  if (raw === "erro-servidor") {
    const errStreak = (previous?.errStreak || 0) + 1;
    return { opStatus: errStreak >= 2 ? "indisponivel" : "instavel", errStreak };
  }
  return { opStatus: "nao-verificavel", errStreak: 0 };
}

function shouldLogTransition(prevStatus, newStatus) {
  const meaningful = new Set(["online", "instavel", "indisponivel"]);
  if (!meaningful.has(prevStatus) || !meaningful.has(newStatus)) return false;
  return prevStatus !== newStatus;
}

function eventLabel(prevStatus, newStatus, opCode) {
  if (newStatus === "indisponivel") {
    return `Caiu (HTTP ${opCode ?? "?"}) — checagem direta ao tribunal`;
  }
  if (newStatus === "online" && (prevStatus === "indisponivel" || prevStatus === "instavel")) {
    return `Voltou ao normal (HTTP ${opCode ?? 200})`;
  }
  if (newStatus === "instavel") {
    return `Ficou instável (HTTP ${opCode ?? "sem resposta"})`;
  }
  return null;
}

function nowBrasilia() {
  const s = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${s} (Brasília)`;
}

async function main() {
  const TARGETS = await readJson(TARGETS_FILE, []);
  if (!TARGETS.length) {
    throw new Error(`Nenhum alvo encontrado em ${TARGETS_FILE}`);
  }

  const previousLatest = await readJson(PREVIOUS_LATEST, { statuses: [] });
  const previousIncidents = await readJson(PREVIOUS_INCIDENTS, []);
  const previousByKey = new Map((previousLatest.statuses || []).map((s) => [keyOf(s.t, s.s), s]));

  const settled = await Promise.allSettled(TARGETS.map(probe));
  const checkedAt = nowBrasilia();
  const newIncidents = [];

  const statuses = settled.map((r, i) => {
    const target = TARGETS[i];
    const result =
      r.status === "fulfilled"
        ? r.value
        : { ...target, opCode: null, opMs: null, raw: "falha-rede" };
    const prev = previousByKey.get(keyOf(target.t, target.s));
    const { opStatus, errStreak } = classify(result, prev);

    if (prev && shouldLogTransition(prev.opStatus, opStatus)) {
      const label = eventLabel(prev.opStatus, opStatus, result.opCode);
      if (label) {
        newIncidents.push({ ts: checkedAt, t: target.t, s: target.s, event: label });
      }
    }

    return {
      t: target.t,
      s: target.s,
      opStatus,
      opCode: result.opCode,
      opMs: result.opMs,
      opCheckedAt: checkedAt,
      errStreak,
    };
  });

  const incidents = [...previousIncidents, ...newIncidents].slice(-MAX_INCIDENTS);

  await fs.mkdir(path.dirname(OUT_LATEST), { recursive: true });
  await fs.mkdir(path.dirname(OUT_INCIDENTS), { recursive: true });
  await fs.writeFile(OUT_LATEST, JSON.stringify({ checkedAt, statuses }, null, 2) + "\n");
  await fs.writeFile(OUT_INCIDENTS, JSON.stringify(incidents, null, 2) + "\n");

  console.log(`Checagem concluida: ${statuses.length} alvos, ${newIncidents.length} nova(s) transicao(oes).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
