'use client'

import { formatDate, formatDateOnly, formatDateTime, formatRelativeTime } from '@/lib/utils'

export default function TestDatePage() {
  const testDate = '2025-02-04T19:26:54.411000+00:00'
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Test de Formateo de Fechas
          </h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Fecha Original (ISO)
              </h2>
              <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm">
                {testDate}
              </code>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Solo Fecha
                </h3>
                <p className="text-blue-800 dark:text-blue-200">
                  {formatDateOnly(testDate)}
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Fecha y Hora
                </h3>
                <p className="text-green-800 dark:text-green-200">
                  {formatDateTime(testDate)}
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                  Formato Personalizado
                </h3>
                <p className="text-purple-800 dark:text-purple-200">
                  {formatDate(testDate, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Tiempo Relativo
                </h3>
                <p className="text-orange-800 dark:text-orange-200">
                  {formatRelativeTime(testDate)}
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Funciones Disponibles
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li><code>formatDateOnly(isoString)</code> - Solo fecha (ej: "4 de febrero de 2025")</li>
                <li><code>formatDateTime(isoString)</code> - Fecha y hora (ej: "4 de febrero de 2025, 19:26:54")</li>
                <li><code>formatDate(isoString, options)</code> - Formato personalizado con opciones de Intl.DateTimeFormatOptions</li>
                <li><code>formatRelativeTime(isoString)</code> - Tiempo relativo (ej: "En el futuro")</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 