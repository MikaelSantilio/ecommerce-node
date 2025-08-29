# Notifications Service

Serviço de notificações para a plataforma de e-commerce, responsável por enviar emails e SMS usando AWS SES e Twilio.

## Funcionalidades

- ✅ Envio de notificações por email (AWS SES)
- ✅ Envio de notificações por SMS (Twilio)
- ✅ Processamento assíncrono com Bull queues
- ✅ Templates dinâmicos com Handlebars
- ✅ Validação de dados com Zod
- ✅ Rate limiting
- ✅ Estatísticas e monitoramento
- ✅ API REST completa
- ✅ Integração com MongoDB e Redis

## Tecnologias

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **MongoDB** + **Mongoose** - Banco de dados
- **Redis** + **Bull** - Filas e cache
- **AWS SES** - Serviço de email
- **Twilio** - Serviço de SMS
- **Handlebars** - Templates
- **Zod** - Validação
- **Docker** - Containerização

## Estrutura do Projeto

```
packages/notifications/
├── src/
│   ├── config/           # Configurações (AWS, Twilio, DB, Redis)
│   ├── controllers/      # Controladores da API
│   ├── middleware/       # Middlewares (validação, rate limiting)
│   ├── models/          # Modelos do MongoDB
│   ├── routes/          # Rotas da API
│   ├── services/        # Lógica de negócio
│   ├── templates/       # Templates Handlebars
│   ├── types/           # Definições de tipos
│   └── workers/         # Workers do Bull
├── Dockerfile           # Container Docker
├── docker-compose.yml   # Configuração Docker
├── package.json         # Dependências
└── tsconfig.json        # Configuração TypeScript
```

## Instalação e Configuração

### 1. Instalar Dependências

```bash
cd packages/notifications
npm install
```

### 2. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Servidor
PORT=3003
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/notifications

# Redis
REDIS_URL=redis://localhost:6379

# AWS SES
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
SES_FROM_EMAIL=noreply@yourdomain.com

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL (para links em emails)
FRONTEND_URL=http://localhost:3000
```

### 3. Executar o Serviço

#### Desenvolvimento
```bash
npm run dev
```

#### Produção
```bash
npm run build
npm start
```

#### Docker
```bash
docker-compose up -d
```

## API Endpoints

### Notificações

#### Criar Notificação
```http
POST /api/notifications
Content-Type: application/json

{
  "userId": "user123",
  "type": "order_confirmed",
  "channel": "email",
  "recipient": {
    "email": "user@example.com",
    "name": "João Silva"
  },
  "data": {
    "orderId": "12345",
    "total": 99.99
  }
}
```

#### Criar Múltiplas Notificações
```http
POST /api/notifications/bulk
Content-Type: application/json

{
  "notifications": [
    {
      "userId": "user123",
      "type": "order_confirmed",
      "channel": "email",
      "recipient": {
        "email": "user@example.com",
        "name": "João Silva"
      }
    }
  ]
}
```

#### Listar Notificações
```http
GET /api/notifications?page=1&limit=10&status=sent
```

#### Buscar Notificação por ID
```http
GET /api/notifications/:id
```

#### Atualizar Status
```http
PATCH /api/notifications/:id/status
Content-Type: application/json

{
  "status": "sent"
}
```

#### Cancelar Notificação
```http
DELETE /api/notifications/:id
```

### Templates

#### Criar Template
```http
POST /api/notifications/templates
Content-Type: application/json

{
  "name": "order_confirmed",
  "type": "order_confirmed",
  "channel": "email",
  "subject": "Pedido Confirmado",
  "content": "<h1>Seu pedido foi confirmado!</h1>",
  "variables": ["orderId", "total"]
}
```

#### Listar Templates
```http
GET /api/notifications/templates
```

### Estatísticas

#### Obter Estatísticas
```http
GET /api/notifications/stats/overview
```

### Teste

#### Enviar Notificação de Teste
```http
POST /api/notifications/test
Content-Type: application/json

{
  "email": "test@example.com",
  "type": "welcome"
}
```

## Templates Disponíveis

### Email Templates

- `order_confirmed.hbs` - Confirmação de pedido
- `order_shipped.hbs` - Pedido enviado
- `order_delivered.hbs` - Pedido entregue
- `payment_success.hbs` - Pagamento aprovado
- `payment_failed.hbs` - Pagamento rejeitado
- `welcome.hbs` - Boas-vindas

### SMS Templates

- `order_confirmed_sms.hbs` - Confirmação de pedido (SMS)
- `order_shipped_sms.hbs` - Pedido enviado (SMS)
- `payment_success_sms.hbs` - Pagamento aprovado (SMS)

## Tipos de Notificação

- `order_confirmed` - Pedido confirmado
- `order_shipped` - Pedido enviado
- `order_delivered` - Pedido entregue
- `payment_success` - Pagamento aprovado
- `payment_failed` - Pagamento rejeitado
- `order_cancelled` - Pedido cancelado
- `welcome` - Boas-vindas
- `password_reset` - Redefinição de senha

## Canais de Notificação

- `email` - Notificação por email
- `sms` - Notificação por SMS

## Status das Notificações

- `pending` - Aguardando processamento
- `processing` - Em processamento
- `sent` - Enviada
- `delivered` - Entregue
- `failed` - Falhou
- `cancelled` - Cancelada

## Prioridades

- `low` - Baixa prioridade
- `medium` - Média prioridade
- `high` - Alta prioridade

## Integração com Orders Service

O serviço de notificações pode ser integrado com o orders service através de webhooks ou eventos. Exemplo:

```typescript
// No orders service
import { NotificationService } from '@notifications/service';

await NotificationService.createOrderNotifications({
  userId: 'user123',
  orderId: '12345',
  total: 99.99,
  recipient: {
    email: 'user@example.com',
    name: 'João Silva'
  },
  items: [...],
  shipping: {...}
});
```

## Monitoramento

### Health Check
```http
GET /health
```

### Limpeza de Filas
```bash
npm run queue:clear
```

## Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Compilar TypeScript
npm run start        # Executar em produção
npm run clean        # Limpar arquivos compilados
npm run queue:clear  # Limpar filas Redis
```

### Testes

```bash
# Testar envio de email
curl -X POST http://localhost:3003/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "type": "welcome"}'

# Verificar health
curl http://localhost:3003/health
```

## Docker

### Construir Imagem
```bash
docker build -t notifications-service .
```

### Executar Container
```bash
docker run -p 3003:3003 notifications-service
```

### Docker Compose
```bash
docker-compose up -d
```

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com MongoDB**
   - Verifique se o MongoDB está rodando
   - Confirme a URI de conexão no `.env`

2. **Erro de conexão com Redis**
   - Verifique se o Redis está rodando
   - Confirme a URL do Redis no `.env`

3. **Erro no AWS SES**
   - Verifique as credenciais da AWS
   - Confirme a região configurada
   - Verifique se o email de remetente está verificado

4. **Erro no Twilio**
   - Verifique o Account SID e Auth Token
   - Confirme o número de telefone do Twilio
   - Verifique se o número de destino é válido

### Logs

Os logs são exibidos no console com emojis para facilitar a identificação:

- 🚀 - Inicialização
- ✅ - Sucesso
- ❌ - Erro
- 📧 - Email
- 📱 - SMS
- 📊 - Estatísticas

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.
