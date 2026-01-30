#!/bin/bash
# =============================================================================
# Скрипт для настройки переменных окружения в Vercel
# =============================================================================

echo "🔧 Настройка переменных окружения для Vercel..."
echo ""

# Проверка наличия Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен"
    echo ""
    echo "Установите его командой:"
    echo "npm install -g vercel"
    echo ""
    echo "Или настройте переменные вручную:"
    echo "1. Откройте: https://vercel.com/dashboard"
    echo "2. Выберите проект TourFurr"
    echo "3. Settings → Environment Variables"
    echo "4. Добавьте: VITE_DISABLE_EMAIL = true"
    echo "5. Save и Redeploy"
    exit 1
fi

echo "✅ Vercel CLI найден"
echo ""

# Добавление переменных окружения
echo "📝 Добавляем VITE_DISABLE_EMAIL..."
vercel env add VITE_DISABLE_EMAIL production <<< "true"

echo ""
echo "✅ Готово!"
echo ""
echo "🚀 Теперь нужно передеплоить проект:"
echo "   vercel --prod"
echo ""
echo "Или через dashboard:"
echo "   https://vercel.com/dashboard → TourFurr → Deployments → Redeploy"
