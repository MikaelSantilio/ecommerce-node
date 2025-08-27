# E-commerce Microservices

Este é um projeto de e-commerce baseado em microserviços com Node.js e TypeScript.

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

## Instalação

### Instalar dependências de todos os serviços

```bash
npm run install:all
```

### Instalar dependências de um serviço específico

```bash
cd packages/[nome-do-servico]
npm install
```

## Desenvolvimento

### Executar um serviço em modo desenvolvimento (recomendado para desenvolvimento)

```bash
# Do diretório raiz
npm run dev:api-gateway
npm run dev:auth
npm run dev:cart
npm run dev:catalog
npm run dev:notifications
npm run dev:orders
npm run dev:payments

# Ou diretamente do diretório do serviço
cd packages/[nome-do-servico]
npm run dev
```

### Executar um serviço em modo produção (com build automático)

```bash
# Do diretório raiz - faz build automaticamente antes de executar
npm run start:api-gateway
npm run start:auth
npm run start:cart
npm run start:catalog
npm run start:notifications
npm run start:orders
npm run start:payments

# Ou manualmente do diretório do serviço
cd packages/[nome-do-servico]
npm run build
npm start
```

## Build

### Build de todos os serviços

```bash
npm run build:all
```

### Build de um serviço específico

```bash
cd packages/[nome-do-servico]
npm run build
```

## Scripts Disponíveis

### Scripts do diretório raiz:

- `npm run install:all` - Instala dependências de todos os serviços
- `npm run dev:[servico]` - Executa um serviço em modo desenvolvimento (com ts-node)
- `npm run start:[servico]` - Faz build e executa um serviço em modo produção
- `npm run build:[servico]` - Faz build de um serviço específico
- `npm run build:all` - Faz build de todos os serviços
- `npm run clean` - Remove todos os node_modules e pastas dist dos serviços

### Scripts de cada serviço:

- `npm run dev` - Executa o serviço em modo desenvolvimento (com ts-node)
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Executa o serviço compilado
- `npm run clean` - Remove a pasta dist do serviço

## Independência dos Serviços

Cada serviço agora possui seu próprio `node_modules`, permitindo:

- Versões independentes de dependências
- Deploys independentes
- Gerenciamento de dependências por serviço
- Melhor isolamento entre serviços

## Próximos Passos

1. Configurar Docker para cada serviço
2. Implementar comunicação entre serviços
3. Adicionar banco de dados para cada serviço
4. Configurar CI/CD pipeline
5. Implementar monitoramento e logs
