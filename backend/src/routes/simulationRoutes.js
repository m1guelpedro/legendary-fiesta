import express from 'express';
import {
  simularSaldo,
  calcularSaldoPeriodoController,
  compararPeriodos,
  getHistoricoSimulacoes,
} from '../controller/simulationController.js';

const router = express.Router();

// Simulações
router.post('/simular', simularSaldo); // Simular 1, 3, 6 meses e 1 ano
router.post('/calcular-periodo', calcularSaldoPeriodoController); // Calcular período específico
router.post('/comparar', compararPeriodos); // Comparar todos os períodos
router.get('/historico/:usuario_id', getHistoricoSimulacoes); // Histórico de simulações

export default router;
