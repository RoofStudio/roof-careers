# roof-careers

Landing page de uma tela só para captação de talento criativo com IA. O
candidato lê a chamada, preenche o cadastro, marca as ferramentas que usa (com
nível) e envia. Cada resposta vira uma linha numa planilha do Google.

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

`src/data/tools.ts`. O `id` de cada ferramenta é o que vai para a planilha:
renomeie o `name` à vontade, mas **mantenha o `id`**, senão as linhas antigas
deixam de casar com as novas.

Os títulos dos grupos ficam em `tools.groups.*` nos dois locales.

---

## Colunas da planilha

`setupSheet` monta a aba inteira: cria as colunas, aplica largura, formato de
data, alinhamento, cabeçalho no marrom da marca, congelamento, filtro e faixas
zebradas. Rode de novo sempre que o schema mudar — é idempotente e **nunca
reescreve uma linha de dados**.

| # | Coluna | Vem de |
| --- | --- | --- |
| 1 | Received At | carimbo do servidor |
| 2 | Status | nasce como `Novo`; dropdown para a sua triagem |
| 3 | Full Name | formulário |
| 4 | Email | formulário |
| 5 | Phone / WhatsApp | formulário |
| 6 | Location | formulário |
| 7 | Field of Work | formulário (opcional) |
| 8 | Portfolio / Demo Reel | formulário |
| 9 | Additional Links | formulário (opcional) |
| 10 | Tools Count | número, para ordenar |
| 11 | Advanced | ferramentas nesse nível |
| 12 | Intermediate | ferramentas nesse nível |
| 13 | Basic | ferramentas nesse nível |
| 14 | All Tools (with level) | lista completa |
| 15 | Other Tools | o que o candidato escreveu à mão |
| 16 | Language | idioma em que preencheu |
| 17 | Timezone | fuso do navegador |
| 18 | Submitted At (client) | relógio do candidato, para auditoria |
| 19 | Form Version | bump quando o conjunto de campos mudar |
| 20 | User Agent | navegador |
| 21 | Notes | livre, para o time |

`Advanced` / `Intermediate` / `Basic` separadas existem para triagem: dá para
filtrar "quem domina Midjourney" sem quebrar a coluna de texto completa.

`Status` e `Notes` são as duas únicas colunas que o formulário não preenche —
são suas. Se não quiser, apague as entradas correspondentes em `COLUMNS`.

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
decisão é de um humano.

```bash
npm run test:sheet
```

Roda o `Code.gs` num sandbox com as APIs do Google stubadas e checa as 37
asserções desse contrato — planilha nova, planilha com colunas reordenadas,
planilha legada sem as colunas novas, honeypot, envio rápido demais e
idempotência do `setupSheet`. Apps Script não tem teste local; isso é o
substituto.

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
