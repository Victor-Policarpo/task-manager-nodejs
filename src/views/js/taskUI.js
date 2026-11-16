export const FIELD_LIMITS = {
  title: { min: 3, max: 100 },
  subject: { min: 2, max: 80 },
  description: { max: 500 },
};

export const elements = {
  totalTasks: document.getElementById('total-tasks'),
  pendingTasks: document.getElementById('pending-tasks'),
  completedTasks: document.getElementById('completed-tasks'),
  listInfo: document.getElementById('list-info'),

  form: document.getElementById('task-form'),
  title: document.getElementById('title'),
  subject: document.getElementById('subject'),
  description: document.getElementById('description'),
  titleError: document.getElementById('title-error'),
  subjectError: document.getElementById('subject-error'),
  descriptionError: document.getElementById('description-error'),
  titleCounter: document.getElementById('title-counter'),
  subjectCounter: document.getElementById('subject-counter'),
  descriptionCounter: document.getElementById('description-counter'),
  formTitle: document.getElementById('form-title'),
  formHelp: document.getElementById('form-help'),
  saveButton: document.getElementById('save-button'),
  cancelButton: document.getElementById('cancel-button'),
  formPanel: document.querySelector('.panel--form'),

  taskList: document.getElementById('task-list'),
  loading: document.getElementById('loading'),
  emptyState: document.getElementById('empty-state'),
  emptyTitle: document.getElementById('empty-title'),
  emptyText: document.getElementById('empty-text'),

  detailsModal: document.getElementById('details-modal'),
  detailsContent: document.getElementById('details-content'),
  deleteModal: document.getElementById('delete-modal'),
  deleteTaskName: document.getElementById('delete-task-name'),
  confirmDeleteButton: document.getElementById('confirm-delete-button'),
};

export function renderStats(tasks) {
  const pendingCount = tasks.filter((task) => task.status === 'pending').length;

  elements.totalTasks.textContent = String(tasks.length);
  elements.pendingTasks.textContent = String(pendingCount);
  elements.completedTasks.textContent = String(tasks.length - pendingCount);
}

export function renderTaskList(tasks, filter) {
  updateListInfo(tasks, filter);

  if (tasks.length === 0) {
    renderEmptyState(filter);
    elements.taskList.innerHTML = '';
    elements.emptyState.classList.remove('hidden');
    return;
  }

  elements.emptyState.classList.add('hidden');
  elements.taskList.innerHTML = tasks.map(renderTaskCard).join('');
}

function renderTaskCard(task) {
  const isCompleted = task.status === 'completed';
  const safeTitle = escapeHtml(task.title);
  const descriptionHtml = task.description
    ? `<p class="task-card__description">${escapeHtml(task.description)}</p>`
    : '<p class="task-card__description task-card__description--empty">Sem descrição.</p>';

  return `
    <article class="task-card ${isCompleted ? 'task-card--completed' : ''}">
      <div class="task-card__top">
        <span class="task-card__subject" title="${escapeHtml(task.subject)}">${escapeHtml(task.subject)}</span>
        ${renderStatusBadge(task.status)}
      </div>
      <h3 class="task-card__title">${safeTitle}</h3>
      ${descriptionHtml}
      <div class="task-card__actions">
        <button type="button" class="task-action" data-action="view" data-id="${task.id}" aria-label="Ver detalhes de ${safeTitle}">Ver</button>
        <button type="button" class="task-action" data-action="edit" data-id="${task.id}" aria-label="Editar ${safeTitle}">Editar</button>
        ${
          isCompleted
            ? ''
            : `<button type="button" class="task-action task-action--complete" data-action="complete" data-id="${task.id}" aria-label="Concluir ${safeTitle}">Concluir</button>`
        }
        <button type="button" class="task-action task-action--delete" data-action="delete" data-id="${task.id}" aria-label="Excluir ${safeTitle}">Excluir</button>
      </div>
    </article>
  `;
}

function renderStatusBadge(status) {
  const isCompleted = status === 'completed';
  const label = isCompleted ? 'Concluída' : 'Pendente';

  return `<span class="status-badge status-badge--${isCompleted ? 'completed' : 'pending'}">${label}</span>`;
}

function updateListInfo(tasks, filter) {
  const count = tasks.length;
  const noun = count === 1 ? 'tarefa' : 'tarefas';
  let suffix = 'no total';

  if (filter === 'pending') {
    suffix = count === 1 ? 'pendente' : 'pendentes';
  } else if (filter === 'completed') {
    suffix = count === 1 ? 'concluída' : 'concluídas';
  }

  elements.listInfo.textContent = `${count} ${noun} ${suffix}`;
}

function renderEmptyState(filter) {
  if (filter === 'pending') {
    elements.emptyTitle.textContent = 'Nenhuma tarefa pendente';
    elements.emptyText.textContent = 'Tudo em dia! Todas as tarefas cadastradas já foram concluídas.';
    return;
  }

  if (filter === 'completed') {
    elements.emptyTitle.textContent = 'Nenhuma tarefa concluída';
    elements.emptyText.textContent = 'Conclua uma tarefa para que ela apareça neste filtro.';
    return;
  }

  elements.emptyTitle.textContent = 'Nenhuma tarefa cadastrada';
  elements.emptyText.textContent = 'Cadastre sua primeira tarefa acadêmica usando o formulário.';
}

export function showLoadingState() {
  elements.loading.classList.remove('hidden');
  elements.emptyState.classList.add('hidden');
  elements.taskList.innerHTML = '';
}

export function hideLoadingState() {
  elements.loading.classList.add('hidden');
}

export function renderListError() {
  elements.listInfo.textContent = 'Não foi possível carregar as tarefas.';
  elements.emptyTitle.textContent = 'Falha ao carregar as tarefas';
  elements.emptyText.textContent = 'Verifique se o servidor está em execução e tente novamente.';
  elements.taskList.innerHTML = '';
  elements.emptyState.classList.remove('hidden');
}

export function renderTaskDetails(task) {
  const descriptionHtml = task.description
    ? `<p class="detail__value">${escapeHtml(task.description)}</p>`
    : '<p class="detail__value detail__value--empty">Sem descrição.</p>';

  elements.detailsContent.innerHTML = `
    <div class="details__header">
      <h3>${escapeHtml(task.title)}</h3>
      ${renderStatusBadge(task.status)}
    </div>
    <div class="detail">
      <span class="detail__label">Disciplina</span>
      <p class="detail__value">${escapeHtml(task.subject)}</p>
    </div>
    <div class="detail">
      <span class="detail__label">Descrição</span>
      ${descriptionHtml}
    </div>
    <div class="detail">
      <span class="detail__label">Identificador</span>
      <code class="detail__id">${escapeHtml(task.id)}</code>
    </div>
  `;
}

export function getFormValues() {
  return {
    title: elements.title.value.trim(),
    subject: elements.subject.value.trim(),
    description: elements.description.value.trim(),
  };
}

export function updateCharacterCounters() {
  elements.titleCounter.textContent = `${elements.title.value.length}/${FIELD_LIMITS.title.max}`;
  elements.subjectCounter.textContent = `${elements.subject.value.length}/${FIELD_LIMITS.subject.max}`;
  elements.descriptionCounter.textContent = `${elements.description.value.length}/${FIELD_LIMITS.description.max}`;
}

export function showFormErrors(errors) {
  clearFormErrors();

  Object.entries(errors).forEach(([fieldName, message]) => {
    const input = elements[fieldName];
    const errorElement = elements[`${fieldName}Error`];

    if (input && errorElement) {
      input.setAttribute('aria-invalid', 'true');
      errorElement.textContent = message;
    }
  });

  const firstInvalidField = [elements.title, elements.subject, elements.description].find(
    (field) => field.getAttribute('aria-invalid') === 'true'
  );

  if (firstInvalidField) {
    firstInvalidField.focus();
  }
}

export function clearFormErrors() {
  clearFieldError('title');
  clearFieldError('subject');
  clearFieldError('description');
}

export function clearFieldError(fieldName) {
  const input = elements[fieldName];
  const errorElement = elements[`${fieldName}Error`];

  if (input && errorElement) {
    input.removeAttribute('aria-invalid');
    errorElement.textContent = '';
  }
}

export function setFormEditing(task) {
  elements.title.value = task.title;
  elements.subject.value = task.subject;
  elements.description.value = task.description;
  elements.formTitle.textContent = 'Editar tarefa';
  elements.formHelp.textContent = 'Altere os dados e salve as modificações.';
  elements.saveButton.textContent = 'Salvar alterações';
  elements.cancelButton.classList.remove('hidden');

  clearFormErrors();
  updateCharacterCounters();

  elements.formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  elements.title.focus({ preventScroll: true });
}

export function resetForm() {
  elements.form.reset();
  elements.formTitle.textContent = 'Nova tarefa';
  elements.formHelp.textContent = 'Cadastre um trabalho, prova ou atividade.';
  elements.saveButton.textContent = 'Cadastrar tarefa';
  elements.cancelButton.classList.add('hidden');

  clearFormErrors();
  updateCharacterCounters();
}

export function openModal(modal) {
  modal._previousFocus = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
}

export function closeModal(modal) {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');

  if (!document.querySelector('.modal.open')) {
    document.body.classList.remove('no-scroll');
  }

  const previousFocus = modal._previousFocus;

  if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === 'function') {
    previousFocus.focus({ preventScroll: true });
  }
}

function escapeHtml(value) {
  const characters = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return String(value).replace(/[&<>"']/g, (character) => characters[character]);
}
