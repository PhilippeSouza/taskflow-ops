# Casos de Teste — TaskFlow Ops

**Pré-condição geral:** abrir o app por servidor HTTP (`http://127.0.0.1:8765`) e limpar o `localStorage` (DevTools > Application > Local Storage > Clear). Os dados iniciais são as 24 tarefas do `tarefas.json`.

**Status:** ✅ Passou · ❌ Falhou (com o bug) · ⏳ Pendente de execução manual

Execução da 1ª rodada: 19/10/2026, Chromium, script no console do navegador (as chamadas usam as funções do próprio app e eventos reais de input/arquivo).

## Resumo
- Total: 37 · ✅ 20 · ❌ 0 · ⏳ 17
- 1ª rodada (antes das correções): ✅ 5 · ❌ 10. Os 10 que falharam foram corrigidos e viraram testes automatizados de regressão (ver `relatorio-de-bugs.md`).
- Casos com ✅ de CT-01 a CT-36 estão cobertos por `automacao/tests/taskflow.spec.js`; os ⏳ são para execução manual.

## Carga e navegação
| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| CT-01 | Carga inicial | Abrir o app com o `localStorage` vazio | 24 tarefas carregadas do `tarefas.json` | ✅ |
| CT-02 | Filtro por canal | Clicar em "Shopee" | Só tarefas da categoria Shopee aparecem | ⏳ |
| CT-03 | Contadores (badges) | Concluir uma tarefa de "Todas as Tarefas" | O badge de "Todas" diminui em 1 | ⏳ |
| CT-04 | Título da visão | Clicar em cada item do menu | O título no topo muda para o da visão | ⏳ |

## Adicionar tarefa
| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| CT-05 | Adicionar com Enter | Digitar "Teste" e apertar Enter | Tarefa aparece no topo e o campo é limpo | ✅ |
| CT-06 | Título vazio | Deixar vazio ou digitar só espaços e clicar em Adicionar | Nada é adicionado | ✅ |
| CT-07 | Tags sem # | Tags: `urgente, loja` | Salvas como `#urgente`, `#loja` | ✅ |
| CT-08 | Tags com vírgula sobrando | Tags: `a,,b` | Só `#a` e `#b` (sem tag `#` vazia) | ✅ |
| CT-09 | Título com HTML | Título: `<img src=x onerror=alert(1)>` | Mostrado como texto, sem executar | ✅ |
| CT-10 | Tag com apóstrofo | Tags: `a'b`, clicar na tag criada | A busca é preenchida com `#a'b` | ✅ |
| CT-11 | Título longo | Título com 300 caracteres | Quebra de linha sem estourar o layout | ⏳ |
| CT-12 | Adicionar em "Importantes" | Ir em Importantes e adicionar | Tarefa criada já com ⭐ | ⏳ |
| CT-13 | Categoria x visão | Em "Todas as Tarefas", adicionar com categoria Shopee | Tarefa na Shopee, fora de "Meu Dia" | ✅ |
| CT-14 | Ids únicos | Adicionar 3 tarefas em sequência rápida | 3 ids diferentes | ✅ |

## Ações na tarefa
| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| CT-15 | Concluir | Clicar no checkbox e depois no título | Alterna entre concluída e pendente | ⏳ |
| CT-16 | Favoritar | Clicar em ⭐ | Tarefa vai para "Importantes" | ⏳ |
| CT-17 | Meu Dia | Clicar em ☀️ | Tarefa entra e sai de "Meu Dia" | ⏳ |
| CT-18 | Excluir | Clicar em 🗑️ e confirmar | Tarefa removida | ⏳ |
| CT-19 | Cancelar exclusão | Clicar em 🗑️ e cancelar | Tarefa continua na lista | ⏳ |
| CT-20 | Subtarefa | Marcar uma etapa | Contador "Etapas (x/y)" atualiza | ⏳ |

## Busca e filtros
| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| CT-21 | Busca por título | Buscar parte do título em maiúsculas | Acha sem diferenciar maiúsculas | ⏳ |
| CT-22 | Busca por tag | Em "Todas as Tarefas", buscar `#SHOPEE` | Acha todas as tarefas com a tag `#shopee` (3 nos dados iniciais) | ✅ |
| CT-23 | Clique na tag | Clicar numa tag | Campo de busca recebe a tag e filtra | ⏳ |
| CT-24 | Sem resultados | Buscar `zzzz` | Mostra o estado vazio e "0 TAREFAS" | ⏳ |
| CT-25 | Ocultar Concluídas | Abrir o app e ver o botão | O estado do botão bate com o que a lista mostra | ✅ |

## Persistência, exportação e importação
| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| CT-26 | Persistência | Adicionar tarefa e recarregar a página (F5) | Tarefa continua lá | ⏳ |
| CT-27 | localStorage inválido | Gravar `{oops` na chave e recarregar | App volta ao `tarefas.json` sem quebrar | ✅ |
| CT-28 | localStorage `null` | Gravar `null` na chave e recarregar | App volta ao `tarefas.json` | ✅ |
| CT-29 | Exportar | Clicar em "Salvar tarefas.json" | Baixa JSON válido com todas as tarefas | ⏳ |
| CT-30 | Importar válido | Importar um JSON exportado | Tarefas substituídas e aviso de sucesso | ✅ |
| CT-31 | Importar objeto | Importar `{"a":1}` | Mensagem de erro clara | ✅ |
| CT-32 | Importar lista inválida | Importar `[1,2,3]` | Recusado, dados atuais preservados | ✅ |
| CT-33 | Recarregar Estrutura | Criar uma tarefa e clicar em "Recarregar Estrutura" | Tarefa local preservada (o texto promete sincronizar) | ✅ |

## Progresso WordPress e compatibilidade
| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| CT-34 | Termômetro | Concluir 1 das 7 tarefas WordPress | 14% (1/7 arredondado) | ✅ |
| CT-35 | Termômetro sem tarefas | Excluir todas as tarefas WordPress | Volta a 0% | ✅ |
| CT-36 | Abrir via `file://` | Abrir `index.html` com duplo clique (ou `Abrir_Meu_ToDo.bat`) | Lista inicial carrega | ✅ |
| CT-37 | Layout mobile | Largura de 375 px | Sem rolagem horizontal; menu utilizável | ⏳ |
