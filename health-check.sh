#!/bin/bash

echo "🏥 Verificando saúde dos serviços..."

services=(
    "api-gateway:3000"
    "auth:3001"
    "catalog:3002"
    "cart:3003"
    "orders:3004"
    "payments:3005"
    "notifications:3006"
)

all_healthy=true

for service_port in "${services[@]}"; do
    IFS=':' read -r service port <<< "$service_port"
    
    echo -n "🔍 Verificando $service (porta $port)... "
    
    if curl -s -f "http://localhost:$port/health" > /dev/null; then
        echo "✅ Saudável"
    else
        echo "❌ Não responde"
        all_healthy=false
    fi
done

echo ""
if [ "$all_healthy" = true ]; then
    echo "🎉 Todos os serviços estão saudáveis!"
    exit 0
else
    echo "⚠️  Alguns serviços não estão respondendo."
    exit 1
fi
