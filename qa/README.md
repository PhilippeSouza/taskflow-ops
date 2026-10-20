# 🧪 QA — TaskFlow Ops

Esta pasta documenta o trabalho de **garantia de qualidade (QA)** feito sobre o TaskFlow Ops: planejamento, casos de teste, execução, bugs encontrados e testes automatizados.

O app foi desenvolvido com apoio de IA. O meu papel aqui é **especificar, testar, validar e documentar**.

## Conteúdo

| Arquivo | O que é |
|---|---|
| [plano-de-testes.md](plano-de-testes.md) | Escopo, estratégia, ambiente, critérios de entrada/saída e riscos |
| [casos-de-teste.md](casos-de-teste.md) | 37 casos de teste com passos, resultado esperado e status |
| [relatorio-de-bugs.md](relatorio-de-bugs.md) | Bugs encontrados, com severidade, passos para reproduzir e evidência |
| [automacao/](automacao/) | Testes automatizados de interface com Playwright |

## Resumo

- 37 casos de teste escritos; 20 já cobertos e passando (19 por testes automatizados, mais o CT-13 conferido manualmente); 17 pendentes de execução manual.
- 11 bugs encontrados na 1ª rodada (19/10/2026): 2 de severidade alta, 6 média e 3 baixa. **Todos corrigidos** (o BUG-11 de forma mitigada: o navegador bloqueia `file://`, então o app agora avisa).
- 21 testes automatizados com Playwright, todos passando.

> Fluxo seguido: encontrar o bug, documentar com passos para reproduzir, corrigir e deixar um teste de regressão.

## Como executar os testes automatizados

```bash
cd qa/automacao
npm install
npx playwright test
```

Cada bug corrigido tem um teste de regressão (o nome do teste cita o CT e o BUG).
