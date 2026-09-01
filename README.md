# Monitor de Tribunais — checagem automática direta no tribunal

## O que mudou

Antes, os dados de "status agora" (`opStatus`, `opCode`, `opMs`) ficavam **hardcoded** no `index.html`, congelados na hora em que alguém rodou os checks manualmente. Agora existe uma função que roda de hora em hora no próprio Netlify, faz uma requisição HTTP real e direta a cada tribunal, e guarda o resultado. O `index.html` busca esse resultado ao carregar a página — não tem mais dado velho.

Foi adicionado também um status **"Instável"**, entre "Online" e "Indisponível":
- **Online**: respondeu rápido (até 6s).
- **Instável**: respondeu lento (mais de 6s), ou deu erro 5xx uma única vez (pode ser um blip).
- **Indisponível**: erro 5xx do próprio servidor por 2 checagens seguidas ou mais — aí sim é queda persistente.
- **Não verificável**: bloqueio de bot/rede (403/401/400 ou falha de conexão) — comum em .jus.br, não significa que o tribunal está fora do ar.

As colunas de **anúncio de manutenção/atualização** (Situação, Evento, Data, Fonte) continuam sendo curadoria manual, como já eram — isso não dá pra automatizar sem um scraper por tribunal, que é um projeto à parte.

## Arquivos novos

- `netlify/functions/check-status.mjs` — roda de hora em hora (`schedule: "@hourly"`), verifica cada tribunal direto e salva o resultado no Netlify Blobs.
- `netlify/functions/get-status.mjs` — função que o `index.html` chama ao carregar a página, pra pegar o resultado mais recente.
- `netlify.toml` — aponta a pasta das functions.
- `package.json` — declara a dependência `@netlify/blobs` (guarda os dados; não precisa de banco de dados externo nem senha configurada, o Netlify cuida disso sozinho).

## Como subir

1. Coloque todos os arquivos desta pasta no seu repositório (mantendo a estrutura de pastas, principalmente `netlify/functions/`).
2. Faça commit e push. O Netlify detecta o `package.json` e roda `npm install` sozinho antes do deploy — não precisa fazer nada manual.
3. Depois do primeiro deploy, a função `check-status` só roda na próxima marcação de hora cheia. Pra não ficar esperando, vá em **Netlify > seu site > Functions > check-status > Run now** (ou use a Netlify CLI: `netlify functions:invoke check-status`) pra popular os dados na hora.
4. Abra o site — a checagem em tempo real deve aparecer. Se a função ainda não rodou nenhuma vez, aparece um aviso amarelo explicando isso, sem quebrar a página.

## Se quiser adicionar/remover um tribunal

O `index.html` (variável `rows`) e a função `netlify/functions/check-status.mjs` (variável `TARGETS`) têm cada um sua própria lista de `{t, s, inst, url}`. Se adicionar uma linha em um, replique no outro — não tem um arquivo único compartilhado entre os dois de propósito, pra evitar depender de um recurso extra do Netlify (`included_files`) que é mais frágil de configurar.

## Ajustar sensibilidade

No topo de `check-status.mjs`:
- `TIMEOUT_MS` (padrão 8000): quanto tempo esperar por uma resposta antes de desistir.
- `SLOW_MS` (padrão 6000): acima disso, mesmo respondendo OK, marca como "Instável".
- Trocar `schedule: "@hourly"` por outro valor (ex: `"*/30 * * * *"` pra rodar a cada 30 min) se quiser checar com mais frequência.
