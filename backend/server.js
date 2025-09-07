const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', apiRoutes);

// Inicializar banco de dados e servidor
database.init().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}).catch(err => {
  console.error('Erro ao inicializar o banco de dados:', err);
});