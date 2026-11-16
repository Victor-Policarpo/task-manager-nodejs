const taskModel = require('../models/taskModel');

const VALID_STATUSES = ['pending', 'completed'];

const FIELD_LIMITS = {
  titleMin: 3,
  titleMax: 100,
  descriptionMax: 500,
  subjectMin: 2,
  subjectMax: 80,
};

function validateTaskData(receivedData) {
  const data = receivedData || {};
  const errors = [];

  const title = typeof data.title === 'string' ? data.title.trim() : '';
  if (!title) {
    errors.push('Title is required.');
  } else if (title.length < FIELD_LIMITS.titleMin || title.length > FIELD_LIMITS.titleMax) {
    errors.push(
      `Title must be between ${FIELD_LIMITS.titleMin} and ${FIELD_LIMITS.titleMax} characters.`
    );
  }

  const description =
    data.description === undefined || data.description === null
      ? ''
      : typeof data.description === 'string'
        ? data.description.trim()
        : null;

  if (description === null) {
    errors.push('Description must be a string.');
  } else if (description.length > FIELD_LIMITS.descriptionMax) {
    errors.push(`Description must have at most ${FIELD_LIMITS.descriptionMax} characters.`);
  }

  const subject = typeof data.subject === 'string' ? data.subject.trim() : '';
  if (!subject) {
    errors.push('Subject is required.');
  } else if (subject.length < FIELD_LIMITS.subjectMin || subject.length > FIELD_LIMITS.subjectMax) {
    errors.push(
      `Subject must be between ${FIELD_LIMITS.subjectMin} and ${FIELD_LIMITS.subjectMax} characters.`
    );
  }

  return {
    errors,
    data: {
      title,
      description,
      subject,
    },
  };
}

function sendError(res, statusCode, errorCode, message, details) {
  const payload = { error: errorCode, message };

  if (details) {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
}

function getAllTasks(req, res) {
  const { status } = req.query;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return sendError(
      res,
      400,
      'INVALID_STATUS',
      'The status must be either "pending" or "completed".'
    );
  }

  const tasks = taskModel.getAll(status);

  return res.status(200).json({
    total: tasks.length,
    tasks,
  });
}

function getTaskById(req, res) {
  const task = taskModel.getById(req.params.id);

  if (!task) {
    return sendError(res, 404, 'TASK_NOT_FOUND', 'Task not found.');
  }

  return res.status(200).json({ task });
}

function createTask(req, res) {
  const { errors, data } = validateTaskData(req.body);

  if (errors.length > 0) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Validation failed.', errors);
  }
  const task = taskModel.create(data);

  return res.status(201).json({
    message: 'Task created successfully.',
    task,
  });
}

function updateTask(req, res) {
  const existingTask = taskModel.getById(req.params.id);

  if (!existingTask) {
    return sendError(res, 404, 'TASK_NOT_FOUND', 'Task not found.');
  }

  const { errors, data } = validateTaskData(req.body);

  if (errors.length > 0) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Validation failed.', errors);
  }

  const task = taskModel.update(req.params.id, data);

  return res.status(200).json({
    message: 'Task updated successfully.',
    task,
  });
}

function completeTask(req, res) {
  const task = taskModel.getById(req.params.id);

  if (!task) {
    return sendError(res, 404, 'TASK_NOT_FOUND', 'Task not found.');
  }

  if (task.status === 'completed') {
    return sendError(res, 400, 'TASK_ALREADY_COMPLETED', 'This task is already completed.');
  }

  const completedTask = taskModel.complete(req.params.id);

  return res.status(200).json({
    message: 'Task completed successfully.',
    task: completedTask,
  });
}

function deleteTask(req, res) {
  const task = taskModel.getById(req.params.id);

  if (!task) {
    return sendError(res, 404, 'TASK_NOT_FOUND', 'Task not found.');
  }

  taskModel.deleteById(req.params.id);

  return res.status(200).json({ message: 'Task deleted successfully.' });
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
};
