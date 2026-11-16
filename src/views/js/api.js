const API_BASE_URL = '/api/tasks';

async function request(path, options = {}) {
  const config = {
    ...options,
    headers: { ...(options.headers || {}) },
  };

  if (options.body !== undefined) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(options.body);
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, config);
  } catch (cause) {
    const error = new Error('Network request failed.');
    error.code = 'NETWORK_ERROR';
    error.cause = cause;
    throw error;
  }

  let data = null;
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (cause) {
      data = null;
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed.');
    error.status = response.status;
    error.code = data?.error || 'REQUEST_FAILED';
    error.details = data?.details;
    throw error;
  }

  return data;
}

export function getAllTasks(status) {
  const query = status ? `?${new URLSearchParams({ status })}` : '';
  return request(query);
}

export function getTaskById(id) {
  return request(`/${encodeURIComponent(id)}`);
}

export function createTask(payload) {
  return request('', { method: 'POST', body: payload });
}

export function updateTask(id, payload) {
  return request(`/${encodeURIComponent(id)}`, { method: 'PUT', body: payload });
}

export function completeTask(id) {
  return request(`/${encodeURIComponent(id)}/complete`, { method: 'PATCH' });
}

export function deleteTask(id) {
  return request(`/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
