#!/usr/bin/env bash

# Script para instalar y ejecutar el Frontend

echo "========================================="
echo "  Gestión Deportiva - Frontend Setup"
echo "========================================="
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org"
    exit 1
fi

echo "✓ Node.js $(node --version) detectado"
echo "✓ npm $(npm --version) detectado"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo ""
echo "✓ Dependencias instaladas correctamente"
echo ""

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "✓ Archivo .env creado"
    echo ""
    echo "⚠️  Edita .env y configura las variables si es necesario"
else
    echo "✓ Archivo .env ya existe"
fi

echo ""
echo "========================================="
echo "  Setup completado!"
echo "========================================="
echo ""
echo "Para iniciar el servidor de desarrollo:"
echo "  npm run dev"
echo ""
echo "Para build de producción:"
echo "  npm run build"
echo ""
