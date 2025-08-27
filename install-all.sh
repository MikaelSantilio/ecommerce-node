#!/bin/bash

# Script para instalar dependências em todos os serviços

echo "🚀 Instalando dependências em todos os serviços..."

services=("api-gateway" "auth" "cart" "catalog" "notifications" "orders" "payments")

for service in "${services[@]}"; do
    echo "📦 Instalando dependências para $service..."
    cd "packages/$service"
    npm install
    cd "../.."
    echo "✅ $service concluído"
done

echo "🎉 Todas as dependências foram instaladas com sucesso!"
