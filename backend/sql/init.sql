CREATE TABLE IF NOT EXISTS usuario (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuario_token (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_expiracao TIMESTAMP
);

CREATE TABLE IF NOT EXISTS despesas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  descricao VARCHAR(180) NOT NULL,
  valor NUMERIC(12, 2) NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  recorrencia VARCHAR(20) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ganhos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  descricao VARCHAR(180) NOT NULL,
  valor NUMERIC(12, 2) NOT NULL,
  recorrencia VARCHAR(20) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dividas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  descricao VARCHAR(180) NOT NULL,
  valor NUMERIC(12, 2) NOT NULL,
  recorrencia VARCHAR(20) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulacoes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  input_data JSONB,
  results JSONB,
  params JSONB,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historico_atividades (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  tipo_evento VARCHAR(50) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  entidade VARCHAR(50),
  entidade_id INTEGER,
  dados_anteriores JSONB,
  dados_novos JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historico_usuario_id ON historico_atividades(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historico_created_at ON historico_atividades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historico_categoria ON historico_atividades(categoria);
CREATE INDEX IF NOT EXISTS idx_historico_tipo_evento ON historico_atividades(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_historico_usuario_created ON historico_atividades(usuario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historico_entidade ON historico_atividades(entidade, entidade_id);
