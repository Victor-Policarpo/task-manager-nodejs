import {
  getAllTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} from './api.js';
import { showNotification } from './notifications.js';
import {
  FIELD_LIMITS,
  elements,
  renderStats,
  renderTaskList,
  renderTaskDetails,
  showLoadingState,
  hideLoadingState,
  renderListError,
  getFormValues,
  showFormErrors,
  clearFormErrors,
  clearFieldError,
  updateCharacterCounters,
  setFormEditing,
  resetForm,
  openModal,
  closeModal,
} from './taskUI.js';

const VALID_FILTERS = ['all', 'pending', 'completed'];

const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Não foi possível conectar ao servidor. Verifique se ele está em execução.',
  TASK_NOT_FOUND: 'Tarefa não encontrada. Atualize a listagem.',
  TASK_ALREADY_COMPLETED: 'Esta tarefa já está concluída.',
  INVALID_STATUS: 'O filtro selecionado é inválido.',
  VALIDATION_ERROR: 'Não foi possível salvar. Verifique os dados informados.',
  API_ROUTE_NOT_FOUND: 'Recurso da API não encontrado.',
  INVALID_JSON: 'A resposta enviada ao servidor é inválida.',
  INTERNAL_SERVER_ERROR: 'O servidor encontrou um erro inesperado.',
};

const state = {
  filter: 'all',
  tasks: [],
  editingTaskId: null,
  taskToDelete: null,
};

const filterButtons = [...document.querySelectorAll('.filter-button')];
let loadRequestId = 0;

function init() {
  registerEventListeners();
  updateCharacterCounters();
  loadTasks();
}

function registerEventListeners() {
  elements.form.addEventListener('submit', handleFormSubmit);
  elements.cancelButton.addEventListener('click', () => {
    leaveEditMode();
    elements.title.focus();
  });

  ['title', 'subject', 'description'].forEach((fieldName) => {
    elements[fieldName].addEventListener('input', () => {
      updateCharacterCounters();
      clearFieldError(fieldName);
    });
  });

  elements.taskList.addEventListener('click', handleTaskAction);
  filterButtons.forEach((button) => button.addEventListener('click', () => handleFilterChange(button)));
  elements.confirmDeleteButton.addEventListener('click', handleDeleteConfirmation);
  document.addEventListener('click', handleModalCloseClick);
  document.addEventListener('keydown', handleKeyDown);
}

async function loadTasks() {
  const requestId = ++loadRequestId;
  showLoadingState();

  try {
    const [allResponse, filteredResponse] = await Promise.all([
      getAllTasks(),
      state.filter === 'all' ? Promise.resolve(null) : getAllTasks(state.filter),
    ]);

    if (requestId !== loadRequestId) {
      return;
    }

    state.tasks = allResponse.tasks;

    const visibleTasks =
      state.filter === 'all' ? allResponse.tasks : filteredResponse.tasks;

    renderStats(state.tasks);
    renderTaskList(visibleTasks, state.filter);
  } catch (error) {
    if (requestId !== loadRequestId) {
      return;
    }

    renderListError();
    showNotification(getErrorMessage(error), 'error');
  } finally {
    if (requestId === loadRequestId) {
      hideLoadingState();
    }
  }
}

function handleFilterChange(button) {
  const { filter } = button.dataset;

  if (!VALID_FILTERS.includes(filter) || filter === state.filter) {
    return;
  }

  state.filter = filter;

  filterButtons.forEach((filterButton) => {
    const isActive = filterButton === button;
    filterButton.classList.toggle('active', isActive);
    filterButton.setAttribute('aria-pressed', String(isActive));
  });

  loadTasks();
}

async function handleFormSubmit(event) {
  event.preventDefault();

  if (elements.saveButton.disabled) {
    return;
  }

  const formValues = getFormValues();
  const errors = validateForm(formValues);

  if (Object.keys(errors).length > 0) {
    showFormErrors(errors);
    showNotification('Revise os campos destacados antes de salvar.', 'error');
    return;
  }

  clearFormErrors();

  const isEditing = Boolean(state.editingTaskId);

  elements.saveButton.disabled = true;
  elements.saveButton.textContent = isEditing ? 'Salvando...' : 'Cadastrando...';

  try {
    if (isEditing) {
      await updateTask(state.editingTaskId, formValues);
      showNotification('Tarefa atualizada com sucesso.', 'success');
    } else {
      await createTask(formValues);
      showNotification('Tarefa cadastrada com sucesso.', 'success');
    }

    leaveEditMode();
    await loadTasks();
  } catch (error) {
    showNotification(getErrorMessage(error), 'error');
  } finally {
    elements.saveButton.disabled = false;
    elements.saveButton.textContent = state.editingTaskId
      ? 'Salvar alterações'
      : 'Cadastrar tarefa';
  }
}

function validateForm(values) {
  const errors = {};

  if (!values.title) {
    errors.title = 'Informe o título da tarefa.';
  } else if (
    values.title.length < FIELD_LIMITS.title.min ||
    values.title.length > FIELD_LIMITS.title.max
  ) {
    errors.title = `O título deve ter entre ${FIELD_LIMITS.title.min} e ${FIELD_LIMITS.title.max} caracteres.`;
  }

  if (!values.subject) {
    errors.subject = 'Informe a disciplina.';
  } else if (
    values.subject.length < FIELD_LIMITS.subject.min ||
    values.subject.length > FIELD_LIMITS.subject.max
  ) {
    errors.subject = `A disciplina deve ter entre ${FIELD_LIMITS.subject.min} e ${FIELD_LIMITS.subject.max} caracteres.`;
  }

  if (values.description.length > FIELD_LIMITS.description.max) {
    errors.description = `A descrição deve ter no máximo ${FIELD_LIMITS.description.max} caracteres.`;
  }

  return errors;
}

function handleTaskAction(event) {
  const actionButton = event.target.closest('[data-action]');

  if (!actionButton) {
    return;
  }

  const task = state.tasks.find((item) => item.id === actionButton.dataset.id);

  if (!task) {
    showNotification('Tarefa não encontrada. Atualize a listagem.', 'error');
    return;
  }

  switch (actionButton.dataset.action) {
    case 'view':
      openTaskDetails(task);
      break;
    case 'edit':
      startEditingTask(task);
      break;
    case 'complete':
      handleCompleteTask(task);
      break;
    case 'delete':
      openDeleteConfirmation(task);
      break;
  }
}

function openTaskDetails(task) {
  renderTaskDetails(task);
  openModal(elements.detailsModal);
  elements.detailsModal.querySelector('.modal__close').focus();
}

function startEditingTask(task) {
  state.editingTaskId = task.id;
  setFormEditing(task);
}

async function handleCompleteTask(task) {
  try {
    await completeTask(task.id);
    showNotification('Tarefa concluída com sucesso.', 'success');
    await loadTasks();
  } catch (error) {
    showNotification(getErrorMessage(error), 'error');
  }
}

function openDeleteConfirmation(task) {
  state.taskToDelete = task;
  elements.deleteTaskName.textContent = `"${task.title}"`;

  openModal(elements.deleteModal);
  elements.confirmDeleteButton.focus();
}

async function handleDeleteConfirmation() {
  const task = state.taskToDelete;

  if (!task) {
    return;
  }

  elements.confirmDeleteButton.disabled = true;
  elements.confirmDeleteButton.textContent = 'Excluindo...';

  try {
    await deleteTask(task.id);

    if (state.editingTaskId === task.id) {
      leaveEditMode();
    }

    state.taskToDelete = null;
    closeModal(elements.deleteModal);
    showNotification('Tarefa excluída com sucesso.', 'success');
    await loadTasks();
  } catch (error) {
    showNotification(getErrorMessage(error), 'error');
  } finally {
    elements.confirmDeleteButton.disabled = false;
    elements.confirmDeleteButton.textContent = 'Excluir tarefa';
  }
}

function handleModalCloseClick(event) {
  const closeElement = event.target.closest('[data-close-modal]');

  if (!closeElement) {
    return;
  }

  const modal = closeElement.closest('.modal');

  if (!modal) {
    return;
  }

  closeModal(modal);

  if (modal === elements.deleteModal) {
    state.taskToDelete = null;
  }
}

function handleKeyDown(event) {
  if (event.key !== 'Escape') {
    return;
  }

  document.querySelectorAll('.modal.open').forEach(closeModal);
  state.taskToDelete = null;
}

function leaveEditMode() {
  state.editingTaskId = null;
  resetForm();
}

function getErrorMessage(error) {
  return ERROR_MESSAGES[error.code] || 'Não foi possível concluir a operação. Tente novamente.';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
