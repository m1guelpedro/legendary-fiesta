import pool from '../db/connection.js';
import { registrarHistorico } from '../utils/auditLog.js';

// Criar nova dívida
export const createDebt = async (req, res) => {
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
      'INSERT INTO dividas (usuario_id, descricao, valor, recorrencia, data_inicio, data_fim) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [usuario_id, descricao, valor, recorrencia, data_inicio, data_fim || null]
    );

    const divida = result.rows[0];

    // Registrar no histórico
    await registrarHistorico({
      usuarioId: usuario_id,
      categoria: 'DIVIDA',
      tipoEvento: 'CRIADO',
      descricao: `Dívida criada: ${descricao} - R$ ${valor}`,
      entidade: 'dividas',
      entidadeId: divida.id,
      dadosNovos: divida,
    });

    res.status(201).json({ message: 'Dívida criada com sucesso', divida });
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

    // Buscar dívida antes da alteração
    const beforeResult = await pool.query('SELECT * FROM dividas WHERE id = $1', [id]);
    if (beforeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dívida não encontrada' });
    }
    const dividaAntes = beforeResult.rows[0];

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
      'UPDATE dividas SET descricao = COALESCE($1, descricao), valor = COALESCE($2, valor), recorrencia = COALESCE($3, recorrencia), data_inicio = COALESCE($4, data_inicio), data_fim = COALESCE($5, data_fim) WHERE id = $6 RETURNING *',
      [descricao, valor, recorrencia, data_inicio, data_fim, id]
    );

    const dividaDepois = result.rows[0];

    // Registrar no histórico
    await registrarHistorico({
      usuarioId: dividaAntes.usuario_id,
      categoria: 'DIVIDA',
      tipoEvento: 'EDITADO',
      descricao: `Dívida editada: ${dividaAntes.descricao} para ${dividaDepois.descricao}`,
      entidade: 'dividas',
      entidadeId: id,
      dadosAnteriores: dividaAntes,
      dadosNovos: dividaDepois,
    });

    res.json({ message: 'Dívida atualizada com sucesso', divida: dividaDepois });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar dívida', details: err.message });
  }
};

// Deletar dívida
export const deleteDebt = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar dívida antes de deletar
    const beforeResult = await pool.query('SELECT * FROM dividas WHERE id = $1', [id]);
    if (beforeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dívida não encontrada' });
    }
    const dividaDeletada = beforeResult.rows[0];

    const result = await pool.query('DELETE FROM dividas WHERE id = $1 RETURNING id', [id]);

    // Registrar no histórico
    await registrarHistorico({
      usuarioId: dividaDeletada.usuario_id,
      categoria: 'DIVIDA',
      tipoEvento: 'DELETADO',
      descricao: `Dívida removida: ${dividaDeletada.descricao}`,
      entidade: 'dividas',
      entidadeId: id,
      dadosAnteriores: dividaDeletada,
    });

    res.json({ message: 'Dívida deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar dívida', details: err.message });
  }
};
