import pool from '../db/connection.js';
import { registrarHistorico } from '../utils/auditLog.js';

// Criar nova renda
export const createIncome = async (req, res) => {
  try {
    const { usuario_id, descricao, valor, recorrencia, data_inicio, data_fim } = req.body;

    // Validação básica
    if (!usuario_id || !descricao || valor === undefined || !recorrencia || !data_inicio) {
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
      'INSERT INTO ganhos (usuario_id, descricao, valor, recorrencia, data_inicio, data_fim) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [usuario_id, descricao, valor, recorrencia, data_inicio, data_fim || null]
    );

    const renda = result.rows[0];

    // Registrar no histórico
    await registrarHistorico({
      usuarioId: usuario_id,
      categoria: 'RECEITA',
      tipoEvento: 'CRIADO',
      descricao: `Receita criada: ${descricao} - R$ ${valor}`,
      entidade: 'ganhos',
      entidadeId: renda.id,
      dadosNovos: renda,
    });

    res.status(201).json({ message: 'Renda criada com sucesso', renda });
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

    // Buscar renda antes da alteração
    const beforeResult = await pool.query('SELECT * FROM ganhos WHERE id = $1', [id]);
    if (beforeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Renda não encontrada' });
    }
    const rendaAntes = beforeResult.rows[0];

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
      'UPDATE ganhos SET descricao = COALESCE($1, descricao), valor = COALESCE($2, valor), recorrencia = COALESCE($3, recorrencia), data_inicio = COALESCE($4, data_inicio), data_fim = COALESCE($5, data_fim) WHERE id = $6 RETURNING *',
      [descricao, valor, recorrencia, data_inicio, data_fim, id]
    );

    const rendaDepois = result.rows[0];

    // Registrar no histórico
    await registrarHistorico({
      usuarioId: rendaAntes.usuario_id,
      categoria: 'RECEITA',
      tipoEvento: 'EDITADO',
      descricao: `Receita editada: ${rendaAntes.descricao} para ${rendaDepois.descricao}`,
      entidade: 'ganhos',
      entidadeId: id,
      dadosAnteriores: rendaAntes,
      dadosNovos: rendaDepois,
    });

    res.json({ message: 'Renda atualizada com sucesso', renda: rendaDepois });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar renda', details: err.message });
  }
};

// Deletar renda
export const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar renda antes de deletar
    const beforeResult = await pool.query('SELECT * FROM ganhos WHERE id = $1', [id]);
    if (beforeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Renda não encontrada' });
    }
    const rendaDeletada = beforeResult.rows[0];

    const result = await pool.query('DELETE FROM ganhos WHERE id = $1 RETURNING id', [id]);

    // Registrar no histórico
    await registrarHistorico({
      usuarioId: rendaDeletada.usuario_id,
      categoria: 'RECEITA',
      tipoEvento: 'DELETADO',
      descricao: `Receita removida: ${rendaDeletada.descricao}`,
      entidade: 'ganhos',
      entidadeId: id,
      dadosAnteriores: rendaDeletada,
    });

    res.json({ message: 'Renda deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar renda', details: err.message });
  }
};
