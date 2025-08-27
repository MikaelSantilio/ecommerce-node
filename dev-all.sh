#!/bin/bash

# Script para executar todos os serviços em modo desenvolvimento
# Usa tmux para criar múltiplas janelas

echo "🚀 Iniciando todos os serviços em modo desenvolvimento..."

# Verifica se tmux está instalado
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux não está instalado. Por favor, instale tmux para usar este script."
    echo "   Ubuntu/Debian: sudo apt install tmux"
    echo "   MacOS: brew install tmux"
    exit 1
fi

# Criar nova sessão tmux
tmux new-session -d -s ecommerce-dev

# Criar janelas para cada serviço
tmux new-window -n api-gateway 'cd packages/api-gateway && npm run dev'
tmux new-window -n auth 'cd packages/auth && npm run dev'
tmux new-window -n cart 'cd packages/cart && npm run dev'
tmux new-window -n catalog 'cd packages/catalog && npm run dev'
tmux new-window -n notifications 'cd packages/notifications && npm run dev'
tmux new-window -n orders 'cd packages/orders && npm run dev'
tmux new-window -n payments 'cd packages/payments && npm run dev'

# Anexar à sessão
tmux attach-session -t ecommerce-dev

echo "🎉 Todos os serviços foram iniciados!"
echo "💡 Use Ctrl+B seguido de 'n' para navegar entre os serviços"
echo "💡 Use Ctrl+B seguido de 'd' para desanexar da sessão"
echo "💡 Para parar todos os serviços: tmux kill-session -t ecommerce-dev"
