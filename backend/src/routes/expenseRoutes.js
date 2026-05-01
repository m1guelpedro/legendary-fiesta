import express from 'express';
import {
  createExpense,
  getExpensesByUser,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from '../controller/expenseController.js';

const router = express.Router();

// CRUD de despesas
router.post('/', createExpense); // Criar despesa
router.get('/user/:usuario_id', getExpensesByUser); // Listar despesas do usuário
router.get('/:id', getExpenseById); // Obter despesa por ID
router.put('/:id', updateExpense); // Atualizar despesa
router.delete('/:id', deleteExpense); // Deletar despesa

export default router;
