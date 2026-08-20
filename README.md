# roof-careers

Landing page de uma tela só para captação de talento criativo. O candidato lê
a chamada, preenche o cadastro, marca em que funções já entregou projeto, onde
seu trabalho já apareceu e quais ferramentas fazem parte do processo dele — com
nível em cada uma. Cada resposta vira uma linha numa planilha do Google.

**O enquadramento é deliberado: a página fala de ofício, não de IA.** O briefing
foi "quero chamar atenção de Creative Talents, não de AI Creative Talents". Por
isso o checklist é organizado por **etapa de pipeline**, com ferramenta
tradicional e de IA lado a lado: um ótimo diretor que ainda não usa IA consegue
preencher o formulário inteiro e fazer sentido. O sinal de IA continua todo
capturado — cada ferramenta carrega uma flag `ai` — mas ele é lido na planilha,
não estampado na página.

Site estático (Vite + React + TypeScript + Tailwind v4), publicado no GitHub
Pages. O sistema visual — tokens, gradiente, tipografia, componentes — é o
mesmo do [`roof-onboarding-app`](https://github.com/CarlosHallan/roof-onboarding-app).

- **PT-BR / EN** com toggle no topo (e `?lang=en` na URL).
- **Tema claro/escuro**, seguindo o sistema por padrão.
- **Sem backend próprio**: um Web App do Google Apps Script grava na planilha.

---

## Segurança: por que dá para publicar isso num repo público

A pergunta certa a fazer. A resposta curta é que **nenhuma credencial do Google
chega ao navegador**.

O que vai no bundle público é só a **URL `/exec`** do Web App. Ela não é um
segredo e não é uma chave: não dá acesso à sua conta, nem à planilha, nem a
nenhum outro dado. É um endpoint que sabe fazer exatamente uma coisa — a que
está escrita em [`apps-script/Code.gs`](apps-script/Code.gs).

Três regras sustentam isso:

1. **O script só escreve, nunca lê.** Não existe caminho no código que devolva
   linhas da planilha. *Nunca adicione um.* Enquanto isso valer, o pior que um
   estranho com a URL consegue fazer é criar linhas de lixo — jamais ler o que
   os candidatos enviaram.
2. **As credenciais ficam no Google.** O script roda *como você*, no servidor
   do Google. O navegador não guarda token, chave nem service account.
3. **O segredo do Turnstile mora em Script Properties**, do lado do servidor.
   Só a *sitekey* é pública — é assim que o Turnstile foi desenhado.

O risco real, portanto, não é vazamento: é **spam**. Contra isso há três
camadas, em ordem crescente de força:

| Camada | Onde | Pega |
| --- | --- | --- |
| Honeypot (campo invisível) | cliente + script | bots ingênuos |
| Tempo mínimo de preenchimento (4s) | cliente + script | scripts automatizados |
| Cloudflare Turnstile (opcional) | sitekey no cliente, secret no script | bots de verdade |

O que **não** funciona e por isso não está aqui: token secreto embutido no
bundle e checagem de `Origin`/`Referer` — os dois são triviais de contornar e
só dariam uma sensação falsa de proteção.

---

## Setup

### 1. Planilha + Apps Script

1. Crie (ou abra) a planilha que vai receber as respostas.
2. **Extensões → Apps Script**. Apague o conteúdo e cole
   [`apps-script/Code.gs`](apps-script/Code.gs).
3. **Configurações do projeto → Propriedades do script**, adicione o que quiser
   (todas opcionais):

   | Propriedade | Efeito |
   | --- | --- |
   | `SPREADSHEET_ID` | fixa a planilha de destino pelo ID (o trecho entre `/d/` e `/edit` na URL) |
   | `SHEET_NAME` | nome da aba (padrão: `Applications`) |
   | `TURNSTILE_SECRET` | liga a verificação do Turnstile |
   | `NOTIFY_EMAIL` | manda um e-mail a cada inscrição nova |

   > **Uma planilha só, uma aba só.** Toda resposta vira uma linha na mesma
   > tabela — é ela a visão de todo mundo que se inscreveu. Nada no script
   > ramifica por idioma, por área ou por qualquer outra coisa. Se o script foi
   > criado pelo menu da própria planilha, ele já fica amarrado a ela; o
   > `SPREADSHEET_ID` só torna isso explícito e à prova de engano.

4. Rode a função **`setupSheet`** uma vez e aprove as permissões. Ela cria a aba
   e o cabeçalho.
5. **Implantar → Nova implantação → App da Web**
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa**
6. Copie a URL `/exec`.

> Toda vez que editar o `Code.gs`, é preciso criar uma **nova versão de
> implantação** — senão a URL continua servindo o código antigo.

### 2. Local

```bash
npm install
```

Crie um `.env.local` a partir do `.env.example`:

```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
```

```bash
npm run dev
```

Abre em `http://localhost:5173/roof-careers/` (o `base` do Vite é o caminho do
GitHub Pages; veja abaixo).

### 3. GitHub Pages

O workflow [`deploy.yml`](.github/workflows/deploy.yml) builda e publica a cada
push na `main`.

No repositório:

1. **Settings → Pages → Source: GitHub Actions**.
2. **Settings → Secrets and variables → Actions**:
   - *Secret* `VITE_APPS_SCRIPT_URL` — a URL do passo 1.
   - *Variable* `BASE_PATH` — só se usar domínio próprio: `/`.
     Sem ela, o build assume `/roof-careers/`.
   - *Variable* `VITE_TURNSTILE_SITEKEY` — só se for usar Turnstile.

### 4. Turnstile (opcional, ligue quando o spam aparecer)

1. Crie um widget em [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile).
2. `VITE_TURNSTILE_SITEKEY` → variable do repositório (pública, tudo bem).
3. `TURNSTILE_SECRET` → Script Properties do Apps Script (**nunca** no repo).

Sem sitekey, o widget simplesmente não aparece e o resto continua funcionando.

---

## Estrutura

```
src/
  assets/roof-wordmark.png   a marca OFICIAL (arte cheia), usada só como máscara alfa
  data/tools.ts          lista de ferramentas do deck, agrupada — fonte da verdade
  i18n/                  pt-BR + en; todo texto visível mora aqui
  lib/submit.ts          monta o payload e faz o POST
  lib/turnstile.ts       carrega e monta o widget (no-op sem sitekey)
  sections/              Hero → About → ApplicationForm → Thanks
  styles/index.css       tokens do Roof (portados do onboarding-app)
  theme.ts               claro/escuro/sistema
apps-script/Code.gs      o Web App que grava na planilha
```

### Mexer nos textos

Tudo em `src/i18n/locales/`. Não há string solta nos componentes — se editar um
idioma, edite o outro.

### Mexer na lista de ferramentas

`src/data/tools.ts`, agrupada por **etapa de pipeline** (concepção → vídeo → 3D
→ rig/animação → performance → captura → look dev → composição → 2D → áudio →
workflow). Essa ordem não é cosmética: o conjunto de ferramentas marcado **é** a
pipeline da pessoa, então a coluna `Pipeline` da planilha sai de graça, sem
nenhuma pergunta a mais.

Cada ferramenta é declarada com `t()` (ML-first) ou `c()` (ferramenta de ofício).
A flag alimenta a coluna `AI Tools Count`. Casos cinzentos vão para `c()` de
propósito — se fotogrametria contasse como IA, o número deixaria de significar
alguma coisa.

O `id` é o que vira coluna na planilha: renomeie o `name` à vontade, mas
**mantenha o `id`**, senão as linhas antigas deixam de casar com as novas.

Depois de mexer:

```bash
npm run sync:tools
```

Isso reescreve o bloco `GENERATED` do `apps-script/Code.gs` com a lista completa
— o script precisa dela para criar uma coluna por ferramenta. `npm run
test:sheet` roda `--check` antes dos testes e **falha** se os dois lados
divergirem, então não dá para esquecer.

### As duas perguntas de chip

`src/data/profile.ts`. Elas existem para responder "essa pessoa já dirigiu?" e
"tem curta?" **sem perguntar isso a ninguém** e sem nenhum campo de texto:

- `ROLES` pergunta sobre o **trabalho**, nunca sobre a pessoa. "Você é diretor?"
  é pergunta de identidade e as pessoas inflam ou se encolhem; "em que funções
  você já entregou um projeto?" é pergunta de fato. Marcar `director` responde
  a primeira sem que a palavra tenha sido apontada para ninguém.
- `PUBLISHED_WORK` pergunta **onde** o trabalho apareceu, e só aí revela um
  campo de link. Quem não marca nada não vê campo nenhum — o formulário não
  cresce.

---

## Colunas da planilha

`setupSheet` monta a aba inteira: cria as colunas, aplica largura, formato,
alinhamento, validação, cabeçalho no marrom da marca, congelamento, filtro e
faixas zebradas. Rode de novo sempre que o schema mudar — é idempotente e
**nunca reescreve uma linha de dados**.

São **129 colunas**, em duas metades com trabalhos diferentes:

**A metade legível (esquerda)** — o que você olha ao ler *um* candidato:

`Received At · Full Name · Status · Rating · Email · Phone / WhatsApp ·
Location · Roles · Roles Count · Published In · Published Link ·
Portfolio / Demo Reel · Additional Links · Pipeline · Tools Count ·
AI Tools Count · Advanced · Intermediate · Basic · All Tools (with level) ·
Other Tools · Language · Timezone · Submitted At (client) · Form Version ·
User Agent · Notes`

**O bloco de filtragem (direita)** — uma coluna por clique:

- `Role: …` × 9 — `Yes` ou vazio. "Quem já dirigiu" é um clique no filtro.
- `Seen: …` × 7 — `Yes` ou vazio. "Quem tem curta" é um clique no filtro.
- `Tool: …` × 86 — guarda o **nível**, não um tique. Um filtro só responde
  "quem mexe com Stable Diffusion" *e* "quão fundo".

`Status` (dropdown), `Rating` (1–5, numérico e ordenável) e `Notes` são as três
colunas que o formulário não preenche — são do time.

`Pipeline` e `AI Tools Count` são **derivadas**, não perguntadas: saem do padrão
de ferramentas marcado. `Pipeline` reporta as três etapas com mais ferramentas,
como fato ("3D — modeling & assets (3) · …") e não como rótulo adivinhado — um
rótulo errado é pior que nenhum.

`Full Name` é a segunda coluna de propósito: o congelamento para nela, então o
nome fica visível enquanto você rola pelo bloco largo à direita.

### Como o schema se mantém honesto

Cabeçalho, largura, formato e o extrator do valor moram no **mesmo objeto**, em
`COLUMNS`. Antes eram duas listas paralelas: bastava alguém inserir uma coluna
no meio de uma e esquecer da outra para todas as linhas novas saírem deslocadas
uma casa, em silêncio.

Os valores são posicionados **por nome de coluna**, nunca por índice. Isso
significa que:

- arrastar uma coluna no Sheets não quebra nada;
- uma coluna sua, que o script não conhece, é preservada;
- abrir uma planilha antiga e rodar `setupSheet` **acrescenta** as colunas que
  faltam à direita, sem mexer nas que já existem nem nos dados sob elas.

Nada é apagado automaticamente: remover coluna tem perda de dado junto, e essa
decisão é de um humano. Uma planilha v1 mantém a coluna `Field of Work`
aposentada, com os dados dela intactos.

```bash
npm run test:sheet
```

Roda o `Code.gs` num sandbox com as APIs do Google stubadas e checa **58
asserções** — planilha nova, colunas reordenadas à mão, planilha v1 subindo para
v2, nível caindo na coluna certa da ferramenta certa, pipeline derivada,
honeypot, envio rápido demais e idempotência do `setupSheet`. Apps Script não
tem teste local; isso é o substituto.

> O sandbox recusa `getRange` além da largura da planilha, como o Google faz.
> Foi assim que apareceu um bug real: uma planilha nova tem 26 colunas, e
> escrever 129 cabeçalhos de uma vez lança exceção — `setupSheet` teria quebrado
> na primeira execução de verdade.

---

## A marca

`src/assets/roof-wordmark.png` (892×319) é a arte **oficial** — o mesmo arquivo
que o roof-onboarding-app chama de `roof-logo-brown.png` e que o
roof-intelligence usa como máscara. Não use o `roof-logo.png` daquele repo: é
outro desenho, em contorno (248×92), e não é a marca.

Só o **canal alfa** entra, como máscara, pintado por `--brand-logo`. As versões
brown e white oficiais têm alfa idêntico, então um arquivo serve os dois temas:
`#322127` no claro, `#f9f9f9` no escuro. O mesmo asset desenha a marca d'água
gigante do fundo, com `--watermark-ink`.

## Larguras

Duas medidas para a página inteira, em `styles/index.css`:

- `.text-column` — os blocos de leitura. Proporcional (≈60% da janela) em vez de
  um `max-width` fixo, com piso de 34rem e teto de 68rem. A relação com a janela
  se mantém em qualquer tamanho, em vez de ir de borda-a-borda a uma fita fina.
- `.wide-column` — o mosaico de ferramentas e a barra do topo.

Nenhum bloco define largura por conta própria.
