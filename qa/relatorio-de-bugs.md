# Relatório de Bugs — TaskFlow Ops

**Rodada:** 19/10/2026 · **Versão testada:** commit `33e425f` (bugs encontrados) · correções aplicadas na sequência · **Navegador:** Chromium · **Ambiente:** `http://127.0.0.1:8765`

| ID | Título | Severidade | Status | Evidência |
|---|---|---|---|---|
| BUG-01 | Título/tags/etapas são inseridos como HTML (XSS) | Alta | Corrigido | Reproduzido (título) |
| BUG-02 | "Recarregar Estrutura" apaga tarefas locais e o texto engana | Alta | Corrigido | Reproduzido |
| BUG-03 | Tag com apóstrofo quebra o clique de filtro | Média | Corrigido | Reproduzido (HTML gerado) |
| BUG-04 | Tags vazias viram `#` | Baixa | Corrigido | Reproduzido |
| BUG-05 | Ids duplicados ao adicionar tarefas em sequência | Média | Corrigido | Reproduzido |
| BUG-06 | Importar JSON que não é lista não mostra nada | Média | Corrigido | Reproduzido |
| BUG-07 | Importar lista inválida é aceito e sobrescreve tudo | Média | Corrigido | Reproduzido |
| BUG-08 | `localStorage` com `null` derruba o app | Baixa | Corrigido | Reproduzido |
| BUG-09 | "Ocultar Concluídas" aparece ativo, mas concluídas aparecem | Média | Corrigido | Reproduzido |
| BUG-10 | Progresso WordPress não zera sem tarefas | Baixa | Corrigido | Reproduzido |
| BUG-11 | Lista vem vazia ao abrir por `file://` | Média | Corrigido (mitigado) | Reproduzido no Chrome |

---

## BUG-01 — Conteúdo digitado é inserido como HTML (XSS)
- **Severidade:** Alta (segurança)
- **Onde:** `app.js`, `renderTasks()` — títulos, tags e etapas entram em `innerHTML` sem escape.
- **Passos:** 1) Em "Adicionar uma tarefa", digitar `<img src=x onerror="window.__xss=1">`. 2) Apertar Enter.
- **Esperado:** o texto aparece literalmente na lista.
- **Obtido:** o HTML é interpretado e o `onerror` executa (`window.__xss === 1`).
- **Impacto:** quem importar um JSON de terceiros pode executar script no navegador. Os mesmos pontos de entrada valem para tags, etapas e `categoryName` (pela leitura do código; só o título foi reproduzido).
- **Sugestão:** usar `textContent` ou escapar `& < > " '` antes de montar o HTML.

## BUG-02 — "Recarregar Estrutura" apaga tarefas locais e o texto engana
- **Severidade:** Alta (perda de dados)
- **Passos:** 1) Adicionar "minha tarefa local". 2) Clicar em "🔄 Recarregar Estrutura" e confirmar.
- **Esperado:** conforme o aviso ("as alterações locais serão sincronizadas com o arquivo"), a tarefa local é preservada.
- **Obtido:** a lista é substituída pelo `tarefas.json` e a tarefa local some.
- **Sugestão:** corrigir o texto para "suas alterações locais serão perdidas" ou mesclar por `id`.

## BUG-03 — Tag com apóstrofo quebra o filtro por clique
- **Passos:** criar tarefa com a tag `a'b`.
- **Obtido:** HTML gerado `onclick="filterByTag('#a'b')"`, que é erro de sintaxe: clicar na tag não faz nada.
- **Sugestão:** usar `addEventListener` com `data-tag` em vez de `onclick` inline.

## BUG-04 — Tags vazias viram `#`
- **Passos:** tags `a,,b`.
- **Obtido:** `["#a","#","#b"]`. **Esperado:** `["#a","#b"]`.
- **Sugestão:** filtrar itens vazios depois do `split(',')`.

## BUG-05 — Ids duplicados
- **Passos:** adicionar 3 tarefas em sequência rápida.
- **Obtido:** ids `t-…258`, `t-…258` (repetido). Ao concluir uma delas, só a primeira muda.
- **Causa:** `id: 't-' + Date.now()`. O bug só aparece quando duas tarefas são criadas no mesmo milissegundo (na tela, um clique manual dificilmente repete; importações ou automação sim). O teste automatizado fixa o relógio para reproduzir sempre.
- **Sugestão:** `crypto.randomUUID()` ou contador.

## BUG-06 — Importar JSON que não é lista não mostra nada
- **Passos:** importar um arquivo com `{"a":1}`.
- **Obtido:** nenhuma mensagem. **Esperado:** aviso de que o arquivo precisa ser uma lista de tarefas.

## BUG-07 — Importar lista inválida é aceito
- **Passos:** importar `[1,2,3]`.
- **Obtido:** mensagem "Tarefas importadas com sucesso!" e as tarefas anteriores são substituídas, sem confirmação.
- **Sugestão:** validar o formato (`id`, `title`, `category`) e pedir confirmação antes de sobrescrever.

## BUG-08 — `localStorage` com `null` derruba o app
- **Passos:** gravar `null` em `taskflow_tasks_v2` e recarregar.
- **Obtido:** `tasks` vira `null` e o app lança `TypeError: Cannot read properties of null (reading 'filter')`.
- **Contraste:** com JSON inválido (`{oops`), o app se recupera (CT-27 passou).
- **Sugestão:** conferir `Array.isArray(tasks)` depois do `JSON.parse`.

## BUG-09 — "Ocultar Concluídas" aparece ativo mas não está
- **Passos:** abrir o app e ver o botão.
- **Obtido:** o botão tem a classe `active` e o texto "Ocultar Concluídas", mas a variável `hideCompleted` começa `false`: as concluídas aparecem. O primeiro clique muda o texto para "Mostrar Concluídas" e passa a ocultá-las.
- **Esperado:** o estado visual do botão bate com o que a lista mostra.
- **Sugestão:** iniciar o botão sem `active` ou iniciar `hideCompleted = true`.

## BUG-10 — Progresso WordPress não zera
- **Passos:** concluir 1 de 7 tarefas WordPress (14%), depois excluir todas as tarefas WordPress.
- **Obtido:** a barra e o selo continuam em 14%. **Esperado:** 0%.
- **Causa:** `updateWpProgress()` faz `return` quando não há tarefas WordPress.

## BUG-11 — Lista vazia ao abrir por `file://`
- **Passos:** abrir `index.html` direto do disco (ou pelo `Abrir_Meu_ToDo.bat`) no Chrome.
- **Obtido:** o Chrome bloqueia o `fetch` do `tarefas.json` (CORS, origem `null`) e o app mostrava a lista vazia, sem explicação.
- **Correção (mitigação):** o app agora mostra um aviso claro, com as alternativas (GitHub Pages, servidor local ou botão "Importar"). O bloqueio do navegador continua existindo; a lista inicial só carrega por HTTP.

---

## Observações (não são bugs)
- `dueDate` existe nos dados mas não aparece nem pode ser editado na interface.
- Não há edição de título nem criação de etapas pela interface.
- Dados ficam só no `localStorage`: limpar o cache do navegador apaga tudo (use "Salvar tarefas.json" como backup).

---

## Correções aplicadas (`app.js` e `index.html`)
| Bug | O que mudou | Teste de regressão |
|---|---|---|
| BUG-01 | Função `esc()` escapa título, etapas, tags, nome da categoria e ids antes de montar o HTML | CT-09 |
| BUG-02 | O aviso agora diz que as alterações locais são descartadas e orienta a usar "Salvar tarefas.json" antes | CT-33 |
| BUG-03 | Tags usam `data-tag` + `addEventListener` (sem `onclick` inline) | CT-10 |
| BUG-04 | Tags são limpas (`#` repetido removido) e as vazias descartadas | CT-08 |
| BUG-05 | `newId()` usa `crypto.randomUUID()` (com contador de reserva) | CT-14 |
| BUG-06 / BUG-07 | `normalizeTasks()` valida a lista (precisa ser lista de objetos com `title` em texto), mostra erro claro e pede confirmação antes de substituir os dados | CT-31, CT-32, CT-30 |
| BUG-08 | Dados do `localStorage` passam pela mesma validação; se inválidos, volta ao `tarefas.json` | CT-28, CT-28b |
| BUG-09 | O botão "Ocultar Concluídas" começa inativo, coerente com a lista | CT-25 |
| BUG-10 | O progresso passa a mostrar 0% quando não há tarefas WordPress | CT-35 |
| BUG-11 | Aviso explicativo quando o `tarefas.json` não carrega | CT-36 |

Resultado: 21 testes automatizados, todos passando (22 s, Chrome).
