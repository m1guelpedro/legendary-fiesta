import pool from '../db/connection.js';
import { calcularDespesasPorPeriodo, gerarSimulacoes } from '../utils/calculoSimulacao.js';

// Simular despesas para períodos específicos
export const simularDespesas = async (req, res) => {
  try {
    const { usuario_id, data_base } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id é obrigatório' });
    }

    // Buscar despesas do usuário
    const result = await pool.query(
      'SELECT * FROM despesas WHERE usuario_id = $1',
      [usuario_id]
    );

    const despesas = result.rows;

    // Gerar simulações
    const dataRef = data_base || new Date().toISOString().split('T')[0];
    const simulacoes = gerarSimulacoes(despesas, dataRef);

    // Salvar simulação no banco (opcional)
    const dataInicio = dataRef;
    const dataFim1Ano = new Date(dataRef);
    dataFim1Ano.setFullYear(dataFim1Ano.getFullYear() + 1);

    await pool.query(
      'INSERT INTO simulacoes (usuario_id, data_inicio, data_fim, criado_em) VALUES ($1, $2, $3, NOW())',
      [usuario_id, dataInicio, dataFim1Ano.toISOString().split('T')[0]]
    );

    res.json({
      message: 'Simulações geradas com sucesso',
      data_referencia: dataRef,
      simulacoes,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao simular despesas', details: err.message });
  }
};

// Calcular despesas para um período específico
export const calcularPorPeriodo = async (req, res) => {
  try {
    const { usuario_id, data_inicio, data_fim } = req.body;

    if (!usuario_id || !data_inicio || !data_fim) {
      return res.status(400).json({
        error: 'usuario_id, data_inicio e data_fim são obrigatórios',
      });
    }

    // Buscar despesas do usuário
    const result = await pool.query(
      'SELECT * FROM despesas WHERE usuario_id = $1',
      [usuario_id]
    );

    const despesas = result.rows;

    // Calcular despesas do período
    const calculo = calcularDespesasPorPeriodo(despesas, data_inicio, data_fim);

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
    const { usuario_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM simulacoes WHERE usuario_id = $1 ORDER BY criado_em DESC',
      [usuario_id]
    );

    res.json({
      simulacoes: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar histórico', details: err.message });
  }
};
