import { getStore } from "@netlify/blobs";

// Lista de tribunais/sistemas verificados diretamente (gerada a partir do
// dataset em index.html). Se adicionar/remover uma linha em index.html
// (variavel rows), replique {t, s, inst, url} aqui tambem.
const TARGETS = [
  {
    "t": "JFAL",
    "s": "PJe 1.x",
    "inst": "1º Grau",
    "url": "https://pje.jfal.jus.br/pje/login.seam"
  },
  {
    "t": "JFCE",
    "s": "PJe 1.x",
    "inst": "1º Grau",
    "url": "https://pje.jfce.jus.br/pje/login.seam"
  },
  {
    "t": "JFES",
    "s": "eproc",
    "inst": "1º Grau",
    "url": "https://eproc.jfes.jus.br/eproc/"
  },
  {
    "t": "JFPB",
    "s": "PJe 1.x",
    "inst": "1º Grau",
    "url": "https://pje.jfpb.jus.br/pje/login.seam"
  },
  {
    "t": "JFPE",
    "s": "PJe 1.x",
    "inst": "1º Grau",
    "url": "https://pje.jfpe.jus.br/pje/login.seam"
  },
  {
    "t": "JFPR",
    "s": "eproc",
    "inst": "1º Grau",
    "url": "https://eproc.jfpr.jus.br/eprocV2/"
  },
  {
    "t": "JFRJ",
    "s": "eproc",
    "inst": "1º Grau",
    "url": "https://eproc.jfrj.jus.br/eproc/"
  },
  {
    "t": "JFRN",
    "s": "PJe 1.x",
    "inst": "1º Grau",
    "url": "https://pje.jfrn.jus.br/pje/login.seam"
  },
  {
    "t": "JFRS",
    "s": "eproc",
    "inst": "1º Grau",
    "url": "https://eproc.jfrs.jus.br/eprocV2/"
  },
  {
    "t": "JFSC",
    "s": "eproc",
    "inst": "1º Grau",
    "url": "https://eproc.jfsc.jus.br/eprocV2/"
  },
  {
    "t": "JFSE",
    "s": "PJe 1.x",
    "inst": "1º Grau",
    "url": "https://pje.jfse.jus.br/pje/login.seam"
  },
  {
    "t": "TJAC",
    "s": "eSAJ",
    "inst": "1º/2º Grau",
    "url": "https://esaj.tjac.jus.br/sajcas/login"
  },
  {
    "t": "TJAL",
    "s": "eSAJ",
    "inst": "1º/2º Grau",
    "url": "https://www2.tjal.jus.br/sajcas/login"
  },
  {
    "t": "TJAM",
    "s": "eSAJ",
    "inst": "1º/2º Grau",
    "url": "https://consultasaj.tjam.jus.br/sajcas/login"
  },
  {
    "t": "TJAM",
    "s": "Projudi",
    "inst": "1º/2º Grau",
    "url": "https://projudi.tjam.jus.br/projudi/"
  },
  {
    "t": "TJAP",
    "s": "PJe",
    "inst": "1º Grau",
    "url": "https://pje.tjap.jus.br/1g/login.seam"
  },
  {
    "t": "TJBA",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.tjba.jus.br/pje/login.seam"
  },
  {
    "t": "TJBA",
    "s": "Projudi",
    "inst": "1º/2º Grau",
    "url": "https://projudi.tjba.jus.br/projudi/"
  },
  {
    "t": "TJCE",
    "s": "eSAJ",
    "inst": "1º/2º Grau",
    "url": "https://esaj.tjce.jus.br/sajcas/login"
  },
  {
    "t": "TJCE",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.tjce.jus.br/pje1grau/"
  },
  {
    "t": "TJDF",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.tjdft.jus.br/pje/login.seam"
  },
  {
    "t": "TJES",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.tjes.jus.br/pje/login.seam"
  },
  {
    "t": "TJGO",
    "s": "Projudi",
    "inst": "1º/2º Grau",
    "url": "https://projudi.tjgo.jus.br/"
  },
  {
    "t": "TJMA",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.tjma.jus.br/pje/login.seam"
  },
  {
    "t": "TJMG",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.tjmg.jus.br/pje/login.seam"
  },
  {
    "t": "TJMG",
    "s": "eproc",
    "inst": "1º/2º Grau",
    "url": "https://eproc1g.tjmg.jus.br/eproc/"
  },
  {
    "t": "TJMS",
    "s": "eSAJ",
    "inst": "1º/2º Grau",
    "url": "https://esaj.tjms.jus.br/sajcas/login"
  },
  {
    "t": "TJMT",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.tjmt.jus.br/pje/login.seam"
  },
  {
    "t": "TJPA",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.tjpa.jus.br/pje/login.seam"
  },
  {
    "t": "TJPB",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.tjpb.jus.br/pje/login.seam"
  },
  {
    "t": "TJPE",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.cloud.tjpe.jus.br/1g/login.seam"
  },
  {
    "t": "TJPI",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.tjpi.jus.br/1g/login.seam"
  },
  {
    "t": "TJPR",
    "s": "Projudi",
    "inst": "1º/2º Grau",
    "url": "https://projudi.tjpr.jus.br/projudi/"
  },
  {
    "t": "TJRJ",
    "s": "PJe",
    "inst": "1º Grau",
    "url": "https://tjrj.pje.jus.br/1g/login.seam"
  },
  {
    "t": "TJRJ",
    "s": "TJRJLocal",
    "inst": "1º/2º Grau",
    "url": null
  },
  {
    "t": "TJRN",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje1g.tjrn.jus.br/pje/login.seam"
  },
  {
    "t": "TJRO",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pjepg.tjro.jus.br/pje/login.seam"
  },
  {
    "t": "TJRS",
    "s": "eproc",
    "inst": "1º/2º Grau",
    "url": "https://www.tjrs.jus.br/novo/eproc/acesso-ao-sistema/"
  },
  {
    "t": "TJSC",
    "s": "eproc",
    "inst": "1º/2º Grau",
    "url": "https://eproc1g.tjsc.jus.br/eproc/"
  },
  {
    "t": "TJSP",
    "s": "eSAJ",
    "inst": "1º/2º Grau",
    "url": "https://esaj.tjsp.jus.br/sajcas/login"
  },
  {
    "t": "TJSP",
    "s": "eproc",
    "inst": "1º/2º Grau",
    "url": "https://eproc1g.tjsp.jus.br/eproc"
  },
  {
    "t": "TJTO",
    "s": "eproc",
    "inst": "1º/2º Grau",
    "url": "https://www.tjto.jus.br/eproc"
  },
  {
    "t": "TRF1",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje1g.trf1.jus.br/pje/login.seam"
  },
  {
    "t": "TRF2",
    "s": "eproc",
    "inst": "1º/2º Grau",
    "url": "https://eproc.trf2.jus.br/eproc/"
  },
  {
    "t": "TRF3",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje1g.trf3.jus.br/pje/login.seam"
  },
  {
    "t": "TRF4",
    "s": "eproc",
    "inst": "1º/2º Grau",
    "url": "https://eproc.trf4.jus.br/"
  },
  {
    "t": "TRF5",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pjett.trf5.jus.br/pje/login.seam"
  },
  {
    "t": "TRF5",
    "s": "PJe1.x",
    "inst": "1º Grau",
    "url": "https://pje.trf5.jus.br/pje/login.seam"
  },
  {
    "t": "TRF6",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje1g.trf6.jus.br/pje/login.seam"
  },
  {
    "t": "TRF6",
    "s": "eproc",
    "inst": "1º/2º Grau",
    "url": "https://eproc1g.trf6.jus.br/eproc/"
  },
  {
    "t": "TRT1",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt1.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT2",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt2.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT3",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt3.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT4",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt4.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT5",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt5.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT6",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt6.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT7",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt7.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT8",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt8.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT9",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt9.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT10",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt10.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT11",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt11.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT12",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt12.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT13",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt13.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT14",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt14.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT15",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt15.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT16",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt16.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT17",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt17.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT18",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt18.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT19",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt19.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT20",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt20.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT21",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt21.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT22",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt22.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT23",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt23.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TRT24",
    "s": "PJe",
    "inst": "1º/2º Grau",
    "url": "https://pje.trt24.jus.br/primeirograu/login.seam"
  },
  {
    "t": "TST",
    "s": "PJe",
    "inst": "1º/2º/Superior",
    "url": "https://pje.tst.jus.br/tst/login.seam"
  }
];

const TIMEOUT_MS = 8000; // tempo máximo de espera por tribunal
const SLOW_MS = 6000; // acima disso, mesmo respondendo, marca como "instável"
const BLOCKED_CODES = new Set([400, 401, 403]); // bloqueio de bot/WAF, não é evidência de queda
const MAX_INCIDENTS = 500; // limite pra não crescer pra sempre

function keyOf(t, s) {
  return `${t}::${s}`;
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
    // Não precisamos do corpo da resposta, só do status — libera a conexão.
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
// SEGUIDAS o próprio servidor já respondeu com erro (errStreak), pra distinguir
// uma falha pontual (instável) de uma queda persistente (indisponível).
// Retorna { opStatus, errStreak } — errStreak é salvo e lido na próxima rodada.
function classify(probeResult, previous) {
  const { raw, opMs } = probeResult;
  if (raw === "sem-url") return { opStatus: "sem-url", errStreak: 0 };
  if (raw === "bloqueado" || raw === "falha-rede") return { opStatus: "nao-verificavel", errStreak: 0 };
  if (raw === "respondeu") return { opStatus: opMs > SLOW_MS ? "instavel" : "online", errStreak: 0 };
  if (raw === "erro-servidor") {
    const errStreak = (previous?.errStreak || 0) + 1;
    // 1ª vez que vê erro 5xx -> ainda pode ser um blip, marca "instável".
    // 2ª vez seguida (ou mais) -> confirma queda persistente, marca "indisponível".
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

export default async () => {
  const store = getStore("tribunais-status");
  const previousLatest = (await store.get("latest", { type: "json" })) || { statuses: [] };
  const previousIncidents = (await store.get("incidents", { type: "json" })) || [];
  const previousByKey = new Map(previousLatest.statuses.map((s) => [keyOf(s.t, s.s), s]));

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

  await store.setJSON("latest", { checkedAt, statuses });
  await store.setJSON("incidents", incidents);
};

// Roda de hora em hora, direto do lado do servidor (sem bloqueio de CORS).
export const config = { schedule: "@hourly" };
