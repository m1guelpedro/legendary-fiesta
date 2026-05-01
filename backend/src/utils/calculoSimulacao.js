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
 * Gera simulações para períodos padrão: 1 mês, 3 meses, 6 meses, 1 ano
 * @param {Array} despesas - Array de despesas do usuário
 * @param {String} dataBase - Data de referência (YYYY-MM-DD)
 * @returns {Object} Objeto com simulações de todos os períodos
 */
export const gerarSimulacoes = (despesas, dataBase = new Date().toISOString().split('T')[0]) => {
  const data = new Date(dataBase);

  const simulacoes = {};

  // 1 mês
  const dataFim1Mes = new Date(data);
  dataFim1Mes.setMonth(dataFim1Mes.getMonth() + 1);
  dataFim1Mes.setDate(dataFim1Mes.getDate() - 1);
  simulacoes['1_mes'] = calcularDespesasPorPeriodo(
    despesas,
    dataBase,
    dataFim1Mes.toISOString().split('T')[0]
  );

  // 3 meses
  const dataFim3Meses = new Date(data);
  dataFim3Meses.setMonth(dataFim3Meses.getMonth() + 3);
  dataFim3Meses.setDate(dataFim3Meses.getDate() - 1);
  simulacoes['3_meses'] = calcularDespesasPorPeriodo(
    despesas,
    dataBase,
    dataFim3Meses.toISOString().split('T')[0]
  );

  // 6 meses
  const dataFim6Meses = new Date(data);
  dataFim6Meses.setMonth(dataFim6Meses.getMonth() + 6);
  dataFim6Meses.setDate(dataFim6Meses.getDate() - 1);
  simulacoes['6_meses'] = calcularDespesasPorPeriodo(
    despesas,
    dataBase,
    dataFim6Meses.toISOString().split('T')[0]
  );

  // 1 ano
  const dataFim1Ano = new Date(data);
  dataFim1Ano.setFullYear(dataFim1Ano.getFullYear() + 1);
  dataFim1Ano.setDate(dataFim1Ano.getDate() - 1);
  simulacoes['1_ano'] = calcularDespesasPorPeriodo(
    despesas,
    dataBase,
    dataFim1Ano.toISOString().split('T')[0]
  );

  return simulacoes;
};
