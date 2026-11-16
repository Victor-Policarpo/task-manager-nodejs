const path = require('path');
const express = require('express');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);
app.use(express.static(path.join(__dirname, 'views')));
app.use('/api', (req, res) => {
  return res.status(404).json({
    error: 'API_ROUTE_NOT_FOUND',
    message: 'API route not found.',
  });
});
app.use((req, res) => {
  return res.status(404).send('Página não encontrada.');
});
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'INVALID_JSON',
      message: 'Invalid JSON in the request body.',
    });
  }

  console.error(error);

  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error.',
  });
});

module.exports = app;
