# Roteiro da apresentação (10 minutos)

A nota sai principalmente do app funcionando ao vivo, então o roteiro gasta
pouco tempo em slides e quase tudo em demonstração. Cada bloco abaixo diz qual
critério da avaliação ele cobre.

| Critério | Pontos | Onde aparece no roteiro |
| --- | --- | --- |
| Visão computacional funcionando sem erros | 4,0 | blocos 2 e 3 |
| Integrada e útil para o problema real | 2,0 | blocos 1, 2 e 3 |
| Resultados no Expo SQLite | 1,5 | bloco 4 |
| Resultados no Supabase | 1,5 | bloco 5 |
| Aplicação completa, organizada e funcional | 1,0 | bloco 6 |

## Linha do tempo

| Tempo | Bloco | O que mostrar |
| --- | --- | --- |
| 0:00 a 1:00 | **1. O problema** (slide) | Manutenção em planilha: ninguém sabe quando foi a última revisão, e muito menos se o técnico esteve mesmo lá. O app é offline-first porque a casa de máquinas não tem sinal. |
| 1:00 a 3:30 | **2. QR Code** (celular) | Lista de equipamentos com os atrasados no topo. Aba **Escanear**, apontar para a etiqueta impressa. A ficha abre e aparece a faixa verde "Visita registrada às ...". Tocar em **Registrar manutenção**, mostrar o aviso "será marcada como verificada no local", salvar. No histórico, o selo **Verificada no local**. |
| 3:30 a 6:00 | **3. OCR** (celular) | **Novo equipamento**, botão amarelo **Ler plaqueta com a câmera**, fotografar a plaqueta. Mostrar os campos preenchidos, tocar numa linha lida e mandar para um campo (prova de que dá para corrigir). **Usar estes dados**, salvar. Na ficha, a seção **Leitura da plaqueta** com o texto bruto. |
| 6:00 a 7:30 | **4. SQLite** (celular) | **Ajustes > Detalhes técnicos**: linhas de cada tabela no celular (`scans`, `nameplate_readings`, `maintenance`), versão do banco `v6`, última leitura de QR e de plaqueta. Ativar o **modo avião**, repetir uma leitura de QR e mostrar que funciona e que a fila "na fila" sobe. |
| 7:30 a 9:00 | **5. Supabase** (notebook) | Desligar o modo avião, tocar em **Enviar agora**. No **Table Editor** do Supabase, abrir `scans`, `nameplate_readings` e `maintenance` e mostrar as linhas novas, incluindo `maintenance.scan_id` apontando para a visita. |
| 9:00 a 10:00 | **6. Fechamento** (slide) | O que foi construído (QR + OCR + etiquetas em PDF + abas + nova identidade), o que o app resolve e o próximo passo (login por usuário para saber **quem** escaneou). |

## Slides (4 no total)

1. **Problema e solução:** uma frase do problema, a marca e o nome do app.
2. **Como a visão computacional entra:** desenho simples do fluxo
   `etiqueta QR -> visita -> manutenção verificada` e `plaqueta -> OCR -> cadastro`.
3. **Onde os dados ficam:** o desenho de duas caixas, SQLite no celular e
   Supabase na nuvem, com as três tabelas novas (`scans`, `nameplate_readings`,
   `maintenance.scan_id`) e a fila de envio no meio.
4. **Fechamento:** resultados e próximos passos.

## Checklist do dia anterior

- [ ] Rodar o `supabase/schema.sql` atualizado no SQL Editor (precisa estar com
      as tabelas `scans` e `nameplate_readings`).
- [ ] Gerar o **APK** com o perfil `preview` (ver README). O OCR **não funciona
      no Expo Go**. Instalar o APK no celular que será espelhado.
- [ ] Confirmar que as variáveis `EXPO_PUBLIC_SUPABASE_URL` e
      `EXPO_PUBLIC_SUPABASE_ANON_KEY` foram registradas para o perfil `preview`
      antes do build. Sem elas o APK funciona offline, mas não envia nada.
- [ ] Abrir o app **uma vez com internet** logo após instalar, para o Google
      Play Services terminar de baixar o modelo de OCR.
- [ ] Cadastrar 3 ou 4 equipamentos reais, em setores diferentes, com datas que
      deixem **um atrasado, um perto de vencer e um em dia**.
- [ ] Imprimir as etiquetas (ficha do equipamento, **Imprimir etiqueta**, ou
      **Setores**, ícone da impressora) e colar em objetos de verdade.
- [ ] Ter uma plaqueta de verdade ou uma foto impressa de uma plaqueta (com
      `MODELO` e `Nº SÉRIE` legíveis, sem reflexo) para o OCR.
- [ ] Testar o espelhamento de tela do celular na sala (scrcpy, Vysor ou cabo).
- [ ] Deixar o Supabase aberto no Table Editor, já logado, em outra janela.
- [ ] Carregar o celular e desativar o bloqueio automático de tela.

## Se algo der errado ao vivo

| Problema | O que fazer |
| --- | --- |
| A câmera não lê o QR | Tocar em **Digitar código** e digitar o código de 8 caracteres impresso embaixo do QR. O resultado é o mesmo. |
| O OCR não reconhece nada | A tela avisa e pede para chegar mais perto. Fotografar de novo com mais luz. Se continuar, digitar os campos: o cadastro funciona do mesmo jeito. |
| O OCR leu errado | Isso é esperado e faz parte da demonstração: tocar na linha certa do texto lido e escolher o campo. |
| A internet da sala caiu | Melhor ainda: mostrar que tudo funciona sem conexão, e que a fila "na fila" sobe quando ela volta. |
| O Supabase não mostra as linhas | Em **Ajustes**, **Enviar agora** e conferir o **Último erro** em **Detalhes técnicos**. A causa mais comum é não ter rodado o `schema.sql` novo. |
| O app abre em outro idioma | **Ajustes > Idioma**. |

## Perguntas que o professor pode fazer

- **Por que o QR contém um link e não só o id?** Para o mesmo código funcionar
  em duas direções: o scanner do app abre a ficha e registra a visita, e a
  câmera comum do celular abre o app pelo mesmo endereço.
- **Por que o id é gerado no celular?** Para a etiqueta poder ser impressa mesmo
  se o cadastro foi feito sem internet.
- **O que garante que a visita é verdadeira?** Hoje, que o QR só existe colado
  no equipamento. Com login por usuário (próxima etapa) a visita passa a dizer
  também quem escaneou.
- **O OCR funciona offline?** Sim. O reconhecimento roda no aparelho com o
  Google ML Kit; o modelo é baixado na instalação.
- **Por que mostrar o resultado do OCR para conferência?** Plaquetas amassadas,
  com reflexo ou riscadas geram erro. O app sugere, a pessoa confirma, e o texto
  bruto fica guardado como evidência.
