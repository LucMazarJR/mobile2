-- Estrutura do banco online (PostgreSQL / Supabase).
--
-- Como usar: painel do Supabase > SQL Editor > New query > cole este arquivo
-- inteiro > Run. Pode ser executado mais de uma vez sem quebrar nada.
--
-- As colunas são as mesmas do SQLite local, menos "synced", que é controle
-- interno do aparelho para saber o que ainda falta enviar.

create table if not exists equipamentos (
  id uuid primary key,
  nome text not null,
  categoria text,
  localizacao text,
  intervalo_dias integer not null default 30,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists manutencoes (
  id uuid primary key,
  equipamento_id uuid not null references equipamentos(id) on delete cascade,
  tipo text not null check (tipo in ('preventiva', 'corretiva')),
  descricao text,
  responsavel text,
  data timestamptz not null,
  criado_em timestamptz not null default now()
);

create index if not exists idx_manutencoes_equipamento
  on manutencoes(equipamento_id);

-- Exclusão é lógica nos dois lados. O app não apaga a linha: preenche
-- deleted_at e reenvia. Sem isso o equipamento apagado no celular ficaria
-- para sempre aqui, porque o envio só sabe mandar linhas que existem.
alter table equipamentos add column if not exists deleted_at timestamptz;
alter table manutencoes  add column if not exists deleted_at timestamptz;

-- O Supabase liga Row Level Security por padrão e, sem nenhuma política,
-- bloqueia tudo que vem da chave anon — inclusive os INSERTs do app.
-- Como este projeto não tem login, liberamos acesso público às duas tabelas.
-- (Decisão consciente de escopo acadêmico: em um app real isso ficaria
-- restrito ao usuário autenticado.)
alter table equipamentos enable row level security;
alter table manutencoes enable row level security;

drop policy if exists acesso_publico_equipamentos on equipamentos;
create policy acesso_publico_equipamentos on equipamentos
  for all using (true) with check (true);

drop policy if exists acesso_publico_manutencoes on manutencoes;
create policy acesso_publico_manutencoes on manutencoes
  for all using (true) with check (true);
