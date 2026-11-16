const { v4: uuidv4 } = require('uuid');

const tasks = [];

function getAll(status) {
  if (!status) {
    return [...tasks];
  }

  return tasks.filter((task) => task.status === status);
}

function getById(id) {
  return tasks.find((task) => task.id === id);
}

function create(data) {
  const newTask = {
    id: uuidv4(),
    title: data.title,
    description: data.description,
    subject: data.subject,
    status: 'pending',
  };
  tasks.unshift(newTask);

  return newTask;
}

function update(id, data) {
  const task = getById(id);

  if (!task) {
    return null;
  }
  
  task.title = data.title;
  task.description = data.description;
  task.subject = data.subject;

  return task;
}

function complete(id) {
  const task = getById(id);

  if (!task) {
    return null;
  }

  task.status = 'completed';

  return task;
}

function deleteById(id) {
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return false;
  }

  tasks.splice(index, 1);

  return true;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  complete,
  deleteById,
};
