import express from 'express';
import { registrar, login, perfil, logout } from '../controller/authController.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

// Rotas públicas
router.post('/registrar', registrar);
router.post('/login', login);

// Rotas protegidas (requerem token)
router.get('/perfil', authenticateToken, perfil);
router.post('/logout', authenticateToken, logout);

export default router;
