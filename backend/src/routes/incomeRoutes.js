import express from 'express';
import {
  createIncome,
  getIncomesByUser,
  getIncomeById,
  updateIncome,
  deleteIncome,
} from '../controller/incomeController.js';

const router = express.Router();

// Criar renda
router.post('/', createIncome);

// Listar rendas por usuário
router.get('/user/:usuario_id', getIncomesByUser);

// Obter renda por ID
router.get('/:id', getIncomeById);

// Atualizar renda
router.put('/:id', updateIncome);

// Deletar renda
router.delete('/:id', deleteIncome);

export default router;
