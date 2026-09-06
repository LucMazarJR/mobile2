# Controle de Manutenção

Aplicativo mobile (React Native + Expo) para acompanhar a manutenção de
equipamentos: extintores, ar-condicionados, geradores, máquinas de laboratório
e afins.

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

O `eas-cli` já está nas dependências do projeto, então `npx eas` funciona depois
do `npm install`. Não precisa instalar nada global.

### Passo a passo

**1. Criar uma conta**

Em [expo.dev](https://expo.dev), gratuita. Depois, no terminal, na pasta do
projeto:

```bash
npx eas login
```

**2. Vincular o projeto à sua conta**

```bash
npx eas init
```

Isso gera um `projectId` e grava no `app.json`. Só precisa ser feito uma vez;
o outro integrante do grupo pula este passo depois que o arquivo for commitado.

**3. Registrar as credenciais do Supabase**

O build acontece na nuvem e o `.env` não sobe junto, porque está no
`.gitignore`. Sem este passo o APK sai funcionando offline, mas com a cópia na
nuvem desligada.

```bash
npx eas env:set preview --name EXPO_PUBLIC_SUPABASE_URL --value https://seuprojeto.supabase.co --visibility plaintext

npx eas env:set preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value eyJhbGciOi... --visibility plaintext
```

A chave `anon` é pública por natureza, ela já fica embutida em qualquer build do
app. Quem não pode sair do painel do Supabase de jeito nenhum é a
`service_role`.

**4. Gerar o APK**

```bash
npx eas build -p android --profile preview
```

O perfil `preview` do [`eas.json`](eas.json) está configurado para gerar **APK**
e não AAB, que é o formato que instala direto no aparelho. O primeiro build
costuma levar de 10 a 20 minutos por causa da fila do plano gratuito.

**5. Enviar**

Ao terminar, o comando mostra um link de download. Ele também fica em
[expo.dev](https://expo.dev), na aba Builds do projeto. Mande esse link para
quem for testar. No celular, o Android vai pedir para autorizar a instalação de
fontes desconhecidas.

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
    index.tsx                lista de equipamentos
    sectors.tsx              criação e gestão dos setores
    about.tsx                como os dados são guardados + detalhes técnicos
    equipment/
      new.tsx                cadastro
      [id]/
        index.tsx            ficha + histórico
        edit.tsx             edição
        maintenance.tsx      registrar/editar manutenção
  components/                componentes de interface reutilizáveis
  db/                        schema, migrações e acesso aos dados
  i18n/                      textos em pt-BR e en
  services/                  cliente Supabase, cópia na nuvem, ids
  utils/                     status, categorias e formatação
supabase/
  schema.sql                 estrutura equivalente no PostgreSQL
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

## Próxima etapa (2º bimestre)

Leitura de **QR Code** com a câmera: cada equipamento recebe uma etiqueta
impressa com o próprio identificador, o mesmo "código da etiqueta" que já
aparece na ficha hoje. O técnico escaneia, o app abre a ficha direto e registra a
leitura numa terceira tabela, que sobe para a nuvem pelo mesmo mecanismo já
existente.

O identificador é gerado no aparelho, e não pelo banco, justamente por causa
disso: o QR precisa poder ser impresso mesmo que o cadastro tenha sido feito
offline.
