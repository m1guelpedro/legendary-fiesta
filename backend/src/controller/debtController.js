import pool from '../db/connection.js';

// Criar nova dívida
export const createDebt = async (req, res) => {
  try {
    const { usuario_id, descricao, valor, recorrencia, data_inicio, data_fim } = req.body;

    // Validação básica
    if (!usuario_id || !descricao || !valor || !recorrencia || !data_inicio) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const result = await pool.query(
      'INSERT INTO dividas (usuario_id, descricao, valor, recorrencia, data_inicio, data_fim) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [usuario_id, descricao, valor, recorrencia, data_inicio, data_fim || null]
    );

    res.status(201).json({ message: 'Dívida criada com sucesso', divida: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar dívida', details: err.message });
  }
};

// Listar dívidas por usuário
export const getDebtsByUser = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM dividas WHERE usuario_id = $1 ORDER BY data_inicio DESC',
      [usuario_id]
    );

    res.json({ dividas: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar dívidas', details: err.message });
  }
};

// Obter dívida por ID
export const getDebtById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM dividas WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dívida não encontrada' });
    }

    res.json({ divida: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar dívida', details: err.message });
  }
};

// Atualizar dívida
export const updateDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, valor, recorrencia, data_inicio, data_fim } = req.body;

    const result = await pool.query(
      'UPDATE dividas SET descricao = COALESCE($1, descricao), valor = COALESCE($2, valor), recorrencia = COALESCE($3, recorrencia), data_inicio = COALESCE($4, data_inicio), data_fim = COALESCE($5, data_fim) WHERE id = $6 RETURNING *',
      [descricao, valor, recorrencia, data_inicio, data_fim, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dívida não encontrada' });
    }

    res.json({ message: 'Dívida atualizada com sucesso', divida: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar dívida', details: err.message });
  }
};

// Deletar dívida
export const deleteDebt = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM dividas WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dívida não encontrada' });
    }

    res.json({ message: 'Dívida deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar dívida', details: err.message });
  }
};
