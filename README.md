# Organizando Tudo API

API para gerenciamento de tarefas e notas.

## Pré-requisitos

- Node.js (versão 18 ou superior)
- MongoDB (local ou Atlas)
- Netlify CLI (para desenvolvimento local)
- Conta no Netlify (para deploy)

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/organizandotudo.api.git
cd organizandotudo.api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
MONGODB_URI=sua_uri_do_mongodb
JWT_SECRET=sua_chave_secreta_jwt
```

4. Configure as variáveis de ambiente no Netlify:
- Acesse o painel do Netlify
- Vá em Site settings > Environment variables
- Adicione as mesmas variáveis do arquivo `.env`

## Desenvolvimento Local

1. Inicie o servidor de desenvolvimento:
```bash
netlify dev
```

2. Acesse a API em:
```
http://localhost:8888/.netlify/functions/nome-da-funcao
```

## Endpoints

### Autenticação

#### Login
```http
POST /.netlify/functions/login
Content-Type: application/json

{
  "username": "usuario",
  "password": "senha"
}
```

Resposta:
```json
{
  "token": "jwt_token",
  "username": "usuario",
  "email": "email@exemplo.com"
}
```

O token JWT gerado contém as seguintes informações:
- username (descriptografado)
- email
- password (descriptografada)
- issuedAt (data de emissão)
- exp (data de expiração - 30 dias)

O token é salvo no banco de dados e pode ser usado para autenticação em requisições subsequentes.

#### Criar Conta
```http
POST /.netlify/functions/create-account
Content-Type: application/json

{
  "username": "novo_usuario",
  "password": "senha",
  "email": "email@exemplo.com"
}
```

Resposta:
```json
{
  "message": "Conta criada com sucesso",
  "username": "novo_usuario",
  "email": "email@exemplo.com"
}
```

### Tarefas

#### Listar Tarefas
```http
GET /.netlify/functions/tasks
Authorization: Bearer seu_token_jwt
```

Resposta:
```json
[
  {
    "id": "123",
    "title": "Tarefa 1",
    "description": "Descrição da tarefa",
    "completed": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Criar Tarefa
```http
POST /.netlify/functions/tasks
Authorization: Bearer seu_token_jwt
Content-Type: application/json

{
  "title": "Nova Tarefa",
  "description": "Descrição da tarefa"
}
```

Resposta:
```json
{
  "id": "123",
  "title": "Nova Tarefa",
  "description": "Descrição da tarefa",
  "completed": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Atualizar Tarefa
```http
PUT /.netlify/functions/tasks/123
Authorization: Bearer seu_token_jwt
Content-Type: application/json

{
  "title": "Tarefa Atualizada",
  "description": "Nova descrição",
  "completed": true
}
```

Resposta:
```json
{
  "id": "123",
  "title": "Tarefa Atualizada",
  "description": "Nova descrição",
  "completed": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Deletar Tarefa
```http
DELETE /.netlify/functions/tasks/123
Authorization: Bearer seu_token_jwt
```

Resposta:
```json
{
  "message": "Tarefa deletada com sucesso"
}
```

### Notas

#### Listar Notas
```http
GET /.netlify/functions/notes
Authorization: Bearer seu_token_jwt
```

Resposta:
```json
[
  {
    "id": "123",
    "title": "Nota 1",
    "content": "Conteúdo da nota",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Criar Nota
```http
POST /.netlify/functions/notes
Authorization: Bearer seu_token_jwt
Content-Type: application/json

{
  "title": "Nova Nota",
  "content": "Conteúdo da nota"
}
```

Resposta:
```json
{
  "id": "123",
  "title": "Nova Nota",
  "content": "Conteúdo da nota",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Atualizar Nota
```http
PUT /.netlify/functions/notes/123
Authorization: Bearer seu_token_jwt
Content-Type: application/json

{
  "title": "Nota Atualizada",
  "content": "Novo conteúdo"
}
```

Resposta:
```json
{
  "id": "123",
  "title": "Nota Atualizada",
  "content": "Novo conteúdo",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Deletar Nota
```http
DELETE /.netlify/functions/notes/123
Authorization: Bearer seu_token_jwt
```

Resposta:
```json
{
  "message": "Nota deletada com sucesso"
}
```

#### Publicar/Despublicar Nota
```http
PUT /.netlify/functions/publish-note?id=123
Authorization: Bearer seu_token_jwt
```

Resposta:
```json
{
  "pt": {
    "message": "Sua nota foi atualizada com sucesso!",
    "code": "Sucesso"
  },
  "en": {
    "message": "Your note was updated successfully!",
    "code": "Success"
  }
}
```

Este endpoint alterna o status de publicação da nota entre público e privado. Se a nota estiver privada (public: false), ficará pública (public: true) e vice-versa.

## Segurança

- Todos os dados sensíveis (username, email, password) são criptografados no banco de dados
- O token JWT contém informações descriptografadas e tem validade de 30 dias
- Todas as requisições (exceto login e criar conta) requerem autenticação via token JWT
- O token é salvo no banco de dados e pode ser validado para garantir sua autenticidade

## Deploy

O deploy é feito automaticamente através do Netlify quando há push para a branch principal.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.