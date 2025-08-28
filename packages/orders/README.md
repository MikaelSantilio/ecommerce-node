# Orders Service

Serviço responsável pelo gerenciamento de pedidos no e-commerce.

## Funcionalidades

- ✅ Criação de pedidos
- ✅ Consulta de pedidos por ID
- ✅ Listagem de pedidos por usuário
- ✅ Atualização de status de pedidos
- ✅ Cancelamento de pedidos
- ✅ Processamento de pagamentos
- ✅ Integração com catálogo de produtos
- ✅ Integração com serviço de pagamentos
- ✅ Integração com serviço de notificações

## Tecnologias

- **Node.js** com **TypeScript**
- **Express.js** para API REST
- **Prisma ORM** com **PostgreSQL**
- **Zod** para validação
- **Docker** para containerização

## Estrutura do Projeto

```
packages/orders/
├── src/
│   ├── controllers/     # Controladores da API
│   ├── services/        # Lógica de negócio
│   ├── repositories/    # Acesso aos dados
│   ├── types/          # Definições de tipos
│   ├── middleware/     # Middlewares customizados
│   └── routes/         # Definição das rotas
├── prisma/
│   └── schema.prisma   # Schema do banco de dados
├── Dockerfile.dev      # Docker para desenvolvimento
├── package.json        # Dependências
└── index.ts           # Ponto de entrada da aplicação
```

## API Endpoints

### Pedidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/orders` | Criar novo pedido |
| GET | `/api/orders/:id` | Buscar pedido por ID |
| GET | `/api/orders/user/:userId` | Listar pedidos do usuário |
| PATCH | `/api/orders/:id/status` | Atualizar status do pedido |
| POST | `/api/orders/:id/cancel` | Cancelar pedido |
| POST | `/api/orders/:id/payment` | Processar pagamento |

### Parâmetros de Consulta

- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `status`: Filtrar por status
- `userId`: Filtrar por usuário

## Status dos Pedidos

- `PENDING`: Aguardando confirmação
- `CONFIRMED`: Confirmado
- `PROCESSING`: Em processamento
- `SHIPPED`: Enviado
- `DELIVERED`: Entregue
- `CANCELLED`: Cancelado
- `REFUNDED`: Reembolsado

## Como Executar

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Configurar banco de dados
cp .env.example .env
# Editar .env com suas configurações

# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Iniciar em modo desenvolvimento
npm run dev
```

### Docker

```bash
# Construir imagem
docker build -f Dockerfile.dev -t orders-service .

# Executar container
docker run -p 3004:3004 orders-service
```

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão PostgreSQL | - |
| `NODE_ENV` | Ambiente de execução | development |
| `PORT` | Porta do servidor | 3004 |
| `CATALOG_SERVICE_URL` | URL do serviço de catálogo | - |
| `PAYMENTS_SERVICE_URL` | URL do serviço de pagamentos | - |
| `NOTIFICATIONS_SERVICE_URL` | URL do serviço de notificações | - |

## Integrações

### Serviço de Catálogo
- Validação de produtos
- Verificação de estoque
- Obtenção de preços atualizados

### Serviço de Pagamentos
- Processamento de pagamentos
- Confirmação de transações
- Reembolsos

### Serviço de Notificações
- Notificações de status
- Confirmações de pedido
- Alertas de entrega

## Desenvolvimento Futuro

- [ ] Implementar sistema de eventos assíncronos
- [ ] Adicionar cache Redis
- [ ] Implementar rate limiting
- [ ] Adicionar métricas e monitoramento
- [ ] Criar testes automatizados
- [ ] Implementar API de administração
- [ ] Adicionar logs estruturados
- [ ] Implementar sistema de cupons/descontos
