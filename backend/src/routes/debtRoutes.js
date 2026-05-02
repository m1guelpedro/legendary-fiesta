import express from 'express';
import {
  createDebt,
  getDebtsByUser,
  getDebtById,
  updateDebt,
  deleteDebt,
} from '../controller/debtController.js';

const router = express.Router();

// Criar dívida
router.post('/', createDebt);

// Listar dívidas por usuário
router.get('/user/:usuario_id', getDebtsByUser);

// Obter dívida por ID
router.get('/:id', getDebtById);

// Atualizar dívida
router.put('/:id', updateDebt);

// Deletar dívida
router.delete('/:id', deleteDebt);

export default router;
