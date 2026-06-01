import pool from '../db/connection.js';
import { registrarHistorico } from '../utils/auditLog.js';

// Criar nova despesa
export const createExpense = async (req, res) => {
  try {
    const { usuario_id, descricao, valor, tipo, recorrencia, data_inicio, data_fim } = req.body;

    // Validação básica
    if (!usuario_id || !descricao || valor === undefined || !tipo || !recorrencia || !data_inicio) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const valorNum = Number(valor);
    if (!isFinite(valorNum) || valorNum <= 0) {
      return res.status(400).json({ error: 'Valor inválido. Deve ser numérico e maior que zero.' });
    }

    const inicio = new Date(data_inicio);
    if (isNaN(inicio.getTime())) return res.status(400).json({ error: 'data_inicio inválida' });
    if (data_fim) {
      const fim = new Date(data_fim);
      if (isNaN(fim.getTime())) return res.status(400).json({ error: 'data_fim inválida' });
      if (fim < inicio) return res.status(400).json({ error: 'data_fim deve ser igual ou posterior à data_inicio' });
    }

    const result = await pool.query(
      'INSERT INTO despesas (usuario_id, descricao, valor, tipo, recorrencia, data_inicio, data_fim) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [usuario_id, descricao, valor, tipo, recorrencia, data_inicio, data_fim || null]
    );

    const despesa = result.rows[0];

    // Registrar no histórico
    await registrarHistorico({
      usuarioId: usuario_id,
      categoria: 'DESPESA',
      tipoEvento: 'CRIADO',
      descricao: `Despesa criada: ${descricao} - R$ ${valor}`,
      entidade: 'despesas',
      entidadeId: despesa.id,
      dadosNovos: despesa,
    });

    res.status(201).json({ message: 'Despesa criada com sucesso', despesa });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar despesa', details: err.message });
  }
};

// Listar despesas por usuário
export const getExpensesByUser = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM despesas WHERE usuario_id = $1 ORDER BY data_inicio DESC',
      [usuario_id]
    );

    res.json({ despesas: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar despesas', details: err.message });
  }
};

// Obter despesa por ID
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM despesas WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }

    res.json({ despesa: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar despesa', details: err.message });
  }
};

// Atualizar despesa
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, valor, tipo, recorrencia, data_inicio, data_fim } = req.body;

    // Buscar despesa antes da alteração
    const beforeResult = await pool.query('SELECT * FROM despesas WHERE id = $1', [id]);
    if (beforeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }
    const despesaAntes = beforeResult.rows[0];

    if (valor !== undefined) {
      const valorNum = Number(valor);
      if (!isFinite(valorNum) || valorNum <= 0) {
        return res.status(400).json({ error: 'Valor inválido. Deve ser numérico e maior que zero.' });
      }
    }

    if (data_inicio) {
      const inicio = new Date(data_inicio);
      if (isNaN(inicio.getTime())) return res.status(400).json({ error: 'data_inicio inválida' });
      if (data_fim) {
        const fim = new Date(data_fim);
        if (isNaN(fim.getTime())) return res.status(400).json({ error: 'data_fim inválida' });
        if (fim < inicio) return res.status(400).json({ error: 'data_fim deve ser igual ou posterior à data_inicio' });
      }
    }

    const result = await pool.query(
      'UPDATE despesas SET descricao = COALESCE($1, descricao), valor = COALESCE($2, valor), tipo = COALESCE($3, tipo), recorrencia = COALESCE($4, recorrencia), data_inicio = COALESCE($5, data_inicio), data_fim = COALESCE($6, data_fim) WHERE id = $7 RETURNING *',
      [descricao, valor, tipo, recorrencia, data_inicio, data_fim, id]
    );

    const despesaDepois = result.rows[0];

    // Registrar no histórico
    await registrarHistorico({
      usuarioId: despesaAntes.usuario_id,
      categoria: 'DESPESA',
      tipoEvento: 'EDITADO',
      descricao: `Despesa editada: ${despesaAntes.descricao} para ${despesaDepois.descricao}`,
      entidade: 'despesas',
      entidadeId: id,
      dadosAnteriores: despesaAntes,
      dadosNovos: despesaDepois,
    });

    res.json({ message: 'Despesa atualizada com sucesso', despesa: despesaDepois });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar despesa', details: err.message });
  }
};

// Deletar despesa
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar despesa antes de deletar
    const beforeResult = await pool.query('SELECT * FROM despesas WHERE id = $1', [id]);
    if (beforeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }
    const despesaDeletada = beforeResult.rows[0];

    const result = await pool.query('DELETE FROM despesas WHERE id = $1 RETURNING id', [id]);

    // Registrar no histórico
    await registrarHistorico({
      usuarioId: despesaDeletada.usuario_id,
      categoria: 'DESPESA',
      tipoEvento: 'DELETADO',
      descricao: `Despesa removida: ${despesaDeletada.descricao}`,
      entidade: 'despesas',
      entidadeId: id,
      dadosAnteriores: despesaDeletada,
    });

    res.json({ message: 'Despesa deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar despesa', details: err.message });
  }
};
