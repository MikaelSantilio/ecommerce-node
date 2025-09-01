# E-commerce Microservices

Projeto de e-commerce completo com arquitetura de microsserviços monorepo, incluindo autenticação, catálogo, carrinho, pedidos, pagamentos e notificações.

Tecnologias:
- Node.js, Express e TypeScript para APIs de todos os microsserviços
- PostgreSQL para persistência de dados nos serviços de autenticação, catálogo, pedidos e pagamentos
- MongoDB para os serviços de carrinho e notificações
- Redis para filas e cache, AWS SES para envio de e-mails e Twilio SMS para notificações por SMS
- Docker Compose para orquestração dos microsserviços

## Estrutura do Projeto

```
ecommerce-node/
├── packages/
│   ├── api-gateway/     # Gateway API principal
│   ├── auth/            # Serviço de autenticação
│   ├── cart/            # Serviço de carrinho
│   ├── catalog/         # Serviço de catálogo de produtos
│   ├── notifications/   # Serviço de notificações
│   ├── orders/          # Serviço de pedidos
│   └── payments/        # Serviço de pagamentos
└── package.json         # Scripts para gerenciar todos os serviços
```

## Independência dos Serviços

Cada serviço possui seu próprio `node_modules`, permitindo:

- Versões independentes de dependências
- Deploys independentes
- Gerenciamento de dependências por serviço
- Melhor isolamento entre serviços

## Docker / Containerização

### Executar em modo desenvolvimento com Docker

```bash
# Subir todos os serviços
docker-compose -f docker-compose.dev.yml up -d
# Subir um serviço especifico
 docker-compose -f docker-compose.dev.yml up -d catalog
```

Todos os serviços possuem endpoint `/health` para verificação de status.
