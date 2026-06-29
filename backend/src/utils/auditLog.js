import pool from '../db/connection.js';

/**
 * Registra um evento de auditoria no banco de dados.
 * 
 * @param {Object} params - Parâmetros do evento
 * @param {number} params.usuarioId - ID do usuário que realizou a ação
 * @param {string} params.categoria - Categoria do evento (AUTH, RECEITA, DESPESA, DIVIDA, SIMULACAO)
 * @param {string} params.tipoEvento - Tipo específico (CRIADO, EDITADO, DELETADO, LOGIN, LOGOUT, etc)
 * @param {string} params.descricao - Descrição amigável do evento
 * @param {string} [params.entidade] - Nome da entidade (despesas, ganhos, dividas, simulacoes)
 * @param {number} [params.entidadeId] - ID da entidade afetada
 * @param {Object} [params.dadosAnteriores] - Dados antes da alteração
 * @param {Object} [params.dadosNovos] - Dados após a alteração
 * @param {Object} [params.metadata] - Metadados adicionais
 * @returns {Promise<Object>} Registro inserido
 */
export const registrarHistorico = async ({
  usuarioId,
  categoria,
  tipoEvento,
  descricao,
  entidade,
  entidadeId,
  dadosAnteriores,
  dadosNovos,
  metadata,
}) => {
  try {
    const result = await pool.query(
      `INSERT INTO historico_atividades 
        (usuario_id, tipo_evento, categoria, descricao, entidade, entidade_id, dados_anteriores, dados_novos, metadata, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
       RETURNING *`,
      [
        usuarioId,
        tipoEvento,
        categoria,
        descricao,
        entidade || null,
        entidadeId || null,
        dadosAnteriores ? JSON.stringify(dadosAnteriores) : null,
        dadosNovos ? JSON.stringify(dadosNovos) : null,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );

    return result.rows[0];
  } catch (err) {
    console.error('Erro ao registrar histórico:', err.message);
    // Não lançar erro para não interromper a operação principal
    return null;
  }
};

/**
 * Obtém o histórico de atividades de um usuário.
 * 
 * @param {number} usuarioId - ID do usuário
 * @param {Object} [filters] - Filtros opcionais
 * @param {number} [filters.page] - Número da página
 * @param {number} [filters.limit] - Itens por página
 * @param {string} [filters.categoria] - Filtrar por categoria
 * @param {string} [filters.tipoEvento] - Filtrar por tipo de evento
 * @param {string} [filters.dataInicio] - Filtrar por data inicial
 * @param {string} [filters.dataFim] - Filtrar por data final
 * @param {string} [filters.busca] - Busca em descrição
 * @returns {Promise<Object>} Lista de eventos com paginação
 */
export const obterHistorico = async (usuarioId, filters = {}) => {
  try {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, filters.limit || 20);
    const offset = (page - 1) * limit;

    const conditions = ['usuario_id = $1'];
    const values = [usuarioId];
    let paramIndex = 2;

    if (filters.categoria) {
      conditions.push(`categoria = $${paramIndex}`);
      values.push(filters.categoria);
      paramIndex += 1;
    }

    if (filters.tipoEvento) {
      conditions.push(`tipo_evento = $${paramIndex}`);
      values.push(filters.tipoEvento);
      paramIndex += 1;
    }

    if (filters.dataInicio) {
      conditions.push(`created_at >= $${paramIndex}::timestamp`);
      values.push(filters.dataInicio);
      paramIndex += 1;
    }

    if (filters.dataFim) {
      conditions.push(`created_at <= $${paramIndex}::timestamp`);
      values.push(filters.dataFim);
      paramIndex += 1;
    }

    if (filters.busca) {
      conditions.push(`descricao ILIKE $${paramIndex}`);
      values.push(`%${filters.busca}%`);
      paramIndex += 1;
    }

    const whereClause = conditions.join(' AND ');
    values.push(limit, offset);

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM historico_atividades WHERE ${whereClause}`,
      values.slice(0, -2)
    );

    const dataResult = await pool.query(
      `SELECT * FROM historico_atividades 
       WHERE ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      values
    );

    return {
      eventos: dataResult.rows,
      page,
      limit,
      total: parseInt(countResult.rows[0].total),
      pages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
    };
  } catch (err) {
    console.error('Erro ao obter histórico:', err.message);
    throw err;
  }
};

/**
 * Obtém um evento específico do histórico.
 * 
 * @param {number} eventoId - ID do evento
 * @param {number} usuarioId - ID do usuário (para verificação de segurança)
 * @returns {Promise<Object|null>} Evento ou null se não encontrado
 */
export const obterEventoHistorico = async (eventoId, usuarioId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM historico_atividades WHERE id = $1 AND usuario_id = $2',
      [eventoId, usuarioId]
    );

    return result.rows[0] || null;
  } catch (err) {
    console.error('Erro ao obter evento:', err.message);
    throw err;
  }
};

/**
 * Obtém resumo de atividades (contadores por categoria).
 * 
 * @param {number} usuarioId - ID do usuário
 * @returns {Promise<Object>} Contadores por categoria
 */
export const obterResumoAtividades = async (usuarioId) => {
  try {
    const result = await pool.query(
      `SELECT 
        categoria,
        COUNT(*) as total,
        tipo_evento
       FROM historico_atividades 
       WHERE usuario_id = $1 
       GROUP BY categoria, tipo_evento
       ORDER BY categoria, tipo_evento`,
      [usuarioId]
    );

    const resumo = {};
    result.rows.forEach(row => {
      if (!resumo[row.categoria]) {
        resumo[row.categoria] = {};
      }
      resumo[row.categoria][row.tipo_evento] = row.total;
    });

    return resumo;
  } catch (err) {
    console.error('Erro ao obter resumo:', err.message);
    throw err;
  }
};

/**
 * Obtém a última atividade do usuário.
 * 
 * @param {number} usuarioId - ID do usuário
 * @returns {Promise<Object|null>} Último evento ou null
 */
export const obterUltimaAtividade = async (usuarioId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM historico_atividades WHERE usuario_id = $1 ORDER BY created_at DESC LIMIT 1',
      [usuarioId]
    );

    return result.rows[0] || null;
  } catch (err) {
    console.error('Erro ao obter última atividade:', err.message);
    throw err;
  }
};
