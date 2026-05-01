import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/connection.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123';

export const registrar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Validação básica
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const usuarioExistente = await pool.query(
      'SELECT id FROM usuario WHERE email = $1',
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir novo usuário
    const resultado = await pool.query(
      'INSERT INTO usuario (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email, senhaHash]
    );

    const usuario = resultado.rows[0];

    // Gerar token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuário registrado com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar usuário', details: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validação básica
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const resultado = await pool.query(
      'SELECT id, nome, email, senha FROM usuario WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const usuario = resultado.rows[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Inserir token na tabela usuario_token (opcional)
    await pool.query(
      'INSERT INTO usuario_token (user_id, token, data_criacao, data_expiracao) VALUES ($1, $2, NOW(), NOW() + INTERVAL \'7 days\')',
      [usuario.id, token]
    );

    res.json({
      message: 'Login realizado com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login', details: err.message });
  }
};

export const perfil = async (req, res) => {
  try {
    const userId = req.user.id;

    const resultado = await pool.query(
      'SELECT id, nome, email FROM usuario WHERE id = $1',
      [userId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      usuario: resultado.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar perfil', details: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Deletar token da tabela
    await pool.query(
      'DELETE FROM usuario_token WHERE user_id = $1 AND token = $2',
      [userId, token]
    );

    res.json({ message: 'Logout realizado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer logout', details: err.message });
  }
};
