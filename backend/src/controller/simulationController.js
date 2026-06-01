import pool from '../db/connection.js';
import { calcularSaldoPorPeriodo, gerarSimulacoesBalance } from '../utils/calculoSimulacao.js';
import { registrarHistorico } from '../utils/auditLog.js';

// Simular saldo para períodos específicos
export const simularSaldo = async (req, res) => {
  try {
    const { usuario_id, data_base } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id é obrigatório' });
    }

    // Buscar despesas do usuário
    const despesasResult = await pool.query(
      'SELECT * FROM despesas WHERE usuario_id = $1',
      [usuario_id]
    );
    const despesas = despesasResult.rows;

    // Buscar rendas do usuário
    const rendasResult = await pool.query(
      'SELECT * FROM ganhos WHERE usuario_id = $1',
      [usuario_id]
    );
    const rendas = rendasResult.rows;

    // Buscar dívidas do usuário
    const dividasResult = await pool.query(
      'SELECT * FROM dividas WHERE usuario_id = $1',
      [usuario_id]
    );
    const dividas = dividasResult.rows;

    // Gerar simulações
    const dataRef = data_base || new Date().toISOString().split('T')[0];
    const simulacoes = gerarSimulacoesBalance(rendas, despesas, dividas, dataRef);

    // Salvar simulação no banco com dados completos
    const dataInicio = dataRef;
    const dataFim1Ano = new Date(dataRef);
    dataFim1Ano.setFullYear(dataFim1Ano.getFullYear() + 1);

    const inputData = { usuario_id, data_base: data_base || null };
    const results = { simulacoes };
    const params = { renda_count: rendas.length, despesa_count: despesas.length, divida_count: dividas.length };

    await pool.query(
      'INSERT INTO simulacoes (usuario_id, data_inicio, data_fim, input_data, results, params, criado_em) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [usuario_id, dataInicio, dataFim1Ano.toISOString().split('T')[0], JSON.stringify(inputData), JSON.stringify(results), JSON.stringify(params)]
    );

    // Registrar no histórico
    await registrarHistorico({
      usuarioId: usuario_id,
      categoria: 'SIMULACAO',
      tipoEvento: 'EXECUTADO',
      descricao: `Simulação de 12 meses executada`,
      metadata: {
        data_referencia: dataRef,
        receitas: rendas.length,
        despesas: despesas.length,
        dividas: dividas.length,
      },
    });

    res.json({
      message: 'Simulações geradas com sucesso',
      data_referencia: dataRef,
      simulacoes,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao simular saldo', details: err.message });
  }
};

// Calcular saldo para um período específico
export const calcularSaldoPeriodoController = async (req, res) => {
  try {
    const { usuario_id, data_inicio, data_fim } = req.body;

    if (!usuario_id || !data_inicio || !data_fim) {
      return res.status(400).json({
        error: 'usuario_id, data_inicio e data_fim são obrigatórios',
      });
    }

    // Buscar despesas do usuário
    const despesasResult = await pool.query(
      'SELECT * FROM despesas WHERE usuario_id = $1',
      [usuario_id]
    );
    const despesas = despesasResult.rows;

    // Buscar rendas do usuário
    const rendasResult = await pool.query(
      'SELECT * FROM ganhos WHERE usuario_id = $1',
      [usuario_id]
    );
    const rendas = rendasResult.rows;

    // Buscar dívidas do usuário
    const dividasResult = await pool.query(
      'SELECT * FROM dividas WHERE usuario_id = $1',
      [usuario_id]
    );
    const dividas = dividasResult.rows;

    // Calcular saldo do período
    const calculo = calcularSaldoPorPeriodo(rendas, despesas, dividas, data_inicio, data_fim);

    res.json({
      message: 'Cálculo realizado com sucesso',
      resultado: calculo,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao calcular despesas', details: err.message });
  }
};

// Comparar simulações entre períodos
export const compararPeriodos = async (req, res) => {
  try {
    const { usuario_id } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id é obrigatório' });
    }

    // Buscar despesas do usuário
    const result = await pool.query(
      'SELECT * FROM despesas WHERE usuario_id = $1',
      [usuario_id]
    );

    const despesas = result.rows;
    const dataBase = new Date().toISOString().split('T')[0];
    const simulacoes = gerarSimulacoes(despesas, dataBase);

    // Extrair apenas os totais para comparação
    const comparacao = {
      periodos: {
        '1_mes': simulacoes['1_mes'].resumo.total,
        '3_meses': simulacoes['3_meses'].resumo.total,
        '6_meses': simulacoes['6_meses'].resumo.total,
        '1_ano': simulacoes['1_ano'].resumo.total,
      },
      media_mensal: parseFloat(
        ((simulacoes['1_ano'].resumo.total / 12) || 0).toFixed(2)
      ),
      detalhes: simulacoes,
    };

    res.json({
      message: 'Comparação gerada com sucesso',
      data_referencia: dataBase,
      comparacao,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao comparar períodos', details: err.message });
  }
};

// Histórico de simulações
export const getHistoricoSimulacoes = async (req, res) => {
  try {
    // Compatível: aceitar /historico/:usuario_id ou /historico?usuario_id=...
    const usuario_id = req.params.usuario_id || req.query.usuario_id;
    if (!usuario_id) return res.status(400).json({ error: 'usuario_id é obrigatório' });

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    // Filtros adicionais (datas)
    const filters = [];
    const values = [usuario_id];
    let idx = 2;

    if (req.query.data_inicio) {
      filters.push(`data_inicio >= $${idx}`);
      values.push(req.query.data_inicio);
      idx += 1;
    }

    if (req.query.data_fim) {
      filters.push(`data_fim <= $${idx}`);
      values.push(req.query.data_fim);
      idx += 1;
    }

    const where = `WHERE usuario_id = $1${filters.length ? ' AND ' + filters.join(' AND ') : ''}`;

    const result = await pool.query(
      `SELECT * FROM simulacoes ${where} ORDER BY criado_em DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    );

    res.json({
      simulacoes: result.rows,
      page,
      limit,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar histórico', details: err.message });
  }
};
