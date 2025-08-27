-- Script para criar todos os bancos de dados dos microserviços
-- Este arquivo deve ficar na raiz do projeto como init-databases.sql
-- VERSÃO 4 - Com idempotência completa para todos os bancos

-- Verificar e criar banco para autenticação
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_auth') THEN
        CREATE DATABASE ecommerce_auth;
        RAISE NOTICE 'Database ecommerce_auth created successfully';
    ELSE
        RAISE NOTICE 'Database ecommerce_auth already exists, skipping';
    END IF;
EXCEPTION
    WHEN duplicate_database THEN
        RAISE NOTICE 'Database ecommerce_auth already exists, skipping';
END $$;

-- Verificar e criar banco para catálogo
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_catalog') THEN
        CREATE DATABASE ecommerce_catalog;
        RAISE NOTICE 'Database ecommerce_catalog created successfully';
    ELSE
        RAISE NOTICE 'Database ecommerce_catalog already exists, skipping';
    END IF;
EXCEPTION
    WHEN duplicate_database THEN
        RAISE NOTICE 'Database ecommerce_catalog already exists, skipping';
END $$;

-- Verificar e criar banco para pedidos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_orders') THEN
        CREATE DATABASE ecommerce_orders;
        RAISE NOTICE 'Database ecommerce_orders created successfully';
    ELSE
        RAISE NOTICE 'Database ecommerce_orders already exists, skipping';
    END IF;
EXCEPTION
    WHEN duplicate_database THEN
        RAISE NOTICE 'Database ecommerce_orders already exists, skipping';
END $$;

-- Verificar e criar banco para pagamentos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_payments') THEN
        CREATE DATABASE ecommerce_payments;
        RAISE NOTICE 'Database ecommerce_payments created successfully';
    ELSE
        RAISE NOTICE 'Database ecommerce_payments already exists, skipping';
    END IF;
EXCEPTION
    WHEN duplicate_database THEN
        RAISE NOTICE 'Database ecommerce_payments already exists, skipping';
END $$;

-- Verificar e criar banco para notificações
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_notifications') THEN
        CREATE DATABASE ecommerce_notifications;
        RAISE NOTICE 'Database ecommerce_notifications created successfully';
    ELSE
        RAISE NOTICE 'Database ecommerce_notifications already exists, skipping';
    END IF;
EXCEPTION
    WHEN duplicate_database THEN
        RAISE NOTICE 'Database ecommerce_notifications already exists, skipping';
END $$;

-- Conceder privilégios (estas queries são sempre seguras de executar)
DO $$
BEGIN
    -- Privilégios para ecommerce_auth
    IF EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_auth') THEN
        EXECUTE 'GRANT ALL PRIVILEGES ON DATABASE ecommerce_auth TO ' || quote_ident(current_user);
    END IF;
    
    -- Privilégios para ecommerce_catalog
    IF EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_catalog') THEN
        EXECUTE 'GRANT ALL PRIVILEGES ON DATABASE ecommerce_catalog TO ' || quote_ident(current_user);
    END IF;
    
    -- Privilégios para ecommerce_orders
    IF EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_orders') THEN
        EXECUTE 'GRANT ALL PRIVILEGES ON DATABASE ecommerce_orders TO ' || quote_ident(current_user);
    END IF;
    
    -- Privilégios para ecommerce_payments
    IF EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_payments') THEN
        EXECUTE 'GRANT ALL PRIVILEGES ON DATABASE ecommerce_payments TO ' || quote_ident(current_user);
    END IF;
    
    -- Privilégios para ecommerce_notifications
    IF EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_notifications') THEN
        EXECUTE 'GRANT ALL PRIVILEGES ON DATABASE ecommerce_notifications TO ' || quote_ident(current_user);
    END IF;
END $$;

-- Listar bancos criados
SELECT datname as "Bancos Ecommerce Criados" 
FROM pg_database 
WHERE datname LIKE 'ecommerce_%' 
ORDER BY datname;