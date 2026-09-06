# Controle de Manutenção de Equipamentos

Aplicativo mobile (React Native + Expo) para registrar e acompanhar a manutenção
de equipamentos — extintores, ar-condicionados, geradores, máquinas de laboratório
e afins.

## O problema

Escolas, condomínios e pequenas empresas controlam manutenção em planilha ou papel.
O resultado é que ninguém sabe com segurança quando cada equipamento foi revisado
pela última vez, o que foi feito e por quem. Pior: o técnico costuma estar
justamente onde não há sinal de internet — casa de máquinas, subsolo, depósito.

Por isso o app é **offline-first**: tudo é gravado na hora no banco local do
aparelho (SQLite) e enviado ao banco online (Supabase/PostgreSQL) assim que a
conexão volta.

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

O `.env` não vai para o Git. Cada integrante do grupo cria o seu.

> Sem essas credenciais o app continua funcionando normalmente offline — apenas
> a sincronização fica desativada, com um aviso na tela inicial.

### 4. Iniciar o app

```bash
npx expo start
```

Leia o QR Code com o app **Expo Go** no celular, ou pressione `a` para abrir num
emulador Android.

## Como a sincronização funciona

Toda gravação acontece primeiro no SQLite, com a coluna `synced = 0`. Um serviço
de sincronização envia as linhas pendentes ao Supabase e marca `synced = 1`.

A sincronização é disparada quando:

- a conexão de rede volta;
- o app retorna ao primeiro plano;
- o usuário puxa a lista para baixo;
- um novo registro é criado (tentativa imediata).

Se o envio falhar, as linhas continuam pendentes e a próxima tentativa reenvia.
A faixa no topo da tela inicial mostra quantos registros ainda faltam enviar.

## Estrutura do projeto

```
src/
  app/                    telas (rotas do Expo Router)
    index.tsx             lista de equipamentos
    equipamento/
      novo.tsx            cadastro de equipamento
      [id]/
        index.tsx         ficha + histórico de manutenções
        nova-manutencao.tsx
  components/             componentes de interface reutilizáveis
  db/                     schema do SQLite e funções de acesso aos dados
  services/               cliente Supabase, sincronização e geração de ids
  utils/                  cálculo de status e formatação de datas
supabase/
  schema.sql              estrutura equivalente no PostgreSQL
```

## Próxima etapa (2º bimestre)

Leitura de **QR Code** com a câmera: cada equipamento recebe uma etiqueta impressa
com seu identificador. O técnico escaneia a etiqueta, o app abre a ficha do
equipamento direto e registra a leitura numa tabela `escaneamentos`, que também é
sincronizada com o Supabase.
