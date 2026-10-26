# Stamp

Aplicativo mobile (React Native + Expo) para acompanhar a manutenção de
equipamentos: extintores, ar-condicionados, geradores, máquinas de laboratório
e afins. Cada equipamento tem uma **etiqueta com QR Code** que prova que o
técnico esteve diante dele, e a **plaqueta de identificação** pode ser lida pela
câmera para preencher o cadastro.

O nome vem do carimbo de inspeção: cada visita ao equipamento é carimbada pelo
app, com data, hora e a prova de que o técnico esteve lá. A marca desenha a
plaqueta metálica presa ao equipamento, que é o que o app lê.

Interface em **português e inglês**; o código, os arquivos e o banco de dados
estão em inglês.

## O problema

Escolas, condomínios e pequenas empresas controlam manutenção em planilha ou
papel. O resultado é que ninguém sabe com segurança quando cada equipamento foi
revisado pela última vez, o que foi feito e por quem. Pior: o técnico costuma
estar justamente onde não há sinal: casa de máquinas, subsolo, depósito.

Por isso o app é **offline-first**: tudo é gravado na hora no banco local do
aparelho (SQLite) e uma cópia sobe para o banco online (Supabase/PostgreSQL)
assim que a conexão volta.

Os equipamentos podem ser agrupados em **setores** (cozinha, garagem, bloco A),
para o responsável conseguir perguntar "o que está pendente na cozinha" em vez
de percorrer uma lista única.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| App | React Native + Expo (Expo Router) |
| Banco local | Expo SQLite |
| Banco online | Supabase (PostgreSQL) |
| Visão computacional | QR Code (`expo-camera`) e OCR (Google ML Kit, `@zhanziyang/expo-text-extractor`) |
| Etiquetas | `qrcode` (matriz do QR) + `expo-print` / `expo-sharing` (PDF) |
| Linguagem | TypeScript |

## Como rodar

### 1. Instalar as dependências

```bash
npm install
```

### 2. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta (o plano gratuito basta).
2. Clique em **New project**, escolha um nome e defina a senha do banco.
3. Aguarde alguns minutos até o projeto terminar de subir.
4. Vá em **SQL Editor > New query**, cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql)
   e clique em **Run**. Isso cria as tabelas e libera o acesso do app.
5. Vá em **Project Settings > Data API** e copie a **Project URL** e a chave
   **anon public**.

### 3. Configurar as credenciais

```bash
cp .env.example .env
```

Preencha o `.env` com os dados copiados no passo anterior:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> A URL termina em `.supabase.co` e nada mais. Se você copiar o "RESTful
> endpoint" do painel, ela vem com `/rest/v1/` no final e toda requisição falha
> com `PGRST125`. O cliente já acrescenta esse caminho sozinho.

O `.env` não vai para o Git; cada integrante do grupo cria o seu. Sem essas
credenciais o app continua funcionando offline, apenas com a cópia na nuvem
desligada.

### 4. Iniciar o app

```bash
npx expo start
```

Leia o QR Code com o app **Expo Go** no celular, ou pressione `a` para abrir num
emulador Android. Depois de mexer no `.env`, reinicie com `npx expo start -c`:
variáveis de ambiente só entram no bundle quando o Metro sobe.

## Gerar um APK para instalar no celular

Para alguém testar o app sem precisar do Expo Go e sem o servidor rodando, o
caminho é o build na nuvem do Expo (EAS). O plano gratuito atende, e ele resolve
a assinatura do APK sozinho, que é a parte chata de fazer na mão.

Os comandos abaixo usam `npx eas-cli@latest`, que baixa o CLI na hora. O nome do
pacote é `eas-cli` e não `eas`: chamar `npx eas` dá o erro
`could not determine executable to run`.

O CLI de propósito **não** está nas dependências do projeto. Ele é pesado e
acaba sendo instalado também na máquina de build, o que quebra a fase de
instalação de dependências.

### Passo a passo

**1. Criar uma conta**

Em [expo.dev](https://expo.dev), gratuita. Depois, no terminal, na pasta do
projeto:

```bash
npx eas-cli@latest login
```

**2. Vincular o projeto à sua conta**

```bash
npx eas-cli@latest init
```

Isso grava `projectId`, `owner` e `slug` no `app.json`. Só precisa ser feito uma
vez; o outro integrante do grupo pula este passo depois que o arquivo for
commitado.

> As variáveis do passo seguinte ficam guardadas **por projeto**. Se você rodar
> o `init` de novo e ele vincular a outro projeto, o build vai avisar que não
> encontrou variável nenhuma. Confira com `npx eas-cli@latest project:info` que
> o projeto é o mesmo em que você registrou as credenciais.

**3. Registrar as credenciais do Supabase**

O build acontece na nuvem e o `.env` não sobe junto, porque está no
`.gitignore`. Sem este passo o APK sai funcionando offline, mas com a cópia na
nuvem desligada.

```bash
npx eas-cli@latest env:set preview --name EXPO_PUBLIC_SUPABASE_URL --value https://seuprojeto.supabase.co --visibility plaintext

npx eas-cli@latest env:set preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value eyJhbGciOi... --visibility plaintext
```

A chave `anon` é pública por natureza, ela já fica embutida em qualquer build do
app. Quem não pode sair do painel do Supabase de jeito nenhum é a
`service_role`.

**4. Gerar o APK**

```bash
npx eas-cli@latest build -p android --profile preview
```

O perfil `preview` do [`eas.json`](eas.json) está configurado para gerar **APK**
e não AAB, que é o formato que instala direto no aparelho. O primeiro build
costuma levar de 10 a 20 minutos por causa da fila do plano gratuito.

**5. Enviar**

Ao terminar, o comando mostra um link de download. Ele também fica em
[expo.dev](https://expo.dev), na aba Builds do projeto. Mande esse link para
quem for testar. No celular, o Android vai pedir para autorizar a instalação de
fontes desconhecidas.

## Visão computacional (2º bimestre)

Duas funcionalidades, as duas ligadas ao problema real: saber **quem esteve
diante de qual equipamento e quando**, e não perder tempo digitando dados de
plaquetas em lugares ruins.

### 1. QR Code: a visita como prova de presença

1. O equipamento recebe uma etiqueta impressa (ficha do equipamento, botão
   **Imprimir etiqueta**, ou em **Setores** para imprimir as etiquetas de todo o
   setor de uma vez, em PDF).
2. O técnico abre a aba **Escanear** e aponta a câmera para o QR.
3. O app abre a ficha e grava uma **visita** (`scans`) com data e hora.
4. A manutenção registrada a partir dessa visita guarda `scan_id` e aparece no
   histórico com o selo **Verificada no local**.

O QR contém um link, `stamp://visit/<id>`. Lido pelo app, abre a ficha e
registra a visita. Lido pela câmera comum do celular, abre o app pelo mesmo
endereço. Etiquetas impressas na fase em que o app se chamava Plaqueta continuam valendo
dentro do app, porque o scanner reconhece o identificador em qualquer endereço;
só a abertura pela câmera comum do celular depende do endereço novo. Toda leitura
passa pela rota [`src/app/visit/[id].tsx`](src/app/visit/%5Bid%5D.tsx),
o único lugar que grava visitas, então não existe segundo caminho que possa
esquecer de gravar.

Se o equipamento foi cadastrado em outro celular e ainda não chegou neste, o app
busca na nuvem antes de dizer que não achou. Se a etiqueta estiver rasgada, dá
para digitar o código de 8 caracteres impresso embaixo do QR.

### 2. OCR: cadastro pela plaqueta

No cadastro e na edição, **Ler plaqueta com a câmera** fotografa a plaqueta do
equipamento. O texto é reconhecido no próprio aparelho (Google ML Kit, funciona
sem internet), e [`src/utils/nameplate.ts`](src/utils/nameplate.ts) separa
fabricante, modelo e número de série a partir dos rótulos comuns (`MODELO`,
`MOD`, `S/N`, `Nº SÉRIE`, `FABRICANTE`, marcas conhecidas, valor na linha de
baixo, vários rótulos na mesma linha).

O resultado nunca vai direto para o banco: aparece para conferência, e cada linha
lida pode ser mandada para um campo com um toque. Ao salvar, o texto bruto fica
guardado em `nameplate_readings` como evidência, e aparece na ficha em **Leitura
da plaqueta**.

> **OCR exige o app instalado (APK ou development build).** O leitor é código
> nativo e não existe no Expo Go. No Expo Go o botão abre uma tela explicando
> isso, e o QR Code continua funcionando normalmente. O plugin
> [`plugins/withOcrModel.js`](plugins/withOcrModel.js) pede ao Google Play Services
> que baixe o modelo de OCR junto com a instalação do APK; sem isso a primeira
> leitura precisaria de internet.

### Onde os resultados ficam

| Resultado | SQLite (local) | Supabase (nuvem) |
| --- | --- | --- |
| Visita (leitura de QR) | `scans` | `scans` |
| Leitura da plaqueta | `nameplate_readings` e colunas `manufacturer`, `model`, `serial_number` em `equipment` | idem |
| Manutenção verificada no local | `maintenance.scan_id` | `maintenance.scan_id` |

Tudo entra na mesma fila de envio das demais tabelas (`synced = 0` e envio
automático). A migração local é a **v6** em [`src/db/schema.ts`](src/db/schema.ts).

> **Antes de testar a nuvem:** rode o [`supabase/schema.sql`](supabase/schema.sql)
> de novo no SQL Editor. Ele é seguro de repetir e só acrescenta as tabelas e
> colunas novas.

Em **Ajustes > Detalhes técnicos** dá para ver, ao vivo, quantas linhas cada
tabela tem no celular, quantas estão na fila de envio, a última leitura de QR e o
texto da última leitura de plaqueta. É o painel indicado para mostrar o SQLite
na apresentação.

## Identidade visual

"Ficha técnica industrial": papel quente, tinta preta como cor da marca, amarelo
de sinalização só para a ação principal (escanear) e para o foco, cantos quase
retos e tipografia condensada (Barlow Condensed nos títulos e números, IBM Plex
Sans no texto, IBM Plex Mono em códigos, datas e contadores). Vermelho, âmbar e
verde são reservados ao status do equipamento e nunca aparecem como decoração.
O ícone, o splash e a marca dentro do app saem do mesmo desenho
([`assets/brand`](assets/brand)): uma plaqueta com dois rebites e o canto de um QR.

## Como a cópia na nuvem funciona

Toda gravação acontece primeiro no SQLite, com a coluna `synced = 0`. Um serviço
envia as linhas pendentes ao Supabase e marca `synced = 1`. O envio é disparado
quando a conexão volta, quando o app retorna ao primeiro plano, ao puxar a lista
para baixo, e logo após cada gravação.

Exclusão é **lógica**: o app preenche `deleted_at` e reenvia a linha, em vez de
apagá-la. Sem isso o equipamento apagado no celular ficaria para sempre na
nuvem, porque o envio só sabe mandar linhas que ainda existem.

Na direção contrária, `INSERT OR IGNORE` traz da nuvem só o que este aparelho
nunca viu, e o local sempre vence. Isso resolve todos os conflitos de uma vez: o
que foi editado aqui sobrevive, e o que foi apagado aqui não ressuscita.

## Estrutura do projeto

```
src/
  app/                       telas (rotas do Expo Router)
    (tabs)/                  abas: equipamentos, escanear, setores, ajustes
    visit/[id].tsx           registra a visita de um QR e abre a ficha
    equipment/
      new.tsx                cadastro
      ocr.tsx                leitura da plaqueta pela câmera
      [id]/
        index.tsx            ficha, QR, histórico e visitas
        edit.tsx             edição
        maintenance.tsx      registrar/editar manutenção
  components/                componentes de interface reutilizáveis
  db/                        schema, migrações e acesso aos dados
  i18n/                      textos em pt-BR e en
  services/                  nuvem, ids, QR, OCR e etiquetas em PDF
  utils/                     status, categorias, leitura de plaquetas
plugins/
  withOcrModel.js            pede o modelo de OCR na instalação do APK
assets/brand/                desenho da marca (SVG) que gera ícone e splash
supabase/
  schema.sql                 estrutura equivalente no PostgreSQL
docs/
  apresentacao.md            roteiro e checklist da apresentação
```

## Convenções

- **Código, arquivos, tabelas e colunas em inglês.** Só a interface é bilíngue.
- **Nenhum termo técnico chega ao usuário.** Nada de "sincronizar", "Supabase",
  "banco", "registro" ou `.env` na tela. O conceito é "salvo aqui + cópia
  automática na nuvem". Todo texto vive em [`src/i18n/pt-BR.ts`](src/i18n/pt-BR.ts),
  que é a fonte de verdade; [`src/i18n/en.ts`](src/i18n/en.ts) é tipado contra
  ela, então o TypeScript acusa qualquer tradução faltando.
- **Erros de biblioteca nunca aparecem na interface.** Vão para o `console` e
  para o painel de detalhes técnicos da tela Sobre.
- **Migrações são um histórico, não uma foto.** `src/db/schema.ts` roda por
  `PRAGMA user_version`; passos antigos não são reescritos, porque já rodaram em
  aparelhos reais.
