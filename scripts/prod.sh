#!/bin/bash

# Script para produção
echo "🚀 Iniciando Organizando Tudo API em modo produção..."

# Verifica se o .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "📝 Crie o arquivo .env baseado no env.example"
    exit 1
fi

# Para containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Constrói e inicia os containers
echo "🔨 Construindo e iniciando containers..."
docker-compose up --build -d

# Mostra status dos containers
echo "📊 Status dos containers:"
docker-compose ps

echo "✅ Aplicação iniciada com sucesso!"
echo "🌐 API: http://localhost:3000"
echo "📚 Docs: http://localhost:3000/api/docs"
echo "🗄️  MongoDB: localhost:27017"
echo "🔧 Mongo Express: http://localhost:8081"
