# ⚡ TaskFlow Ops — Painel de Gestão para E-commerce, Marketplaces & Redes

> Aplicação web interativa para gestão operacional ágil de rotinas digitais, desenvolvida sob medida para operações de E-commerce (WordPress/WooCommerce), Marketplaces (Mercado Livre, Shopee) e Redes Sociais.

![Badge Status](https://img.shields.io/badge/Status-Conclu%C3%ADdo-brightgreen)
![Badge Licença](https://img.shields.io/badge/License-MIT-blue)
![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JavaScript-orange)

---

## 🎯 Sobre o Projeto

No dia a dia de quem gerencia múltiplos canais digitais, o maior desafio é equilibrar **demandas operacionais imediatas** (reputação de marketplaces, DMs, chamados) com **projetos estruturantes** (construção da loja virtual própria). 

O **TaskFlow Ops** foi projetado para eliminar a sobrecarga mental e oferecer um fluxo de trabalho claro, com foco em priorização e acompanhamento de metas.

---

## ✨ Principais Funcionalidades

* 🚀 **Termômetro de Lançamento de E-commerce:** Monitoramento do progresso percentual (0% a 100%) da implantação da loja própria WordPress/WooCommerce iniciada do zero.
* ☀️ **Visão "Meu Dia" (*My Day*):** Foco diário nas prioridades inegociáveis para não se perder na rotina.
* 🛒 **Marketplaces Estruturados por Canal:**
  * **🟠 Shopee (Ponto Focal):** Operação principal, chat, rotinas automatizadas e campanhas oficiais.
  * **🟡 Mercado Livre (Setup & Tração):** Validação fiscal, primeiras vendas e padrão de fotos.
  * **🔵 Magalu (Setup & Catálogo):** Homologação, tabela Magalu Entregas e carga de catálogo.
  * **📦 Amazon (Setup & Buy Box):** Seller Central, GTIN/EAN e logística DBA.
* 📱 **Redes Sociais — Meta Orgânico (Instagram & Facebook):**
  * Centralização no Meta Business Suite, calendário editorial e engajamento com a comunidade (sem tráfego pago nesta fase).
* 🔁 **Rotinas Recorrentes & Aguardando:** Checkpoints diários/semanais e acompanhamento de chamados e aprovações.
* 🏷️ **Filtros Ágeis por Tags:** Busca instantânea por `#shopee`, `#mercadolivre`, `#wordpress`, `#instagram` ou `#urgente`.
* 🧩 **Etapas (Subtarefas):** Detalhamento de passos para tarefas complexas.
* 💾 **Persistência e Portabilidade:** Salvamento automático no navegador (`localStorage`) e suporte a exportação/importação de dados em JSON (`tarefas.json`).

---

## 🛠️ Tecnologias Utilizadas

* **HTML5 Semântico:** Estrutura acessível e modular.
* **CSS3 Moderno:** Layout responsivo com Flexbox, CSS Grid, variáveis customizadas e paleta dark mode premium inspirada em interfaces modernas (Linear / Microsoft To Do).
* **Vanilla JavaScript (ES6+):** Manipulação de DOM reativa, filtros dinâmicos, cálculos de progresso e persistência local, sem dependência de bibliotecas externas.

---

## 💻 Como Executar Localmente

1. Clone este repositório:
   ```bash
   git clone https://github.com/PhilippeSouza/taskflow-ops.git
   ```
2. Abra o arquivo `index.html` diretamente em qualquer navegador moderno, ou execute o `Abrir_Meu_ToDo.bat` no Windows.

---

## 🌐 Demonstração Online (GitHub Pages)

Você pode testar a aplicação diretamente pelo navegador através do **GitHub Pages**:  
👉 **[https://philippesouza.github.io/taskflow-ops/](https://philippesouza.github.io/taskflow-ops/)**.

---

## 🧪 Qualidade (QA)

O projeto tem uma rodada de testes documentada na pasta [`qa/`](qa/): plano de testes, 37 casos de teste, relatório com 11 bugs encontrados e corrigidos (com passos para reproduzir) e 21 testes automatizados com Playwright.

> O app foi desenvolvido com apoio de IA; o meu papel é especificar, testar, validar e documentar.

Nota: ao abrir o `index.html` direto pelo arquivo (`file://`), o Chrome bloqueia a leitura do `tarefas.json` (BUG-11); o app mostra um aviso e você pode usar "Importar". Prefira o link do GitHub Pages ou um servidor local.

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

Desenvolvido por **Philippe Souza** como parte do portfólio de soluções em tecnologia e operações para e-commerce.
