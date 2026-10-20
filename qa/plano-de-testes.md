# Plano de Testes — TaskFlow Ops

**Autor:** Philippe Souza · **Versão:** 1.0 · **Data:** 19/10/2026

## 1. Objetivo
Verificar se o TaskFlow Ops cumpre o que o README promete (gestão de tarefas por canal, busca, subtarefas, progresso do e-commerce, persistência e importação/exportação) e identificar defeitos de funcionalidade, robustez e segurança.

## 2. Escopo
**Dentro do escopo**
- Navegação por visões/canais e contadores (badges)
- Criar, concluir, favoritar, marcar "Meu Dia" e excluir tarefas
- Subtarefas (marcar/desmarcar e contador)
- Busca e filtro por tag; "Ocultar Concluídas"
- Termômetro de progresso do E-commerce WordPress
- Persistência (`localStorage`), exportar, importar e recarregar do `tarefas.json`
- Entrada de dados inválidos ou maliciosos
- Abertura via servidor HTTP e via arquivo (`file://`)

**Fora do escopo (nesta rodada)**
- Desempenho e carga
- Acessibilidade completa (leitor de tela)
- Testes em navegadores além do Chromium

## 3. Estratégia
| Tipo | Como |
|---|---|
| Funcional (caixa-preta) | Casos de teste manuais em `casos-de-teste.md` |
| Exploratório | Sessões curtas buscando entradas incomuns (HTML, apóstrofo, vírgulas, JSON inválido) |
| Valor-limite e classes de equivalência | Título vazio, só espaços, muito longo; lista com 0 tarefas |
| Segurança básica | Injeção de HTML/script (XSS) em título, tags e importação |
| Regressão automatizada | Playwright em `automacao/` |

## 4. Ambiente
- Windows 11, Chromium (via Playwright / navegador do Claude Code)
- App servido por servidor estático local (`http://127.0.0.1:8765`)
- Dados iniciais: `tarefas.json` do repositório (24 tarefas)
- Antes de cada caso: limpar o `localStorage` (a chave usada é `taskflow_tasks_v2`)

## 5. Critérios
- **Entrada:** app abre sem erro no console; dados iniciais carregados.
- **Saída:** 100% dos casos executados; nenhum bug de severidade Alta aberto; bugs Médios com decisão registrada.

## 6. Severidade
- **Alta:** perda de dados ou falha de segurança.
- **Média:** funcionalidade quebrada ou comportamento enganoso, com contorno.
- **Baixa:** cosmético ou pouco provável.

## 7. Riscos
- Dados ficam só no navegador: limpar o cache apaga tudo.
- Código gerado com apoio de IA: maior chance de entradas não tratadas.
- Sem testes automatizados antes deste trabalho.

## 8. Entregáveis
Casos de teste, relatório de bugs, testes automatizados e este plano.
