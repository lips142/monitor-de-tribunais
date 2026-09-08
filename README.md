# Monitor de Tribunais — checagem automática direta no tribunal

O site é publicado pelo **GitHub Pages** deste mesmo repositório (branch `main`, raiz) — não usa mais Netlify (a conta/team do Netlify usada antes tinha os créditos do plano gratuito esgotados e nenhum deploy chegava a publicar). O arquivo `.nojekyll` na raiz desativa o processamento Jekyll do GitHub Pages, pra servir os arquivos exatamente como estão.

## Como funciona agora

A checagem roda no **GitHub Actions** (`.github/workflows/check-status.yml`), de hora em hora, gratuitamente e sem limite de frequência — diferente de Netlify/Vercel grátis, que ou cobram por checagem (créditos) ou limitam a 1x por dia no plano free.

O workflow:
1. Lê a lista de tribunais/sistemas em `data/targets.json`.
2. Faz uma requisição HTTP real e direta a cada um (`scripts/check-status.mjs`).
3. Classifica em **Online**, **Instável** (lento, erro do servidor, ou parou de responder de repente num tribunal que já tinha respondido antes), **Indisponível** (o mesmo problema confirmado em 2 checagens seguidas ou mais) ou **Não verificável** (bloqueio de bot/WAF, ou falha de conexão num tribunal que nunca respondeu daqui — comum em `.jus.br`; nesse caso uma falha de rede sozinha não vira "queda" porque não dá pra saber se é o tribunal ou o bloqueio contra o próprio checador).
4. Salva o resultado (`latest.json` e `incidents.json`) na branch **`data`** deste mesmo repositório — uma branch separada, só para os dados, que o Netlify não usa pra fazer deploy (por isso não gasta crédito de build).

O `index.html` (publicado pelo Netlify, no link de sempre) busca esses dois arquivos direto do GitHub:
```
https://raw.githubusercontent.com/lips142/monitor-de-tribunais/data/latest.json
https://raw.githubusercontent.com/lips142/monitor-de-tribunais/data/incidents.json
```
O GitHub libera CORS pra repositórios públicos nesses arquivos "raw", então o navegador consegue buscar direto, sem precisar de nenhuma função no servidor do site.

As colunas de **anúncio de manutenção/atualização** (Situação, Evento, Data, Fonte) continuam sendo curadoria manual, dentro do próprio `index.html` — isso não dá pra automatizar sem um scraper por tribunal, que é um projeto à parte.

## Por que não ficou no Netlify Functions / Vercel

- **Netlify grátis**: usa um sistema de créditos compartilhado (build + functions + bandwidth); rodar uma function de hora em hora + servir a página que a chama a cada visita consumiu o limite mensal rápido demais.
- **Vercel grátis (Hobby)**: cron job só roda 1x por dia (não dá pra ser de hora em hora), e o plano é restrito a uso pessoal/não-comercial.
- **GitHub Actions** (repositório público): minutos ilimitados de graça, sem essas restrições.

## Primeira configuração (só uma vez)

A branch `data` precisa existir antes do workflow rodar pela primeira vez. Se ela ainda não existe no repositório, crie uma branch órfã vazia:

```bash
git checkout --orphan data
git rm -rf .
echo '{"checkedAt": null, "statuses": []}' > latest.json
echo '[]' > incidents.json
git add latest.json incidents.json
git commit -m "Inicializa branch de dados"
git push origin data
git checkout main
```

Depois disso, o workflow do GitHub Actions cuida do resto sozinho, de hora em hora. Pra rodar na hora (sem esperar a próxima marcação): aba **Actions** do repositório no GitHub → **Checagem de status dos tribunais** → **Run workflow**.

## Se quiser adicionar/remover um tribunal

Edite `data/targets.json` (usado pelo workflow) **e** a variável `rows` em `index.html` (usada pra exibir as colunas de anúncio/manutenção) — são duas listas separadas de propósito, uma é dado gerado automaticamente e a outra é curadoria manual.

## Ajustar sensibilidade

No topo de `scripts/check-status.mjs`:
- `TIMEOUT_MS` (padrão 8000): quanto tempo esperar por uma resposta antes de desistir.
- `SLOW_MS` (padrão 6000): acima disso, mesmo respondendo OK, marca como "Instável".
- Trocar o cron `"0 * * * *"` em `.github/workflows/check-status.yml` por outro valor (ex: `"*/30 * * * *"` pra rodar a cada 30 min) se quiser checar com mais frequência — no GitHub Actions isso é de graça também.
