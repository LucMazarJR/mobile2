-- Dados de exemplo, inspirados na estrutura de salas da faculdade.
--
-- Como usar: Supabase > SQL Editor > New query > cole este arquivo > Run.
-- Depois, no app, abra Sobre e toque em "Buscar da nuvem" para baixar tudo.
--
-- Pode ser executado mais de uma vez: os identificadores sao fixos e os
-- inserts ignoram o que ja existe. As datas sao relativas ao momento da
-- execucao, entao os status (em dia, vence logo, atrasado) continuam variados
-- independentemente de quando voce rodar.

begin;

-- Setores
insert into sectors (id, name, created_at, updated_at) values
  ('973ac6f8-5f15-4968-88cb-781798c017c3', 'Unidade 1', now(), now()),
  ('d1d1b60d-d7ae-430c-a3b8-ea16f9a59532', 'Unidade 2', now(), now()),
  ('b4a7ce3c-8f88-4bfb-b3f3-62cdb5227216', 'Unidade 3', now(), now())
on conflict (id) do nothing;

-- Equipamentos: 4 projetores (um por sala) e 16 computadores
insert into equipment (id, name, category, location, sector_id, interval_days, created_at, updated_at) values
  ('c7c91db0-9391-4756-aac2-0a03c301d2de', 'Projetor Sala 16', 'Projetor', 'Sala 16', '973ac6f8-5f15-4968-88cb-781798c017c3', 180, now() - interval '365 days', now() - interval '365 days'),
  ('2e50f837-1c91-4ba5-b968-e492a49a6183', 'PC 1 - 73QV4', 'Computador', 'Sala 16', '973ac6f8-5f15-4968-88cb-781798c017c3', 90, now() - interval '300 days', now() - interval '300 days'),
  ('5db69fbe-5134-4c0d-ac3c-fe3d5d35b138', 'PC 2 - BDT75', 'Computador', 'Sala 16', '973ac6f8-5f15-4968-88cb-781798c017c3', 90, now() - interval '300 days', now() - interval '300 days'),
  ('a32322d6-257e-4017-8a58-be79676fb0fe', 'Projetor Sala 17', 'Projetor', 'Sala 17', '973ac6f8-5f15-4968-88cb-781798c017c3', 180, now() - interval '365 days', now() - interval '365 days'),
  ('079d211b-78ee-478a-8303-e9ec6d7ab09e', 'PC 3 - BC9FM', 'Computador', 'Sala 17', '973ac6f8-5f15-4968-88cb-781798c017c3', 90, now() - interval '300 days', now() - interval '300 days'),
  ('290906e3-48ee-4472-bf76-a2606f2c826b', 'PC 4 - YE2WE', 'Computador', 'Sala 17', '973ac6f8-5f15-4968-88cb-781798c017c3', 90, now() - interval '95 days', now() - interval '95 days'),
  ('5a3282ea-f443-4ec6-ac8a-738b78238995', 'Projetor Sala 107', 'Projetor', 'Sala 107', 'd1d1b60d-d7ae-430c-a3b8-ea16f9a59532', 180, now() - interval '365 days', now() - interval '365 days'),
  ('838367c4-422e-45dc-9948-59cfd9116f9c', 'PC 5 - 3CRAT', 'Computador', 'Sala 107', 'd1d1b60d-d7ae-430c-a3b8-ea16f9a59532', 90, now() - interval '300 days', now() - interval '300 days'),
  ('71f41c83-6678-44ba-9cb4-b8335b0b5b61', 'PC 6 - 6GNLT', 'Computador', 'Sala 107', 'd1d1b60d-d7ae-430c-a3b8-ea16f9a59532', 90, now() - interval '300 days', now() - interval '300 days'),
  ('ad183e32-c5f7-4182-beea-4b09c13531db', 'Projetor Sala 207', 'Projetor', 'Sala 207', 'd1d1b60d-d7ae-430c-a3b8-ea16f9a59532', 180, now() - interval '365 days', now() - interval '365 days'),
  ('9e8802ef-2728-4eaa-ac5e-65a22f71d10d', 'PC 7 - Y4TKM', 'Computador', 'Sala 207', 'd1d1b60d-d7ae-430c-a3b8-ea16f9a59532', 90, now() - interval '10 days', now() - interval '10 days'),
  ('dd4ab7f8-c6e7-43f9-bca0-ddb57d9b76ed', 'PC 8 - C3C9S', 'Computador', 'Sala 207', 'd1d1b60d-d7ae-430c-a3b8-ea16f9a59532', 90, now() - interval '300 days', now() - interval '300 days'),
  ('9b44b66f-eee2-4ef1-bf70-fb6f32789e17', 'PC 9 - SAWNX', 'Computador', 'Lab 4', 'b4a7ce3c-8f88-4bfb-b3f3-62cdb5227216', 90, now() - interval '300 days', now() - interval '300 days'),
  ('5116c543-cf1f-4499-b6bc-59be3f446807', 'PC 10 - SXMEJ', 'Computador', 'Lab 4', 'b4a7ce3c-8f88-4bfb-b3f3-62cdb5227216', 90, now() - interval '300 days', now() - interval '300 days'),
  ('c3357d86-7e7d-4bf5-bd8b-dc8634aced47', 'PC 11 - ZS57T', 'Computador', 'Lab 4', 'b4a7ce3c-8f88-4bfb-b3f3-62cdb5227216', 90, now() - interval '300 days', now() - interval '300 days'),
  ('6559d239-7e4d-41af-9715-670ad4439219', 'PC 12 - W8CVS', 'Computador', 'Lab 4', 'b4a7ce3c-8f88-4bfb-b3f3-62cdb5227216', 90, now() - interval '30 days', now() - interval '30 days'),
  ('e10a8695-7ac1-4761-8c68-cd7f8c364d49', 'PC 13 - FCULT', 'Computador', 'Lab 4', 'b4a7ce3c-8f88-4bfb-b3f3-62cdb5227216', 90, now() - interval '300 days', now() - interval '300 days'),
  ('984ae519-4604-46bc-81a5-e0ba3ae76720', 'PC 14 - 34CCT', 'Computador', 'Lab 4', 'b4a7ce3c-8f88-4bfb-b3f3-62cdb5227216', 90, now() - interval '300 days', now() - interval '300 days'),
  ('0e0afdd8-d0ad-417e-a3b6-81f898dd5595', 'PC 15 - EXZAC', 'Computador', 'Lab 4', 'b4a7ce3c-8f88-4bfb-b3f3-62cdb5227216', 90, now() - interval '300 days', now() - interval '300 days'),
  ('56ef0e03-19a7-4e36-95f7-fc90ae5275bd', 'PC 16 - PCF22', 'Computador', 'Lab 4', 'b4a7ce3c-8f88-4bfb-b3f3-62cdb5227216', 90, now() - interval '120 days', now() - interval '120 days')
on conflict (id) do nothing;

-- Historico de manutencoes, com datas espalhadas para variar os status
insert into maintenance (id, equipment_id, type, description, technician, performed_at, created_at) values
  ('9a50213b-f2c2-4d82-a25a-05aeb8fc6d92', 'c7c91db0-9391-4756-aac2-0a03c301d2de', 'preventive', 'Limpeza do filtro e verificacao da lampada', 'Equipe de TI', now() - interval '200 days', now() - interval '200 days'),
  ('a70e2ee8-46e6-4bb6-92d8-87843ac0a1a3', '2e50f837-1c91-4ba5-b968-e492a49a6183', 'preventive', 'Revisao geral e atualizacao do sistema', 'Suporte tecnico', now() - interval '120 days', now() - interval '120 days'),
  ('78d4261d-5bed-401d-bca7-35c34a5c98a6', '5db69fbe-5134-4c0d-ac3c-fe3d5d35b138', 'preventive', 'Troca de memoria e teste de disco', 'Manutencao predial', now() - interval '5 days', now() - interval '5 days'),
  ('d9d1fab0-745b-477e-9524-09e278fab7fb', 'a32322d6-257e-4017-8a58-be79676fb0fe', 'preventive', 'Limpeza do filtro e verificacao da lampada', 'Manutencao predial', now() - interval '90 days', now() - interval '90 days'),
  ('ccc49d7c-69b6-491b-abaa-9af06182910f', '079d211b-78ee-478a-8303-e9ec6d7ab09e', 'corrective', 'Limpeza de coolers e verificacao de fonte', 'Equipe de TI', now() - interval '88 days', now() - interval '88 days'),
  ('e002a414-ffe6-4bd3-a178-a6b3e36e75c1', '5a3282ea-f443-4ec6-ac8a-738b78238995', 'corrective', 'Limpeza do filtro e verificacao da lampada', 'Suporte tecnico', now() - interval '175 days', now() - interval '175 days'),
  ('8b013686-d3c4-4bb7-ad13-12eb27aacac0', '838367c4-422e-45dc-9948-59cfd9116f9c', 'preventive', 'Revisao geral e atualizacao do sistema', 'Manutencao predial', now() - interval '30 days', now() - interval '30 days'),
  ('d0ba3f34-e5a1-4b8b-bdd9-9932a4890179', '71f41c83-6678-44ba-9cb4-b8335b0b5b61', 'corrective', 'Troca de memoria e teste de disco', 'Equipe de TI', now() - interval '100 days', now() - interval '100 days'),
  ('b9148ba1-0fbd-4fe7-9298-821f4ca1fc4b', 'dd4ab7f8-c6e7-43f9-bca0-ddb57d9b76ed', 'preventive', 'Limpeza interna e troca de pasta termica', 'Manutencao predial', now() - interval '86 days', now() - interval '86 days'),
  ('0b2bae32-8d55-44f5-967b-4ddc8dc5b72d', '9b44b66f-eee2-4ef1-bf70-fb6f32789e17', 'corrective', 'Revisao geral e atualizacao do sistema', 'Equipe de TI', now() - interval '200 days', now() - interval '200 days'),
  ('0045e4fb-3087-460c-b10a-2214ddca79cc', '5116c543-cf1f-4499-b6bc-59be3f446807', 'preventive', 'Troca de memoria e teste de disco', 'Suporte tecnico', now() - interval '20 days', now() - interval '20 days'),
  ('9fbe352b-918b-44a4-9c2e-5fadc1a39aaf', 'c3357d86-7e7d-4bf5-bd8b-dc8634aced47', 'preventive', 'Limpeza de coolers e verificacao de fonte', 'Manutencao predial', now() - interval '89 days', now() - interval '89 days'),
  ('4608f661-5470-4698-8c23-3387a6db80f8', 'e10a8695-7ac1-4761-8c68-cd7f8c364d49', 'preventive', 'Revisao geral e atualizacao do sistema', 'Suporte tecnico', now() - interval '95 days', now() - interval '95 days'),
  ('b1bab7a8-4906-49a0-8c6f-ca7462f7833c', '984ae519-4604-46bc-81a5-e0ba3ae76720', 'preventive', 'Troca de memoria e teste de disco', 'Manutencao predial', now() - interval '60 days', now() - interval '60 days'),
  ('7b34d9d0-0f6c-4f29-a3aa-ae0bd7c3ccc1', '0e0afdd8-d0ad-417e-a3b6-81f898dd5595', 'corrective', 'Limpeza de coolers e verificacao de fonte', 'Equipe de TI', now() - interval '84 days', now() - interval '84 days')
on conflict (id) do nothing;

commit;
