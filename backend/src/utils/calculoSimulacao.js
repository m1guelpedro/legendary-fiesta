/**
 * Calcula o valor total de despesas para um período específico
 * @param {Array} despesas - Array de despesas do usuário
 * @param {String} dataInicio - Data de início (YYYY-MM-DD)
 * @param {String} dataFim - Data de fim (YYYY-MM-DD)
 * @returns {Object} Objeto com cálculos detalhados
 */
export const calcularDespesasPorPeriodo = (despesas, dataInicio, dataFim) => {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);

  let totalFixo = 0;
  let totalVariavel = 0;
  let detalhes = [];

  despesas.forEach((despesa) => {
    const despesaInicio = new Date(despesa.data_inicio);
    const despesaFim = despesa.data_fim ? new Date(despesa.data_fim) : null;

    // Verificar se a despesa está no período
    if (despesaInicio <= fim && (!despesaFim || despesaFim >= inicio)) {
      const ocorrencias = calcularOcorrencias(despesaInicio, despesaFim, inicio, fim, despesa.recorrencia);
      const valorTotal = ocorrencias * parseFloat(despesa.valor);

      if (despesa.tipo === 'fixo') {
        totalFixo += valorTotal;
      } else {
        totalVariavel += valorTotal;
      }

      detalhes.push({
        id: despesa.id,
        descricao: despesa.descricao,
        valorUnitario: parseFloat(despesa.valor),
        tipo: despesa.tipo,
        recorrencia: despesa.recorrencia,
        ocorrencias: ocorrencias,
        valorTotal: valorTotal,
      });
    }
  });

  return {
    periodo: {
      dataInicio,
      dataFim,
    },
    resumo: {
      totalFixo: parseFloat(totalFixo.toFixed(2)),
      totalVariavel: parseFloat(totalVariavel.toFixed(2)),
      total: parseFloat((totalFixo + totalVariavel).toFixed(2)),
    },
    detalhes,
  };
};

/**
 * Calcula o valor total de rendas para um período específico
 * @param {Array} rendas - Array de rendas do usuário
 * @param {String} dataInicio - Data de início (YYYY-MM-DD)
 * @param {String} dataFim - Data de fim (YYYY-MM-DD)
 * @returns {Object} Objeto com cálculos detalhados
 */
export const calcularRendasPorPeriodo = (rendas, dataInicio, dataFim) => {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);

  let total = 0;
  let detalhes = [];

  rendas.forEach((renda) => {
    const rendaInicio = new Date(renda.data_inicio);
    const rendaFim = renda.data_fim ? new Date(renda.data_fim) : null;

    // Verificar se a renda está no período
    if (rendaInicio <= fim && (!rendaFim || rendaFim >= inicio)) {
      const ocorrencias = calcularOcorrencias(rendaInicio, rendaFim, inicio, fim, renda.recorrencia);
      const valorTotal = ocorrencias * parseFloat(renda.valor);

      total += valorTotal;

      detalhes.push({
        id: renda.id,
        descricao: renda.descricao,
        valorUnitario: parseFloat(renda.valor),
        recorrencia: renda.recorrencia,
        ocorrencias: ocorrencias,
        valorTotal: valorTotal,
      });
    }
  });

  return {
    periodo: {
      dataInicio,
      dataFim,
    },
    resumo: {
      total: parseFloat(total.toFixed(2)),
    },
    detalhes,
  };
};

/**
 * Calcula o valor total de dívidas para um período específico
 * @param {Array} dividas - Array de dívidas do usuário
 * @param {String} dataInicio - Data de início (YYYY-MM-DD)
 * @param {String} dataFim - Data de fim (YYYY-MM-DD)
 * @returns {Object} Objeto com cálculos detalhados
 */
export const calcularDividasPorPeriodo = (dividas, dataInicio, dataFim) => {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);

  let total = 0;
  let detalhes = [];

  dividas.forEach((divida) => {
    const dividaInicio = new Date(divida.data_inicio);
    const dividaFim = divida.data_fim ? new Date(divida.data_fim) : null;

    // Verificar se a dívida está no período
    if (dividaInicio <= fim && (!dividaFim || dividaFim >= inicio)) {
      const ocorrencias = calcularOcorrencias(dividaInicio, dividaFim, inicio, fim, divida.recorrencia);
      const valorTotal = ocorrencias * parseFloat(divida.valor);

      total += valorTotal;

      detalhes.push({
        id: divida.id,
        descricao: divida.descricao,
        valorUnitario: parseFloat(divida.valor),
        recorrencia: divida.recorrencia,
        ocorrencias: ocorrencias,
        valorTotal: valorTotal,
      });
    }
  });

  return {
    periodo: {
      dataInicio,
      dataFim,
    },
    resumo: {
      total: parseFloat(total.toFixed(2)),
    },
    detalhes,
  };
};

/**
 * Calcula o saldo (renda - despesas - dívidas) para um período
 * @param {Array} rendas - Array de rendas
 * @param {Array} despesas - Array de despesas
 * @param {Array} dividas - Array de dívidas
 * @param {String} dataInicio - Data de início
 * @param {String} dataFim - Data de fim
 * @returns {Object} Objeto com saldo detalhado
 */
export const calcularSaldoPorPeriodo = (rendas, despesas, dividas, dataInicio, dataFim) => {
  const rendaCalc = calcularRendasPorPeriodo(rendas, dataInicio, dataFim);
  const despesaCalc = calcularDespesasPorPeriodo(despesas, dataInicio, dataFim);
  const dividaCalc = calcularDividasPorPeriodo(dividas, dataInicio, dataFim);

  const saldo = rendaCalc.resumo.total - despesaCalc.resumo.total - dividaCalc.resumo.total;

  return {
    periodo: {
      dataInicio,
      dataFim,
    },
    resumo: {
      totalRenda: rendaCalc.resumo.total,
      totalDespesas: despesaCalc.resumo.total,
      totalDividas: dividaCalc.resumo.total,
      saldo: parseFloat(saldo.toFixed(2)),
    },
    detalhes: {
      rendas: rendaCalc.detalhes,
      despesas: despesaCalc.detalhes,
      dividas: dividaCalc.detalhes,
    },
  };
};

/**
 * Calcula quantas vezes uma despesa ocorre no período
 */
const calcularOcorrencias = (dataInicio, dataFim, periodoInicio, periodoFim, recorrencia) => {
  let inicio = new Date(Math.max(dataInicio.getTime(), periodoInicio.getTime()));
  let fim = new Date(Math.min(dataFim ? dataFim.getTime() : periodoFim.getTime(), periodoFim.getTime()));

  if (inicio > fim) return 0;

  switch (recorrencia) {
    case 'mensal':
      return calcularMeses(inicio, fim) + 1;
    case 'semanal':
      return Math.floor((fim - inicio) / (7 * 24 * 60 * 60 * 1000)) + 1;
    case 'anual':
      return calcularAnos(inicio, fim) + 1;
    case 'unica':
      return 1;
    default:
      return 1;
  }
};

/**
 * Calcula a diferença em meses entre duas datas
 */
const calcularMeses = (data1, data2) => {
  return (data2.getFullYear() - data1.getFullYear()) * 12 + (data2.getMonth() - data1.getMonth());
};

/**
 * Calcula a diferença em anos entre duas datas
 */
const calcularAnos = (data1, data2) => {
  return data2.getFullYear() - data1.getFullYear();
};

/**
 * Gera simulações de saldo para períodos padrão: 1 mês, 3 meses, 6 meses, 1 ano
 * @param {Array} rendas - Array de rendas do usuário
 * @param {Array} despesas - Array de despesas do usuário
 * @param {Array} dividas - Array de dívidas do usuário
 * @param {String} dataBase - Data de referência (YYYY-MM-DD)
 * @returns {Object} Objeto com simulações de todos os períodos
 */
export const gerarSimulacoesBalance = (rendas, despesas, dividas, dataBase = new Date().toISOString().split('T')[0]) => {
  const data = new Date(dataBase);

  const simulacoes = {};

  // 1 mês
  const dataFim1Mes = new Date(data);
  dataFim1Mes.setMonth(dataFim1Mes.getMonth() + 1);
  dataFim1Mes.setDate(dataFim1Mes.getDate() - 1);
  simulacoes['1_mes'] = calcularSaldoPorPeriodo(
    rendas,
    despesas,
    dividas,
    dataBase,
    dataFim1Mes.toISOString().split('T')[0]
  );

  // 3 meses
  const dataFim3Meses = new Date(data);
  dataFim3Meses.setMonth(dataFim3Meses.getMonth() + 3);
  dataFim3Meses.setDate(dataFim3Meses.getDate() - 1);
  simulacoes['3_meses'] = calcularSaldoPorPeriodo(
    rendas,
    despesas,
    dividas,
    dataBase,
    dataFim3Meses.toISOString().split('T')[0]
  );

  // 6 meses
  const dataFim6Meses = new Date(data);
  dataFim6Meses.setMonth(dataFim6Meses.getMonth() + 6);
  dataFim6Meses.setDate(dataFim6Meses.getDate() - 1);
  simulacoes['6_meses'] = calcularSaldoPorPeriodo(
    rendas,
    despesas,
    dividas,
    dataBase,
    dataFim6Meses.toISOString().split('T')[0]
  );

  // 1 ano
  const dataFim1Ano = new Date(data);
  dataFim1Ano.setFullYear(dataFim1Ano.getFullYear() + 1);
  dataFim1Ano.setDate(dataFim1Ano.getDate() - 1);
  simulacoes['1_ano'] = calcularSaldoPorPeriodo(
    rendas,
    despesas,
    dividas,
    dataBase,
    dataFim1Ano.toISOString().split('T')[0]
  );

  return simulacoes;
};
