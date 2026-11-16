const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve, reject) => {
    server = app.listen(0, '127.0.0.1', resolve);
    server.on('error', reject);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(async () => {
  const { data } = await requestApi('/api/tasks');

  await Promise.all(
    data.tasks.map((task) => requestApi(`/api/tasks/${task.id}`, { method: 'DELETE' }))
  );
});

async function requestApi(path, options = {}) {
  const config = {
    method: options.method || 'GET',
    headers: {},
  };

  if (options.body !== undefined) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${baseUrl}${path}`, config);
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  return { status: response.status, data, contentType };
}

function buildTaskPayload(overrides = {}) {
  return {
    title: 'Software Architecture Assignment',
    subject: 'Software Architecture',
    description: 'Build a web application following the MVC pattern.',
    ...overrides,
  };
}

async function createTask(overrides = {}) {
  const response = await requestApi('/api/tasks', {
    method: 'POST',
    body: buildTaskPayload(overrides),
  });

  assert.equal(response.status, 201);
  return response.data.task;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test('GET /api/tasks returns an empty list when there are no tasks', async () => {
  const response = await requestApi('/api/tasks');

  assert.equal(response.status, 200);
  assert.equal(response.data.total, 0);
  assert.deepEqual(response.data.tasks, []);
});

test('POST /api/tasks creates a task with a UUID and pending status', async () => {
  const response = await requestApi('/api/tasks', {
    method: 'POST',
    body: buildTaskPayload({
      title: '  Software Architecture Assignment  ',
      description: '  Apply the MVC pattern.  ',
      id: 'forged-client-id',
      status: 'completed',
    }),
  });

  assert.equal(response.status, 201);
  assert.equal(response.data.message, 'Task created successfully.');
  assert.match(response.data.task.id, UUID_PATTERN);
  assert.notEqual(response.data.task.id, 'forged-client-id');
  assert.equal(response.data.task.title, 'Software Architecture Assignment');
  assert.equal(response.data.task.description, 'Apply the MVC pattern.');
  assert.equal(response.data.task.subject, 'Software Architecture');
  assert.equal(response.data.task.status, 'pending');
});

test('POST /api/tasks rejects missing fields and minimum lengths', async () => {
  const response = await requestApi('/api/tasks', {
    method: 'POST',
    body: { title: 'ab', subject: 'x', description: '' },
  });

  assert.equal(response.status, 400);
  assert.equal(response.data.error, 'VALIDATION_ERROR');
  assert.equal(response.data.message, 'Validation failed.');
  assert.equal(response.data.details.length, 2);

  const listResponse = await requestApi('/api/tasks');
  assert.equal(listResponse.data.total, 0);
});

test('POST /api/tasks rejects fields above the maximum length', async () => {
  const response = await requestApi('/api/tasks', {
    method: 'POST',
    body: {
      title: 'a'.repeat(101),
      subject: 's'.repeat(81),
      description: 'd'.repeat(501),
    },
  });

  assert.equal(response.status, 400);
  assert.equal(response.data.error, 'VALIDATION_ERROR');
  assert.equal(response.data.details.length, 3);
});

test('GET /api/tasks/:id returns the task details', async () => {
  const task = await createTask();
  const response = await requestApi(`/api/tasks/${task.id}`);

  assert.equal(response.status, 200);
  assert.deepEqual(response.data.task, task);
});

test('GET /api/tasks/:id returns 404 for an unknown ID', async () => {
  const response = await requestApi('/api/tasks/00000000-0000-4000-8000-000000000000');

  assert.equal(response.status, 404);
  assert.equal(response.data.error, 'TASK_NOT_FOUND');
  assert.equal(response.data.message, 'Task not found.');
});

test('PUT /api/tasks/:id updates only title, description and subject', async () => {
  const task = await createTask();

  const response = await requestApi(`/api/tasks/${task.id}`, {
    method: 'PUT',
    body: {
      title: 'Revised Architecture Assignment',
      description: 'Updated activity description.',
      subject: 'Software Engineering',
      id: 'attempted-id-change',
      status: 'completed',
    },
  });

  assert.equal(response.status, 200);
  assert.equal(response.data.task.title, 'Revised Architecture Assignment');
  assert.equal(response.data.task.description, 'Updated activity description.');
  assert.equal(response.data.task.subject, 'Software Engineering');
  assert.equal(response.data.task.id, task.id);
  assert.equal(response.data.task.status, 'pending');

  const getResponse = await requestApi(`/api/tasks/${task.id}`);
  assert.equal(getResponse.data.task.title, 'Revised Architecture Assignment');
  assert.equal(getResponse.data.task.status, 'pending');
});

test('PUT /api/tasks/:id validates data and handles an unknown ID', async () => {
  const task = await createTask();

  const invalidResponse = await requestApi(`/api/tasks/${task.id}`, {
    method: 'PUT',
    body: { title: '', subject: '' },
  });

  assert.equal(invalidResponse.status, 400);
  assert.equal(invalidResponse.data.error, 'VALIDATION_ERROR');
  assert.equal(invalidResponse.data.details.length, 2);

  const missingResponse = await requestApi('/api/tasks/unknown-id', {
    method: 'PUT',
    body: buildTaskPayload(),
  });

  assert.equal(missingResponse.status, 404);
  assert.equal(missingResponse.data.error, 'TASK_NOT_FOUND');
});

test('PATCH /api/tasks/:id/complete completes a pending task only once', async () => {
  const task = await createTask();

  const firstCompletion = await requestApi(`/api/tasks/${task.id}/complete`, {
    method: 'PATCH',
  });

  assert.equal(firstCompletion.status, 200);
  assert.equal(firstCompletion.data.task.status, 'completed');

  const secondCompletion = await requestApi(`/api/tasks/${task.id}/complete`, {
    method: 'PATCH',
  });

  assert.equal(secondCompletion.status, 400);
  assert.equal(secondCompletion.data.error, 'TASK_ALREADY_COMPLETED');

  const missingResponse = await requestApi('/api/tasks/unknown-id/complete', {
    method: 'PATCH',
  });

  assert.equal(missingResponse.status, 404);
});

test('GET /api/tasks filters by status and rejects an invalid status', async () => {
  const pendingTask = await createTask({ title: 'Pending Task' });
  const completedTask = await createTask({ title: 'Completed Task' });

  await requestApi(`/api/tasks/${completedTask.id}/complete`, { method: 'PATCH' });

  const pendingResponse = await requestApi('/api/tasks?status=pending');
  assert.equal(pendingResponse.status, 200);
  assert.equal(pendingResponse.data.total, 1);
  assert.equal(pendingResponse.data.tasks[0].id, pendingTask.id);

  const completedResponse = await requestApi('/api/tasks?status=completed');
  assert.equal(completedResponse.status, 200);
  assert.equal(completedResponse.data.total, 1);
  assert.equal(completedResponse.data.tasks[0].id, completedTask.id);

  const invalidResponse = await requestApi('/api/tasks?status=in-progress');
  assert.equal(invalidResponse.status, 400);
  assert.equal(invalidResponse.data.error, 'INVALID_STATUS');

  const allResponse = await requestApi('/api/tasks');
  assert.equal(allResponse.data.total, 2);
});

test('DELETE /api/tasks/:id deletes a task and handles an unknown ID', async () => {
  const task = await createTask();

  const deleteResponse = await requestApi(`/api/tasks/${task.id}`, { method: 'DELETE' });
  assert.equal(deleteResponse.status, 200);
  assert.equal(deleteResponse.data.message, 'Task deleted successfully.');

  const getResponse = await requestApi(`/api/tasks/${task.id}`);
  assert.equal(getResponse.status, 404);

  const secondDeleteResponse = await requestApi(`/api/tasks/${task.id}`, {
    method: 'DELETE',
  });
  assert.equal(secondDeleteResponse.status, 404);
});

test('a malformed JSON body returns 400', async () => {
  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{ "title": "incomplete"',
  });

  const data = await response.json();

  assert.equal(response.status, 400);
  assert.equal(data.error, 'INVALID_JSON');
  assert.equal(data.message, 'Invalid JSON in the request body.');
});

test('an unknown API route returns 404 as JSON', async () => {
  const response = await requestApi('/api/unknown-route');

  assert.equal(response.status, 404);
  assert.equal(response.data.error, 'API_ROUTE_NOT_FOUND');
});

test('the View is available and references the split CSS and JavaScript assets', async () => {
  const page = await requestApi('/');

  assert.equal(page.status, 200);
  assert.match(page.contentType, /text\/html/);
  assert.match(page.data, /Gerenciador de Tarefas/);
  assert.match(page.data, /css\/main\.css/);
  assert.match(page.data, /css\/layout\.css/);
  assert.match(page.data, /css\/components\.css/);
  assert.match(page.data, /css\/responsive\.css/);
  assert.match(page.data, /js\/app\.js/);

  for (const stylesheet of ['main.css', 'layout.css', 'components.css', 'responsive.css']) {
    const response = await requestApi(`/css/${stylesheet}`);
    assert.equal(response.status, 200, `Expected ${stylesheet} to be served`);
    assert.match(response.contentType, /text\/css/);
  }

  for (const script of ['app.js', 'api.js', 'taskUI.js', 'notifications.js']) {
    const response = await requestApi(`/js/${script}`);
    assert.equal(response.status, 200, `Expected ${script} to be served`);
    assert.match(response.contentType, /javascript/);
  }
});
