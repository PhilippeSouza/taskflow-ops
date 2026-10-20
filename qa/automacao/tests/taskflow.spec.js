const { test, expect } = require('@playwright/test');

// Cada teste começa com o localStorage limpo (dados iniciais do tarefas.json)
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#count-all')).toHaveText('24');
});

async function adicionar(page, titulo, tags = '') {
  await page.fill('#new-task-title', titulo);
  if (tags) await page.fill('#new-task-tags', tags);
  await page.click('#btn-add-task');
}

// ---------- Casos que devem passar ----------

test('CT-01 carga inicial: 24 tarefas', async ({ page }) => {
  await page.click('[data-filter="all"]');
  await page.click('#btn-hide-completed'); // mostra concluídas também
  const total = await page.evaluate(() => tasks.length);
  expect(total).toBe(24);
});

test('CT-05 adicionar tarefa com Enter', async ({ page }) => {
  await page.fill('#new-task-title', 'Tarefa de teste');
  await page.press('#new-task-title', 'Enter');
  await expect(page.locator('.task-title').first()).toHaveText('Tarefa de teste');
  await expect(page.locator('#new-task-title')).toHaveValue('');
});

test('CT-06 título vazio ou só espaços não adiciona', async ({ page }) => {
  const antes = await page.evaluate(() => tasks.length);
  await adicionar(page, '   ');
  const depois = await page.evaluate(() => tasks.length);
  expect(depois).toBe(antes);
});

test('CT-07 tags sem # ganham #', async ({ page }) => {
  await adicionar(page, 'Com tags', 'urgente, loja');
  const tags = await page.evaluate(() => tasks[0].tags);
  expect(tags).toEqual(['#urgente', '#loja']);
});

test('CT-22 busca por tag ignora maiúsculas', async ({ page }) => {
  await page.click('[data-filter="all"]');
  const esperado = await page.evaluate(
    () => tasks.filter((t) => (t.tags || []).some((tag) => tag.toLowerCase().includes('#shopee'))).length
  );
  expect(esperado).toBeGreaterThan(0);
  await page.fill('#search-input', '#SHOPEE');
  await expect(page.locator('#tasks-count-label')).toHaveText(esperado + ' TAREFAS');
});

test('CT-34 termômetro WordPress: 1 de 7 = 14%', async ({ page }) => {
  await page.evaluate(() => {
    tasks.find((t) => t.category === 'wordpress').completed = true;
    saveTasks();
  });
  await expect(page.locator('#wp-progress-pill')).toHaveText('14%');
});

test('CT-27 localStorage inválido: o app se recupera', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('taskflow_tasks_v2', '{oops'));
  await page.reload();
  await expect(page.locator('#count-all')).toHaveText('24');
});

// ---------- Regressão dos bugs corrigidos ----------
// Cada teste abaixo falhava antes da correção (ver relatorio-de-bugs.md).

test('CT-09 / BUG-01: título com HTML aparece como texto', async ({ page }) => {
  await adicionar(page, '<img src=x onerror="window.__xss=1">');
  const executou = await page.evaluate(() => window.__xss === 1);
  expect(executou).toBe(false);
  await expect(page.locator('.task-title').first()).toHaveText('<img src=x onerror="window.__xss=1">');
});

test('CT-33 / BUG-02: o aviso do "Recarregar Estrutura" diz a verdade', async ({ page }) => {
  let mensagem = '';
  page.on('dialog', async (d) => {
    mensagem = d.message();
    await d.dismiss();
  });
  await page.click('#btn-reset');
  expect(mensagem).toContain('descarta');
  expect(mensagem).toContain('Salvar tarefas.json');
});

test('CT-10 / BUG-03: tag com apóstrofo filtra ao clicar', async ({ page }) => {
  await adicionar(page, 'Tag com apostrofo', "a'b");
  await page.locator('.tag-pill', { hasText: "#a'b" }).click();
  await expect(page.locator('#search-input')).toHaveValue("#a'b");
  await expect(page.locator('#tasks-count-label')).toHaveText('1 TAREFAS');
});

test('CT-08 / BUG-04: tags vazias são descartadas', async ({ page }) => {
  await adicionar(page, 'Tags vazias', 'a,,b, ,#c');
  const tags = await page.evaluate(() => tasks[0].tags);
  expect(tags).toEqual(['#a', '#b', '#c']);
});

test('CT-14 / BUG-05: ids são únicos mesmo no mesmo milissegundo', async ({ page }) => {
  const ids = await page.evaluate(() => {
    Date.now = () => 1700000000000; // fixa o relógio
    for (let i = 0; i < 3; i++) {
      newTaskTitle.value = 'rapida ' + i;
      handleAddTask();
    }
    return tasks.slice(0, 3).map((t) => t.id);
  });
  expect(new Set(ids).size).toBe(3);
});

async function importar(page, conteudo, confirmar = true) {
  const mensagens = [];
  page.on('dialog', async (d) => {
    mensagens.push(d.message());
    if (d.type() === 'confirm' && !confirmar) await d.dismiss();
    else await d.accept();
  });
  await page.setInputFiles('#file-import', {
    name: 'import.json',
    mimeType: 'application/json',
    buffer: Buffer.from(conteudo),
  });
  await page.waitForTimeout(300);
  return mensagens;
}

test('CT-31 / BUG-06: importar objeto mostra erro e não altera nada', async ({ page }) => {
  const msgs = await importar(page, '{"a":1}');
  expect(msgs.join(' ')).toContain('inválido');
  await expect(page.locator('#count-all')).toHaveText('24');
});

test('CT-32 / BUG-07: importar lista inválida é recusado', async ({ page }) => {
  const msgs = await importar(page, '[1,2,3]');
  expect(msgs.join(' ')).toContain('inválido');
  await expect(page.locator('#count-all')).toHaveText('24');
});

test('CT-30: importar lista válida pede confirmação e substitui', async ({ page }) => {
  const valido = JSON.stringify([{ id: 'x1', title: 'Única', category: 'shopee' }]);
  const msgs = await importar(page, valido);
  expect(msgs.join(' ')).toContain('Importar 1 tarefa');
  await expect(page.locator('#count-all')).toHaveText('1');
});

test('CT-30b: cancelar a confirmação mantém os dados', async ({ page }) => {
  const valido = JSON.stringify([{ id: 'x1', title: 'Única', category: 'shopee' }]);
  await importar(page, valido, false);
  await expect(page.locator('#count-all')).toHaveText('24');
});

test('CT-25 / BUG-09: botão "Ocultar Concluídas" bate com a lista', async ({ page }) => {
  const botaoAtivo = await page.locator('#btn-hide-completed').evaluate((el) => el.classList.contains('active'));
  const ocultando = await page.evaluate(() => hideCompleted);
  expect(botaoAtivo).toBe(ocultando);
  await page.click('#btn-hide-completed');
  const ativoDepois = await page.locator('#btn-hide-completed').evaluate((el) => el.classList.contains('active'));
  expect(ativoDepois).toBe(true);
  await expect(page.locator('#btn-hide-completed')).toHaveText('Mostrar Concluídas');
});

test('CT-28 / BUG-08: localStorage "null" volta ao arquivo', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('taskflow_tasks_v2', 'null'));
  await page.reload();
  await expect(page.locator('#count-all')).toHaveText('24');
});

test('CT-28b: localStorage com lista inválida volta ao arquivo', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('taskflow_tasks_v2', '[1,2]'));
  await page.reload();
  await expect(page.locator('#count-all')).toHaveText('24');
});

test('CT-35 / BUG-10: termômetro zera sem tarefas WordPress', async ({ page }) => {
  await page.evaluate(() => {
    tasks.find((t) => t.category === 'wordpress').completed = true;
    saveTasks();
    tasks = tasks.filter((t) => t.category !== 'wordpress');
    saveTasks();
  });
  await expect(page.locator('#wp-progress-pill')).toHaveText('0%');
});

test('CT-36 / BUG-11: via file:// mostra aviso em vez de lista vazia sem explicação', async ({ page }) => {
  const caminho = require('path').join(__dirname, '..', '..', '..', 'index.html');
  await page.goto('file:///' + caminho.replace(/\\/g, '/'));
  await page.click('[data-filter="all"]');
  await expect(page.locator('.empty-state')).toBeVisible();
  const texto = await page.locator('.empty-state').innerText();
  // Se o navegador permitir o fetch via file://, a lista carrega normalmente.
  const carregou = await page.evaluate(() => tasks.length > 0);
  if (!carregou) expect(texto).toContain('tarefas.json');
});
