// Estado da Aplicação
let tasks = [];
let currentFilter = 'myDay';
let searchQuery = '';
let hideCompleted = false;
let loadFailed = false;

// Elementos do DOM
const taskListEl = document.getElementById('task-list');
const currentViewTitleEl = document.getElementById('current-view-title');
const currentDateStrEl = document.getElementById('current-date-str');
const searchInput = document.getElementById('search-input');
const newTaskTitle = document.getElementById('new-task-title');
const newTaskCategory = document.getElementById('new-task-category');
const newTaskTags = document.getElementById('new-task-tags');
const btnAddTask = document.getElementById('btn-add-task');
const btnHideCompleted = document.getElementById('btn-hide-completed');
const wpProgressBanner = document.getElementById('wp-progress-banner');
const wpProgressBar = document.getElementById('wp-progress-bar');
const wpProgressText = document.getElementById('wp-progress-text');
const wpProgressPill = document.getElementById('wp-progress-pill');
const shopeeBanner = document.getElementById('shopee-focus-banner');
const btnExport = document.getElementById('btn-export');
const btnReset = document.getElementById('btn-reset');
const btnImportToggle = document.getElementById('btn-import-toggle');
const fileImport = document.getElementById('file-import');

// Escapa texto para uso seguro dentro de HTML (evita XSS)
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Id único mesmo quando duas tarefas são criadas no mesmo milissegundo
let idCounter = 0;
function newId() {
  if (window.crypto && crypto.randomUUID) return 't-' + crypto.randomUUID();
  idCounter += 1;
  return 't-' + Date.now() + '-' + idCounter;
}

// Valida e normaliza uma lista de tarefas; devolve null se o formato for inválido
function normalizeTasks(list) {
  if (!Array.isArray(list)) return null;
  const result = [];
  for (const item of list) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    if (typeof item.title !== 'string' || !item.title.trim()) return null;
    const category = typeof item.category === 'string' ? item.category : 'myDay';
    result.push({
      id: typeof item.id === 'string' && item.id ? item.id : newId(),
      title: item.title,
      category: category,
      categoryName: typeof item.categoryName === 'string' ? item.categoryName : (categoryNames[category] || 'Geral'),
      myDay: Boolean(item.myDay),
      important: Boolean(item.important),
      completed: Boolean(item.completed),
      dueDate: typeof item.dueDate === 'string' ? item.dueDate : '',
      tags: Array.isArray(item.tags) ? item.tags.filter(t => typeof t === 'string' && t.trim()) : [],
      subtasks: Array.isArray(item.subtasks)
        ? item.subtasks.filter(st => st && typeof st.title === 'string').map((st, i) => ({
            id: typeof st.id === 'string' && st.id ? st.id : (item.id || 'st') + '-' + (i + 1),
            title: st.title,
            completed: Boolean(st.completed)
          }))
        : []
    });
  }
  return result;
}

// Mapeamento de Títulos das Listas
const viewTitles = {
  myDay: '☀️ Meu Dia',
  important: '⭐ Tarefas Importantes',
  all: '📋 Todas as Tarefas',
  shopee: '🟠 Shopee (Ponto Focal & Operação)',
  mercadolivre: '🟡 Mercado Livre (Setup & Tração)',
  magalu: '🔵 Magalu (Setup & Catálogo)',
  amazon: '📦 Amazon (Setup & Buy Box)',
  wordpress: '🚀 Projeto: E-commerce WordPress',
  meta: '📱 Meta (Instagram & Facebook Orgânico)',
  rotinas: '🔁 Rotinas Recorrentes',
  aguardando: '⏳ Aguardando / Chamados'
};

const categoryNames = {
  shopee: '🟠 Shopee',
  mercadolivre: '🟡 Mercado Livre',
  magalu: '🔵 Magalu',
  amazon: '📦 Amazon',
  wordpress: '🚀 E-commerce WordPress',
  meta: '📱 Meta (Insta & Face)',
  rotinas: '🔁 Rotinas Recorrentes',
  aguardando: '⏳ Aguardando',
  myDay: '☀️ Geral'
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  renderDate();
  setupEventListeners();
  await loadTasks();
  renderApp();
});

function renderDate() {
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const today = new Date().toLocaleDateString('pt-BR', options);
  currentDateStrEl.textContent = today.charAt(0).toUpperCase() + today.slice(1);
}

// Carregar tarefas
async function loadTasks(forceReloadFromFile = false) {
  if (!forceReloadFromFile) {
    const localData = localStorage.getItem('taskflow_tasks_v2');
    if (localData) {
      try {
        const parsed = normalizeTasks(JSON.parse(localData));
        if (parsed) {
          tasks = parsed;
          return;
        }
        console.error('Dados do LocalStorage em formato inválido; recarregando do arquivo.');
      } catch (e) {
        console.error('Erro ao ler LocalStorage:', e);
      }
    }
  }

  // Buscar do arquivo tarefas.json
  try {
    const res = await fetch('tarefas.json?v=' + Date.now());
    if (res.ok) {
      const parsed = normalizeTasks(await res.json());
      if (parsed) {
        tasks = parsed;
        loadFailed = false;
        saveTasks();
        return;
      }
    }
  } catch (err) {
    console.log('Tentativa de carregar tarefas.json:', err);
  }

  loadFailed = true;
  tasks = [];
}

// Salvar no LocalStorage
function saveTasks() {
  localStorage.setItem('taskflow_tasks_v2', JSON.stringify(tasks));
  updateBadges();
  updateWpProgress();
}

// Event Listeners
function setupEventListeners() {
  // Navegação da barra lateral
  document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.dataset.filter;
      currentViewTitleEl.textContent = viewTitles[currentFilter] || 'Tarefas';
      
      // Controle dos banners especiais
      if (wpProgressBanner) wpProgressBanner.style.display = currentFilter === 'wordpress' ? 'block' : 'none';
      if (shopeeBanner) shopeeBanner.style.display = currentFilter === 'shopee' ? 'flex' : 'none';

      // Pré-selecionar categoria no dropdown de adicionar tarefa
      if (['shopee', 'mercadolivre', 'magalu', 'amazon', 'wordpress', 'meta', 'rotinas', 'aguardando'].includes(currentFilter)) {
        newTaskCategory.value = currentFilter;
      }

      renderTasks();
    });
  });

  // Busca
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderTasks();
  });

  // Adicionar tarefa
  btnAddTask.addEventListener('click', handleAddTask);
  newTaskTitle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAddTask();
  });

  // Alternar Ocultar Concluídas
  btnHideCompleted.addEventListener('click', () => {
    hideCompleted = !hideCompleted;
    btnHideCompleted.classList.toggle('active', hideCompleted);
    btnHideCompleted.textContent = hideCompleted ? 'Mostrar Concluídas' : 'Ocultar Concluídas';
    renderTasks();
  });

  // Exportar tarefas.json
  btnExport.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "tarefas.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // Botão de recarregar estrutura inicial
  if (btnReset) {
    btnReset.addEventListener('click', async () => {
      if (confirm('Atenção: isto descarta as tarefas e alterações feitas aqui e volta para a lista do tarefas.json. Para guardar o que você fez, use "Salvar tarefas.json" antes. Deseja continuar?')) {
        await loadTasks(true);
        renderApp();
      }
    });
  }

  // Importar JSON
  btnImportToggle.addEventListener('click', () => fileImport.click());
  fileImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = normalizeTasks(JSON.parse(event.target.result));
        if (!imported) {
          alert('Arquivo inválido: o JSON precisa ser uma lista de tarefas, e cada tarefa precisa ter um "title" (texto). Nada foi alterado.');
          return;
        }
        if (!confirm('Importar ' + imported.length + ' tarefa(s)? Isto substitui todas as tarefas atuais.')) return;
        tasks = imported;
        loadFailed = false;
        saveTasks();
        renderApp();
        alert('Tarefas importadas com sucesso!');
      } catch (err) {
        alert('Erro ao importar arquivo JSON: ' + err.message);
      } finally {
        fileImport.value = '';
      }
    };
    reader.readAsText(file);
  });
}

function handleAddTask() {
  const title = newTaskTitle.value.trim();
  if (!title) return;

  const category = newTaskCategory.value;
  const rawTags = newTaskTags.value.trim();
  const tags = rawTags
    .split(',')
    .map(t => t.trim().replace(/^#+/, '').trim())
    .filter(Boolean)
    .map(t => '#' + t);

  const newTask = {
    id: newId(),
    title: title,
    category: category === 'myDay' ? 'myDay' : category,
    categoryName: categoryNames[category] || 'Geral',
    myDay: currentFilter === 'myDay' || category === 'myDay',
    important: currentFilter === 'important',
    completed: false,
    dueDate: '',
    tags: tags,
    subtasks: []
  };

  tasks.unshift(newTask);
  saveTasks();
  renderApp();

  newTaskTitle.value = '';
  newTaskTags.value = '';
  newTaskTitle.focus();
}

function renderApp() {
  updateBadges();
  updateWpProgress();
  renderTasks();
}

function updateBadges() {
  const counts = {
    myDay: tasks.filter(t => t.myDay && !t.completed).length,
    important: tasks.filter(t => t.important && !t.completed).length,
    all: tasks.filter(t => !t.completed).length,
    shopee: tasks.filter(t => t.category === 'shopee' && !t.completed).length,
    mercadolivre: tasks.filter(t => t.category === 'mercadolivre' && !t.completed).length,
    magalu: tasks.filter(t => t.category === 'magalu' && !t.completed).length,
    amazon: tasks.filter(t => t.category === 'amazon' && !t.completed).length,
    meta: tasks.filter(t => t.category === 'meta' && !t.completed).length,
    rotinas: tasks.filter(t => t.category === 'rotinas' && !t.completed).length,
    aguardando: tasks.filter(t => t.category === 'aguardando' && !t.completed).length
  };

  for (const [key, val] of Object.entries(counts)) {
    const badge = document.getElementById(`count-${key}`);
    if (badge) badge.textContent = val;
  }
}

function updateWpProgress() {
  const wpTasks = tasks.filter(t => t.category === 'wordpress');
  const completed = wpTasks.filter(t => t.completed).length;
  const percentage = wpTasks.length === 0 ? 0 : Math.round((completed / wpTasks.length) * 100);

  if (wpProgressPill) wpProgressPill.textContent = `${percentage}%`;
  if (wpProgressBar) wpProgressBar.style.width = `${percentage}%`;
  if (wpProgressText) wpProgressText.textContent = `${percentage}%`;
}

function renderTasks() {
  taskListEl.innerHTML = '';

  let filtered = tasks.filter(task => {
    // Filtro de canal / visão
    if (currentFilter === 'myDay' && !task.myDay) return false;
    if (currentFilter === 'important' && !task.important) return false;
    if (['shopee', 'mercadolivre', 'magalu', 'amazon', 'wordpress', 'meta', 'rotinas', 'aguardando'].includes(currentFilter)) {
      if (task.category !== currentFilter) return false;
    }

    // Ocultar concluídas
    if (hideCompleted && task.completed) return false;

    // Busca
    if (searchQuery) {
      const inTitle = task.title.toLowerCase().includes(searchQuery);
      const inTags = (task.tags || []).some(t => t.toLowerCase().includes(searchQuery));
      const inCategory = (task.categoryName || '').toLowerCase().includes(searchQuery);
      if (!inTitle && !inTags && !inCategory) return false;
    }

    return true;
  });

  const countLabel = document.getElementById('tasks-count-label');
  countLabel.textContent = `${filtered.length} TAREFAS`;

  if (filtered.length === 0 && loadFailed && tasks.length === 0) {
    taskListEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Não foi possível carregar o tarefas.json</h3>
        <p>Isso acontece quando o arquivo é aberto direto do disco (file://). Abra pelo link do GitHub Pages, use um servidor local ou clique em "Importar" para carregar o arquivo.</p>
      </div>
    `;
    return;
  }

  if (filtered.length === 0) {
    taskListEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎉</div>
        <h3>Tudo em ordem por aqui!</h3>
        <p>Nenhuma tarefa pendente neste canal ou busca.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;

    // Subtarefas renderizadas
    let subtasksHtml = '';
    if (task.subtasks && task.subtasks.length > 0) {
      const subtaskItems = task.subtasks.map(st => `
        <li class="subtask-item ${st.completed ? 'completed' : ''}">
          <input type="checkbox" class="subtask-checkbox" data-taskid="${esc(task.id)}" data-subid="${esc(st.id)}" ${st.completed ? 'checked' : ''}>
          <span>${esc(st.title)}</span>
        </li>
      `).join('');

      subtasksHtml = `
        <div class="subtasks-wrapper">
          <div class="subtasks-header">Etapas (${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length})</div>
          <ul class="subtask-list">${subtaskItems}</ul>
        </div>
      `;
    }

    // Tags
    const tagsHtml = (task.tags || []).map(t => `<span class="tag-pill" data-tag="${esc(t)}">${esc(t)}</span>`).join(' ');

    li.innerHTML = `
      <div class="task-main-row">
        <div class="task-checkbox" data-action="toggle-complete" data-id="${esc(task.id)}">
          <span class="task-checkbox-check">✓</span>
        </div>
        <div class="task-content">
          <span class="task-title" data-action="toggle-complete" data-id="${esc(task.id)}">${esc(task.title)}</span>
          <div class="task-meta">
            <span class="category-tag cat-${esc(String(task.category).replace(/[^a-zA-Z0-9_-]/g, ''))}">${esc(task.categoryName || 'Geral')}</span>
            ${tagsHtml}
          </div>
        </div>
        <div class="task-actions">
          <button class="action-icon-btn ${task.myDay ? 'active-sun' : ''}" data-action="toggle-myday" data-id="${esc(task.id)}" title="${task.myDay ? 'Remover do Meu Dia' : 'Adicionar ao Meu Dia'}">
            ☀️
          </button>
          <button class="action-icon-btn ${task.important ? 'active-star' : ''}" data-action="toggle-star" data-id="${esc(task.id)}" title="Marcar como importante">
            ⭐
          </button>
          <button class="action-icon-btn" data-action="delete" data-id="${esc(task.id)}" title="Excluir tarefa">
            🗑️
          </button>
        </div>
      </div>
      ${subtasksHtml}
    `;

    taskListEl.appendChild(li);
  });

  // Delegar eventos de clique na lista
  taskListEl.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = el.dataset.action;
      const id = el.dataset.id;
      handleTaskAction(action, id);
    });
  });

  // Clique em tag: preenche a busca
  taskListEl.querySelectorAll('.tag-pill').forEach(el => {
    el.addEventListener('click', () => filterByTag(el.dataset.tag));
  });

  // Delegar eventos de subtarefas
  taskListEl.querySelectorAll('.subtask-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const taskId = e.target.dataset.taskid;
      const subId = e.target.dataset.subid;
      const task = tasks.find(t => t.id === taskId);
      if (task && task.subtasks) {
        const sub = task.subtasks.find(s => s.id === subId);
        if (sub) {
          sub.completed = e.target.checked;
          saveTasks();
          renderApp();
        }
      }
    });
  });
}

function handleTaskAction(action, id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  if (action === 'toggle-complete') {
    task.completed = !task.completed;
  } else if (action === 'toggle-star') {
    task.important = !task.important;
  } else if (action === 'toggle-myday') {
    task.myDay = !task.myDay;
  } else if (action === 'delete') {
    if (confirm(`Deseja excluir a tarefa "${task.title}"?`)) {
      tasks = tasks.filter(t => t.id !== id);
    }
  }

  saveTasks();
  renderApp();
}

window.filterByTag = function(tag) {
  searchInput.value = tag;
  searchQuery = tag.toLowerCase();
  renderTasks();
};
