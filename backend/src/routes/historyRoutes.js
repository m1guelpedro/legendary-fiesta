import express from 'express';
import authenticateToken from '../middleware/authMiddleware.js';
import {
  obterHistorico,
  obterEventoHistorico,
  obterResumoAtividades,
  obterUltimaAtividade,
} from '../utils/auditLog.js';

const router = express.Router();

/**
 * GET /api/historico
 * Lista o histórico de atividades do usuário com filtros e paginação.
 * Query params: page, limit, categoria, tipoEvento, dataInicio, dataFim, busca
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const filters = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      categoria: req.query.categoria,
      tipoEvento: req.query.tipoEvento,
      dataInicio: req.query.dataInicio,
      dataFim: req.query.dataFim,
      busca: req.query.busca,
    };

    const historico = await obterHistorico(usuarioId, filters);
    res.json(historico);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter histórico', details: err.message });
  }
});

/**
 * GET /api/historico/:id
 * Obtém os detalhes de um evento específico.
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const eventoId = parseInt(req.params.id);

    const evento = await obterEventoHistorico(eventoId, usuarioId);
    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    // Parse JSON fields
    if (evento.dados_anteriores) evento.dados_anteriores = JSON.parse(evento.dados_anteriores);
    if (evento.dados_novos) evento.dados_novos = JSON.parse(evento.dados_novos);
    if (evento.metadata) evento.metadata = JSON.parse(evento.metadata);

    res.json({ evento });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter evento', details: err.message });
  }
});

/**
 * GET /api/historico/resumo/atividades
 * Obtém resumo (contadores) de atividades por categoria.
 */
router.get('/resumo/atividades', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const resumo = await obterResumoAtividades(usuarioId);

    res.json({ resumo });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter resumo', details: err.message });
  }
});

/**
 * GET /api/historico/ultima/atividade
 * Obtém a última atividade registrada.
 */
router.get('/ultima/atividade', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const ultimaAtividade = await obterUltimaAtividade(usuarioId);

    res.json({ ultimaAtividade });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter última atividade', details: err.message });
  }
});

export default router;
