// Estado da Aplicação
let tasks = [];
let currentFilter = 'myDay';
let searchQuery = '';
let hideCompleted = false;

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
const btnExport = document.getElementById('btn-export');
const btnImportToggle = document.getElementById('btn-import-toggle');
const fileImport = document.getElementById('file-import');

// Mapeamento de Títulos das Listas
const viewTitles = {
  myDay: '☀️ Meu Dia',
  important: '⭐ Tarefas Importantes',
  all: '📋 Todas as Tarefas',
  wordpress: '🚀 Projeto: E-commerce WordPress',
  marketplaces: '🛒 Marketplaces & Catálogo',
  social: '📱 Redes Sociais & Anúncios',
  rotinas: '🔁 Rotinas Recorrentes',
  aguardando: '⏳ Aguardando / Chamados'
};

const categoryNames = {
  wordpress: '🚀 E-commerce WordPress',
  marketplaces: '🛒 Marketplaces & Catálogo',
  social: '📱 Redes Sociais',
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

// Carregar tarefas (LocalStorage ou tarefas.json)
async function loadTasks() {
  const localData = localStorage.getItem('taskflow_tasks');
  if (localData) {
    try {
      tasks = JSON.parse(localData);
      return;
    } catch (e) {
      console.error('Erro ao ler LocalStorage:', e);
    }
  }

  // Tentar buscar do arquivo local tarefas.json
  try {
    const res = await fetch('tarefas.json');
    if (res.ok) {
      tasks = await res.json();
      saveTasks();
      return;
    }
  } catch (err) {
    console.log('Não foi possível carregar tarefas.json via fetch direto, usando fallback:', err);
  }

  tasks = [];
}

// Salvar no LocalStorage
function saveTasks() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
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
      
      // Mostrar barra de progresso apenas na visão do WordPress
      if (currentFilter === 'wordpress') {
        wpProgressBanner.style.display = 'block';
      } else {
        wpProgressBanner.style.display = 'none';
      }

      // Pré-selecionar categoria no dropdown de adicionar tarefa
      if (['wordpress', 'marketplaces', 'social', 'rotinas', 'aguardando'].includes(currentFilter)) {
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

  // Importar JSON
  btnImportToggle.addEventListener('click', () => fileImport.click());
  fileImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          tasks = imported;
          saveTasks();
          renderApp();
          alert('Tarefas importadas com sucesso!');
        }
      } catch (err) {
        alert('Erro ao importar arquivo JSON: ' + err.message);
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
  const tags = rawTags ? rawTags.split(',').map(t => t.trim().startsWith('#') ? t.trim() : '#' + t.trim()) : [];

  const newTask = {
    id: 't-' + Date.now(),
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
    marketplaces: tasks.filter(t => t.category === 'marketplaces' && !t.completed).length,
    social: tasks.filter(t => t.category === 'social' && !t.completed).length,
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
  if (wpTasks.length === 0) return;

  const completed = wpTasks.filter(t => t.completed).length;
  const percentage = Math.round((completed / wpTasks.length) * 100);

  wpProgressPill.textContent = `${percentage}%`;
  wpProgressBar.style.width = `${percentage}%`;
  wpProgressText.textContent = `${percentage}%`;
}

function renderTasks() {
  taskListEl.innerHTML = '';

  let filtered = tasks.filter(task => {
    // Filtro da aba
    if (currentFilter === 'myDay' && !task.myDay) return false;
    if (currentFilter === 'important' && !task.important) return false;
    if (currentFilter === 'wordpress' && task.category !== 'wordpress') return false;
    if (currentFilter === 'marketplaces' && task.category !== 'marketplaces') return false;
    if (currentFilter === 'social' && task.category !== 'social') return false;
    if (currentFilter === 'rotinas' && task.category !== 'rotinas') return false;
    if (currentFilter === 'aguardando' && task.category !== 'aguardando') return false;

    // Ocultar concluídas
    if (hideCompleted && task.completed) return false;

    // Busca
    if (searchQuery) {
      const inTitle = task.title.toLowerCase().includes(searchQuery);
      const inTags = task.tags.some(t => t.toLowerCase().includes(searchQuery));
      const inCategory = (task.categoryName || '').toLowerCase().includes(searchQuery);
      if (!inTitle && !inTags && !inCategory) return false;
    }

    return true;
  });

  const countLabel = document.getElementById('tasks-count-label');
  countLabel.textContent = `${filtered.length} TAREFAS ENCONTRADAS`;

  if (filtered.length === 0) {
    taskListEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎉</div>
        <h3>Tudo em ordem por aqui!</h3>
        <p>Nenhuma tarefa pendente nesta visão ou correspondente à busca.</p>
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
          <input type="checkbox" class="subtask-checkbox" data-taskid="${task.id}" data-subid="${st.id}" ${st.completed ? 'checked' : ''}>
          <span>${st.title}</span>
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
    const tagsHtml = task.tags.map(t => `<span class="tag-pill" onclick="filterByTag('${t}')">${t}</span>`).join(' ');

    li.innerHTML = `
      <div class="task-main-row">
        <div class="task-checkbox" data-action="toggle-complete" data-id="${task.id}">
          <span class="task-checkbox-check">✓</span>
        </div>
        <div class="task-content">
          <span class="task-title" data-action="toggle-complete" data-id="${task.id}">${task.title}</span>
          <div class="task-meta">
            <span class="category-tag">${task.categoryName || 'Geral'}</span>
            ${tagsHtml}
          </div>
        </div>
        <div class="task-actions">
          <button class="action-icon-btn ${task.myDay ? 'active-sun' : ''}" data-action="toggle-myday" data-id="${task.id}" title="${task.myDay ? 'Remover do Meu Dia' : 'Adicionar ao Meu Dia'}">
            ☀️
          </button>
          <button class="action-icon-btn ${task.important ? 'active-star' : ''}" data-action="toggle-star" data-id="${task.id}" title="Marcar como importante">
            ⭐
          </button>
          <button class="action-icon-btn" data-action="delete" data-id="${task.id}" title="Excluir tarefa">
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
          // Se todas as subtarefas foram marcadas, podemos sugerir marcar a tarefa
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
