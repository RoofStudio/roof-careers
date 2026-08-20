# roof-careers

Landing page de uma tela só para captação de talento criativo. O candidato lê
a chamada, preenche o cadastro, marca em que funções já entregou projeto, onde
seu trabalho já apareceu e quais ferramentas fazem parte do processo dele — com
nível em cada uma. Cada resposta vira uma linha numa planilha do Google.

**O enquadramento é deliberado: a página fala de ofício, não de IA.** O briefing
foi "quero chamar atenção de Creative Talents, não de AI Creative Talents".
Nenhum título ou rótulo da página carrega "AI" — a palavra aparece só dentro do
texto do convite e nas perguntas específicas sobre ferramentas, onde ela é
precisa em vez de ser um crachá.

O conteúdo vem de FORMULARIO ROUGH V5: 20 áreas de produção, 300 checkboxes,
**204 ferramentas distintas**, mais área de atuação, prática profissional,
experiência com IA, tipos de projeto liderados e etapas de pipeline.

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

`src/data/tools.ts` — 20 áreas de produção, na ordem do V5.

**A mesma ferramenta aparece em todas as áreas a que pertence, de propósito.**
Runway está lá 8 vezes, Autodesk Flow Studio 7. Isso não é duplicação para
limpar: "Runway para VFX" e "Runway para storyboard" são fatos diferentes sobre
a pessoa, e essa diferença é justamente o que torna a resposta útil. Por isso
uma seleção é identificada por **área + ferramenta**, nunca por ferramenta
sozinha.

Na planilha os dois lados se reconciliam: **uma coluna por ferramenta distinta**
(204, não 300), guardando a lista de áreas em que a pessoa marcou. Um filtro só
responde "quem trabalha com Stable Diffusion" *e* "para quê".

O V5 abandonou o nível por ferramenta. Com 300 checkboxes, pedir nível em cada
uma não é um formulário que alguém termine — e uma escala repetida 300 vezes é
respondida por reflexo, não por reflexão. Profundidade passou a ser perguntada
uma vez só, nas perguntas de experiência.

### Mexer nas perguntas de perfil

`src/data/profile.ts`. Nenhuma delas tem campo de texto: o briefing era
descobrir se a pessoa já dirigiu, se tem curta e qual a pipeline dela "sem
perguntar explicitamente e sem deixar a pessoa escrever sobre isso".

`PROJECT_TYPES` é a mais afiada — pergunta em que tipos de projeto a pessoa teve
**papel criativo de liderança**, então "já dirigiu?" é respondido como fato
sobre o trabalho, e cada tipo revela o próprio link de créditos só quando
marcado.

### Depois de mexer em qualquer um dos dois

```bash
npm run sync:tools
```

Reescreve o bloco `GENERATED` do `apps-script/Code.gs` com todos os rosters — o
script precisa deles para criar uma coluna por resposta. `npm run test:sheet`
roda `--check` antes dos testes e **falha** se os dois lados divergirem.

---

## Colunas da planilha

`setupSheet` monta a aba inteira: cria as colunas, aplica largura, formato,
alinhamento, validação, cabeçalho no marrom da marca, congelamento, filtro e
faixas zebradas. Rode de novo sempre que o schema mudar — é idempotente e
**nunca reescreve uma linha de dados**.

São **310 colunas**, em duas metades com trabalhos diferentes.

**A metade legível (29 colunas, à esquerda)** — o que você olha ao ler *um*
candidato: `Received At · Full Name · Status · Rating · Primary Expertise ·
Email · Phone · Location · Portfolio · Additional Links · IMDb / Credits ·
Additional Reels · Practice Areas · Practice Count · AI Experience ·
AI Workflow · AI Relationship · Led Projects · Pipeline Stages · Pipeline
Count · Tools Count · All Tools · Other Tools · Language · Timezone ·
Submitted At · Form Version · User Agent · Notes`

**O bloco de filtragem (281 colunas, à direita)** — uma coluna por clique:

| Prefixo | Quantas | Valor |
| --- | --- | --- |
| `Area:` | 26 | `Yes` ou vazio — áreas da prática profissional |
| `Stage:` | 25 | `Yes` ou vazio — etapas de pipeline |
| `Workflow:` | 6 | `Yes` ou vazio — como monta workflows |
| `Led:` | 10 | `Yes` ou vazio — liderou projeto desse tipo |
| `Link:` | 10 | o link de créditos daquele tipo, ao lado |
| `Tool:` | 204 | **as áreas** em que usa a ferramenta |

As colunas de ferramenta guardam a lista de áreas, não um tique. Um filtro só em
`Tool: Runway` responde quem usa **e** para quê — e as 300 caixas do formulário
custam 204 colunas em vez de 300.

`Status` (dropdown), `Rating` (1–5, numérico e ordenável) e `Notes` são as três
colunas que o formulário não preenche — são do time.

`Full Name` é a segunda coluna de propósito: o congelamento para nela, então o
nome fica visível enquanto você rola pelo bloco largo.

### Como o schema se mantém honesto

Cabeçalho, largura, formato e o extrator do valor moram no **mesmo objeto**, em
`COLUMNS`. Os valores são posicionados **por nome de coluna**, nunca por índice:

- arrastar uma coluna no Sheets não quebra nada;
- uma coluna sua, que o script não conhece, é preservada;
- rodar `setupSheet` numa planilha antiga **acrescenta** as colunas que faltam à
  direita, sem mexer nas existentes nem nos dados sob elas.

Nada é apagado automaticamente: remover coluna tem perda de dado junto, e essa
decisão é de um humano.

```bash
npm run test:sheet
```

Roda o `Code.gs` num sandbox com as APIs do Google stubadas e checa **64
asserções** — planilha nova, colunas reordenadas à mão, planilha v2 subindo para
v3, a mesma ferramenta marcada em várias áreas, ids desconhecidos, seleções
vazias, honeypot, envio rápido demais e idempotência. Apps Script não tem teste
local; isso é o substituto.

> O sandbox recusa `getRange` além da largura da planilha, como o Google faz.
> Foi assim que apareceu um bug real: uma planilha nova tem 26 colunas, e
> escrever os cabeçalhos de uma vez lança exceção — `setupSheet` teria quebrado
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
