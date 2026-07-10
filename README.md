# DopaBet Live — Simulador Fictício de Apostas com Jogos Reais

> ⚠️ **Site 100% fictício, feito apenas para entretenimento.** Nenhum valor é real, não há
> integração com dinheiro, pagamentos ou saques nas apostas. **Não aposte dinheiro real.**

Simulador de apostas esportivas com jogos e times **reais** dos principais campeonatos
(Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League, Brasileirão),
buscados em tempo real via API pública. As odds são **geradas sinteticamente** (não são
copiadas de nenhuma casa de apostas real) e "vivem" sozinhas, mudando a cada poucos segundos
pra simular o clima de uma casa de apostas de verdade — mas nenhuma aposta envolve dinheiro
real, com ou sem Premium.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Framer Motion, Zustand (+persist)
- **football-data.org** (dados reais de futebol, plano gratuito permanente)
- Supabase (login/cadastro real) + Stripe (assinatura Premium real, cosmética)

## Como rodar localmente

```bash
npm install
npm run dev
```

Sem a `FOOTBALL_DATA_API_KEY` configurada, o site funciona normalmente com jogos fictícios
de demonstração (fallback automático, sem erro).

## Pegando a chave de dados de futebol (gratuita, sem cartão)

1. Vá em [football-data.org/client/register](https://www.football-data.org/client/register)
2. Cadastre-se (gratuito, 2 minutos)
3. Copie a chave enviada por e-mail
4. Cole em `FOOTBALL_DATA_API_KEY` no `.env.local` / Vercel

Limite do plano gratuito: 10 requisições por minuto — o site já usa cache de 60 segundos
(`revalidate: 60`) para nunca chegar perto desse limite.

## Estrutura

```
app/
  page.tsx              → Home (busca jogos reais no servidor, com fallback fictício)
  historico/            → Histórico de apostas (ganhos/perdas reais do usuário)
  login/, conta/         → Autenticação (Supabase)
  premium/               → Venda da assinatura Premium (benefícios cosméticos)
  api/stripe/*           → Checkout, portal e webhook do Stripe
components/
  betting/
    matches-board.tsx    → Lista dinâmica de jogos + simula odds em tempo real
    match-card.tsx        → Card de partida com 3 mercados (1X2, Over/Under, Ambas Marcam)
lib/
  football-data.ts        → Busca e converte jogos reais da football-data.org
  matches-store.ts         → Estado das partidas + "drift" das odds ao vivo
  store.ts                 → Saldo, bilhete, histórico de apostas (Zustand + persist)
  supabase/                → Clientes de autenticação
```

## Mercados disponíveis

- **1X2** (Casa / Empate / Fora)
- **Total de gols** (Mais/Menos de 2.5)
- **Ambas as equipes marcam** (Sim/Não)

Todas as odds são calculadas de forma determinística a partir do ID da partida (mesma
partida sempre gera as mesmas odds iniciais) e depois variam sozinhas a cada ~6 segundos
enquanto a página está aberta, para simular o movimento de mercado de uma casa real.

## Decisão de design responsável (importante)

Este projeto **nunca deve vender mais créditos, mais apostas ou qualquer vantagem na aposta
por dinheiro real** — mesmo que o "prêmio" seja fictício. Uma operação de apostas com
dinheiro real exige licença de operador (no Brasil, Lei 14.790/2023, autorização da
SPA/Ministério da Fazenda). A assinatura Premium deste projeto é **cosmética apenas**.

## Configuração de login e pagamento

Reaproveita a mesma infraestrutura dos outros dois projetos (Travel Quest, Bingo da Sorte).
Se estiver usando o **mesmo projeto Supabase**, rode `supabase/migration-shared-project.sql`
(adiciona colunas `dopabet_*` sem afetar os outros dois). Se for um projeto Supabase novo,
rode `supabase/schema.sql` completo.

No Stripe, crie um produto "DopaBet Premium" com um `lookup_key` próprio, ex:
`dopabet-premium-mensal` — diferente dos outros dois sites, mesma conta Stripe serve.

## Deploy na Vercel

Mesmo processo dos outros projetos: repositório GitHub novo, importar na Vercel, configurar
as variáveis de ambiente (incluindo `FOOTBALL_DATA_API_KEY`), deploy.
