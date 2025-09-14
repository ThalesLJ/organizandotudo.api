#!/bin/bash

# Script para desenvolvimento local
echo "🚀 Iniciando Organizando Tudo API em modo desenvolvimento..."

# Verifica se o .env existe
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env a partir do env.example..."
    cp env.example .env
    echo "⚠️  Configure as variáveis de ambiente no arquivo .env"
fi

# Instala dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Inicia o MongoDB com Docker
echo "🗄️  Iniciando MongoDB..."
docker run -d -p 27017:27017 --name mongodb-dev mongo:7.0 || echo "MongoDB já está rodando"

# Aguarda o MongoDB inicializar
echo "⏳ Aguardando MongoDB inicializar..."
sleep 5

# Inicia a aplicação
echo "🎯 Iniciando aplicação NestJS..."
npm run start:dev
