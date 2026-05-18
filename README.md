# Legendary Fiesta

Projeto full-stack com backend em Node.js/Express, frontend em React/Vite e PostgreSQL, orquestrado via Docker Compose.

## Início Rápido

1. **Pré-requisitos**: Docker e Docker Compose instalados.

2. **Clone e Execute**:
   ```bash
   git clone <url-do-repo>
   cd legendary-fiesta
   docker compose up --build
   ```

3. **Acesse**:
   - Backend: http://localhost:3000
   - Frontend: http://localhost:5173
   - Banco: PostgreSQL na porta 5432 (acessível via ferramentas como pgAdmin ou psql)

## Tutorial de Teste

Siga estes passos para testar a aplicação completa:

### 1. Iniciar os Serviços
```bash
docker compose up --build
```
Isso irá construir e iniciar todos os containers (backend, frontend e banco de dados). Aguarde até ver as mensagens de "ready" no terminal.

### 2. Verificar o Backend
- Abra http://localhost:3000 no navegador.
- Deve aparecer: `{"message":"API funcionando!"}`
- Teste a rota de DB: http://localhost:3000/db-test
- Deve retornar a hora atual do PostgreSQL.

### 3. Verificar o Frontend
- Abra http://localhost:5173 no navegador.
- Deve carregar a página React com "Frontend React".
- Após alguns segundos, deve aparecer "Mensagem da API: API funcionando!" (se o backend estiver rodando).

### 4. Testar a Comunicação
- O frontend faz uma chamada automática para o backend via Docker network.
- Se tudo estiver OK, a mensagem da API será exibida.

### 5. Parar os Serviços
```bash
docker compose down
```

## Comandos Adicionais

- Executar em background: `docker compose up -d --build`
- Parar: `docker compose down`
- Logs: `docker compose logs -f`
- Construir imagens: `docker compose build`

## Arquitetura

- **Backend**: API REST em Node.js (porta 3000), conectada ao PostgreSQL.
- **Frontend**: App React (porta 5173), consumindo a API do backend.
- **Banco**: PostgreSQL (porta 5432).

## Desenvolvimento

Para desenvolvimento, os volumes estão montados, então mudanças no código são refletidas automaticamente (hot reload).

- Entrar no container do backend: `docker exec -it node_api bash`
- Entrar no container do frontend: `docker exec -it react_app sh`

- **Entrar no container do frontend**:
  ```bash
  docker exec -it react_app bash
  ```
  Dentro, rode `npm install <pacote>` ou edite arquivos.

- **Entrar no container do DB (PostgreSQL)**:
  ```bash
  docker exec -it postgres_db psql -U postgres -d app_db
  ```
  Para queries SQL diretas.

- **Ver logs de um serviço específico**:
  ```bash
  docker-compose logs backend
  ```

- **Reiniciar um serviço**:
  ```bash
  docker-compose restart backend
  ```

## API Endpoints

- `GET /`: Mensagem de boas-vindas.
- `GET /db-test`: Testa conexão com o DB.

## Estrutura do Projeto

```
legendary-fiesta/
├── backend/          # API Node.js
│   ├── src/
│   │   ├── index.js
│   │   ├── db/
│   │   └── ...
│   ├── package.json
│   └── Dockerfile
├── frontend/         # App React
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── compose.yml       # Docker Compose
├── package.json      # Scripts raiz
└── README.md
```

## Tutorial para fazer commit:

- Antes de fazer qualquer mudança cheque a sua branch: `git branch`;
- Se não estiver na sua branch faça o seguinte comando: `git checkout seu_nome_sua_branch` OU se você não criou a sua branch ainda `git checkout -b seu_nome_sua_branch`;
- E adicionar as suas mudanças e ir fazendo os seguintes comandos:
- - git add .;
- - git commit -m "sua mensagem";