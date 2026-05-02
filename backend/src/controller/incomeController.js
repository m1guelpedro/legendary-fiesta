import pool from '../db/connection.js';

// Criar nova renda
export const createIncome = async (req, res) => {
  try {
    const { usuario_id, descricao, valor, recorrencia, data_inicio, data_fim } = req.body;

    // Validação básica
    if (!usuario_id || !descricao || !valor || !recorrencia || !data_inicio) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const result = await pool.query(
      'INSERT INTO ganhos (usuario_id, descricao, valor, recorrencia, data_inicio, data_fim) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [usuario_id, descricao, valor, recorrencia, data_inicio, data_fim || null]
    );

    res.status(201).json({ message: 'Renda criada com sucesso', renda: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar renda', details: err.message });
  }
};

// Listar rendas por usuário
export const getIncomesByUser = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM ganhos WHERE usuario_id = $1 ORDER BY data_inicio DESC',
      [usuario_id]
    );

    res.json({ rendas: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar rendas', details: err.message });
  }
};

// Obter renda por ID
export const getIncomeById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM ganhos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Renda não encontrada' });
    }

    res.json({ renda: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar renda', details: err.message });
  }
};

// Atualizar renda
export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, valor, recorrencia, data_inicio, data_fim } = req.body;

    const result = await pool.query(
      'UPDATE ganhos SET descricao = COALESCE($1, descricao), valor = COALESCE($2, valor), recorrencia = COALESCE($3, recorrencia), data_inicio = COALESCE($4, data_inicio), data_fim = COALESCE($5, data_fim) WHERE id = $6 RETURNING *',
      [descricao, valor, recorrencia, data_inicio, data_fim, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Renda não encontrada' });
    }

    res.json({ message: 'Renda atualizada com sucesso', renda: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar renda', details: err.message });
  }
};

// Deletar renda
export const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM ganhos WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Renda não encontrada' });
    }

    res.json({ message: 'Renda deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar renda', details: err.message });
  }
};
