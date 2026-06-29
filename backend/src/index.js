import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/connection.js';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import debtRoutes from './routes/debtRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Rotas de despesas e simulações
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/simulations', simulationRoutes);

// Rotas de histórico
app.use('/api/historico', historyRoutes);

// Rotas básicas
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Teste de conexão com DB
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Conexão com DB OK', time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro na conexão com DB', details: err.message });
  }
});

// Rota para inserir dados de exemplo
app.post('/seed-data', async (req, res) => {
  try {
    // Inserir usuário de exemplo
    const userResult = await pool.query(
      'INSERT INTO usuario (nome, email, senha) VALUES ($1, $2, $3) RETURNING id',
      ['Ana Silva', 'ana@example.com', 'hashed_password_123']
    );
    const userId = userResult.rows[0].id;

    // Inserir despesas de exemplo
    await pool.query(
      'INSERT INTO despesas (usuario_id, descricao, valor, tipo, recorrencia, data_inicio) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'Aluguel', 1500.00, 'fixo', 'mensal', '2026-05-01']
    );

    await pool.query(
      'INSERT INTO despesas (usuario_id, descricao, valor, tipo, recorrencia, data_inicio) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'Mercado', 250.00, 'variavel', 'semanal', '2026-05-01']
    );

    await pool.query(
      'INSERT INTO despesas (usuario_id, descricao, valor, tipo, recorrencia, data_inicio) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'Internet', 89.90, 'fixo', 'mensal', '2026-05-01']
    );

    // Inserir rendas de exemplo
    await pool.query(
      'INSERT INTO ganhos (usuario_id, descricao, valor, recorrencia, data_inicio) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'Salário', 3000.00, 'mensal', '2026-05-01']
    );

    // Inserir dívidas de exemplo
    await pool.query(
      'INSERT INTO dividas (usuario_id, descricao, valor, recorrencia, data_inicio) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'Empréstimo', 500.00, 'mensal', '2026-05-01']
    );

    res.json({ 
      message: 'Dados inseridos com sucesso!', 
      userId: userId 
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao inserir dados', details: err.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});