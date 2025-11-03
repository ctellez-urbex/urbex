/**
 * MarketCharts Component
 * Displays market analysis charts using Chart.js
 */

import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';
import Script from 'next/script';

interface MarketChartsProps {
  data: {
    data_transacciones?: any;
    data_prediales?: any;
    data_polygon_radio?: any;
  };
}

// Helper to safely get nested values
const getNestedValue = (obj: any, path: string, defaultValue: any = null): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? defaultValue;
};

export default function MarketCharts({ data }: MarketChartsProps) {
  const chartsInitialized = useRef(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const data_transacciones = data?.data_transacciones || {};
  const data_prediales = data?.data_prediales || {};
  const data_polygon_radio = data?.data_polygon_radio || {};

  useEffect(() => {
    if (chartsInitialized.current || typeof window === 'undefined') return;
    
    // Listen for Chart.js load event
    const handleChartJsLoad = () => {
      console.log('📊 Chart.js loaded event received for MarketCharts');
      setTimeout(initCharts, 100);
    };
    
    window.addEventListener('chartJsLoaded', handleChartJsLoad);
    
    const initCharts = () => {
      // Check if Chart.js is loaded
      if (!(window as any).Chart) {
        console.warn('⏳ Chart.js not loaded yet for MarketCharts, retrying...');
        setTimeout(initCharts, 500);
        return;
      }

      try {
        const Chart = (window as any).Chart;
        console.log('📊 Initializing MarketCharts...');

        // Initialize Transactions Chart
        const transaccionesData = getNestedValue(data_transacciones, 'annualData.priceByYear', []);
        const countData = getNestedValue(data_transacciones, 'annualData.countByYear', []);
        
        if (transaccionesData.length > 0 && countData.length > 0) {
          console.log('🔷 Attempting to initialize TransChartEstudioMercado...');
          const ctx1 = document.getElementById('TransChartEstudioMercado') as HTMLCanvasElement;
          console.log('🔷 TransChartEstudioMercado canvas element:', ctx1 ? 'Found ✅' : 'Not Found ❌');
          if (ctx1) {
            // Destroy existing chart if it exists
            const existingChart = Chart.getChart(ctx1);
            if (existingChart) {
              console.log('🗑️ Destroying existing TransChartEstudioMercado');
              existingChart.destroy();
            }

            // Merge data by year
            const mergedData = transaccionesData.map((item: any) => {
              const countItem = countData.find((c: any) => c.year === item.year);
              return {
                year: item.year,
                valor1: item.valor_mt2 || 0,
                valor2: countItem?.count || 0
              };
            });

            new Chart(ctx1, {
              type: 'bar',
              data: {
                labels: mergedData.map((d: any) => d.year),
                datasets: [{
                  label: 'Valor de las transacciones m²',
                  data: mergedData.map((d: any) => d.valor1),
                  yAxisID: 'A',
                  backgroundColor: 'rgba(0, 123, 255, 0.8)',
                  borderColor: 'rgba(0, 123, 255, 1)',
                  borderWidth: 1
                }, {
                  label: 'Número de transacciones',
                  data: mergedData.map((d: any) => d.valor2),
                  yAxisID: 'B',
                  backgroundColor: 'rgba(153, 102, 255, 0.8)',
                  borderColor: 'rgba(153, 102, 255, 1)',
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'bottom',
                    align: 'center',
                    labels: {
                      boxWidth: 20,
                      padding: 15,
                    }
                  },
                  title: {
                    display: true,
                    text: 'Gráfico de Transacciones y Valores por Año',
                    position: 'top',
                    align: 'start',
                    font: { size: 16 }
                  }
                },
                scales: {
                  A: {
                    type: 'linear',
                    position: 'left',
                    grid: { display: false },
                    title: { display: false },
                    ticks: {
                      callback: function(value: any) {
                        return Math.round(value).toLocaleString();
                      }
                    }
                  },
                  B: {
                    type: 'linear',
                    position: 'right',
                    grid: { display: false },
                    title: { display: false },
                    ticks: {
                      callback: function(value: any) {
                        return Math.round(value).toLocaleString();
                      }
                    }
                  },
                  x: {
                    grid: { display: false },
                    title: { display: false }
                  }
                }
              }
            });
            console.log('✅ TransChartEstudioMercado initialized successfully');
          } else {
            console.error('❌ TransChartEstudioMercado canvas not found in DOM');
          }
        } else {
          console.log('⚠️ No transacciones data for TransChartEstudioMercado');
        }

        // Initialize Predial Chart
        const avaluoData = getNestedValue(data_prediales, 'avaluoMt2Historico', []);
        const predialData = getNestedValue(data_prediales, 'predialMt2Historico', []);
        
        if (avaluoData.length > 0 && predialData.length > 0) {
          console.log('🔷 Attempting to initialize PredialChartEstudioMercado...');
          const ctx2 = document.getElementById('PredialChartEstudioMercado') as HTMLCanvasElement;
          console.log('🔷 PredialChartEstudioMercado canvas element:', ctx2 ? 'Found ✅' : 'Not Found ❌');
          if (ctx2) {
            // Destroy existing chart if it exists
            const existingChart = Chart.getChart(ctx2);
            if (existingChart) {
              console.log('🗑️ Destroying existing PredialChartEstudioMercado');
              existingChart.destroy();
            }

            // Merge data by year and filter recent years
            const mergedData = avaluoData.map((item: any) => {
              const predialItem = predialData.find((p: any) => p.year === item.year);
              return {
                year: item.year,
                valor1: item.valorMt2 || 0,
                valor2: predialItem?.valorMt2 || 0
              };
            }).filter((d: any) => d.year > 2020);

            new Chart(ctx2, {
              type: 'bar',
              data: {
                labels: mergedData.map((d: any) => d.year),
                datasets: [{
                  label: 'Avalúo Catastral m²',
                  data: mergedData.map((d: any) => d.valor1),
                  yAxisID: 'A',
                  backgroundColor: 'rgba(0, 123, 255, 0.8)',
                  borderColor: 'rgba(0, 123, 255, 1)',
                  borderWidth: 1
                }, {
                  label: 'Impuesto Predial m²',
                  data: mergedData.map((d: any) => d.valor2),
                  yAxisID: 'B',
                  backgroundColor: 'rgba(153, 102, 255, 0.8)',
                  borderColor: 'rgba(153, 102, 255, 1)',
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'bottom',
                    align: 'center',
                    labels: {
                      boxWidth: 20,
                      padding: 15,
                    }
                  },
                  title: {
                    display: true,
                    text: 'Gráfico de Avalúos e Impuestos por Año',
                    position: 'top',
                    align: 'start',
                    font: { size: 16 }
                  }
                },
                scales: {
                  A: {
                    type: 'linear',
                    position: 'left',
                    grid: { display: false },
                    title: { display: false },
                    ticks: {
                      callback: function(value: any) {
                        return Math.round(value).toLocaleString();
                      }
                    }
                  },
                  B: {
                    type: 'linear',
                    position: 'right',
                    grid: { display: false },
                    title: { display: false },
                    ticks: {
                      callback: function(value: any) {
                        return Math.round(value).toLocaleString();
                      }
                    }
                  },
                  x: {
                    grid: { display: false },
                    title: { display: false }
                  }
                }
              }
            });
            console.log('✅ PredialChartEstudioMercado initialized successfully');
          } else {
            console.error('❌ PredialChartEstudioMercado canvas not found in DOM');
          }
        } else {
          console.log('⚠️ No predial data for PredialChartEstudioMercado');
        }

        // Initialize Box Plot Charts
        const areaStats = getNestedValue(data_polygon_radio, 'estadisticasAreaConstruida');
        const antiguedadStats = getNestedValue(data_polygon_radio, 'estadisticasAnoConstruccion');

        // Box Area Chart
        if (areaStats && typeof areaStats === 'object') {
          console.log('🔷 Attempting to initialize BoxArea...');
          const ctx3 = document.getElementById('BoxArea') as HTMLCanvasElement;
          console.log('🔷 BoxArea canvas element:', ctx3 ? 'Found ✅' : 'Not Found ❌');
          if (ctx3) {
            // Destroy existing chart if it exists
            const existingChart = Chart.getChart(ctx3);
            if (existingChart) {
              console.log('🗑️ Destroying existing BoxArea');
              existingChart.destroy();
            }

            new Chart(ctx3, {
              type: 'boxplot',
              data: {
                labels: ['Área Construida (m²)'],
                datasets: [{
                  label: 'Área Construida (m²)',
                  data: [{
                    min: areaStats.min || 0,
                    q1: areaStats.q1 || 0,
                    median: areaStats.median || 0,
                    mean: areaStats.mean || 0,
                    q3: areaStats.q3 || 0,
                    max: areaStats.max || 0,
                  }],
                  backgroundColor: '#4A148C',
                  borderColor: '#4A148C',
                  borderWidth: 1
                }]
              },
              options: {
                plugins: {
                  legend: { display: false },
                  title: {
                    display: true,
                    text: 'Área Construida (m²)',
                    font: { size: 16, weight: 'bold' },
                    padding: 20
                  }
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: false,
                    min: areaStats.min || 0,
                    max: areaStats.max || 0,
                    grid: { display: false },
                    ticks: { precision: 0 }
                  },
                  x: { grid: { display: false } }
                }
              }
            });
            console.log('✅ BoxArea initialized successfully');
          } else {
            console.error('❌ BoxArea canvas not found in DOM');
          }
        } else {
          console.log('⚠️ No area stats for BoxArea');
        }

        // Box Antiguedad Chart
        if (antiguedadStats && typeof antiguedadStats === 'object') {
          console.log('🔷 Attempting to initialize BoxAntiguedad...');
          const ctx4 = document.getElementById('BoxAntiguedad') as HTMLCanvasElement;
          console.log('🔷 BoxAntiguedad canvas element:', ctx4 ? 'Found ✅' : 'Not Found ❌');
          if (ctx4) {
            // Destroy existing chart if it exists
            const existingChart = Chart.getChart(ctx4);
            if (existingChart) {
              console.log('🗑️ Destroying existing BoxAntiguedad');
              existingChart.destroy();
            }

            new Chart(ctx4, {
              type: 'boxplot',
              data: {
                labels: ['Año de Construcción'],
                datasets: [{
                  label: 'Año de Construcción',
                  data: [{
                    min: antiguedadStats.min || 1900,
                    q1: antiguedadStats.q1 || 1900,
                    median: antiguedadStats.median || 2000,
                    mean: antiguedadStats.mean || 2000,
                    q3: antiguedadStats.q3 || 2020,
                    max: Math.min(antiguedadStats.max || 2025, new Date().getFullYear()),
                  }],
                  backgroundColor: '#7B1FA2',
                  borderColor: '#7B1FA2',
                  borderWidth: 1
                }]
              },
              options: {
                plugins: {
                  legend: { display: false },
                  title: {
                    display: true,
                    text: 'Año de Construcción',
                    font: { size: 16, weight: 'bold' },
                    padding: 20
                  }
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: false,
                    min: antiguedadStats.min || 1900,
                    max: Math.min(antiguedadStats.max || 2025, new Date().getFullYear()),
                    grid: { display: false },
                    ticks: { precision: 0 }
                  },
                  x: { grid: { display: false } }
                }
              }
            });
            console.log('✅ BoxAntiguedad initialized successfully');
          } else {
            console.error('❌ BoxAntiguedad canvas not found in DOM');
          }
        } else {
          console.log('⚠️ No antiguedad stats for BoxAntiguedad');
        }

        chartsInitialized.current = true;
        setIsLoading(false);
        console.log('🎉 All MarketCharts initialization process completed');
      } catch (error) {
        console.error('❌ Error initializing MarketCharts:', error);
        setIsLoading(false);
      }
    };

    // Try to initialize after a delay
    const timer = setTimeout(initCharts, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('chartJsLoaded', handleChartJsLoad);
      
      // Cleanup all charts when component unmounts
      if (typeof window !== 'undefined' && (window as any).Chart) {
        const Chart = (window as any).Chart;
        const chartIds = ['TransChartEstudioMercado', 'PredialChartEstudioMercado', 'BoxArea', 'BoxAntiguedad'];
        chartIds.forEach(id => {
          const canvas = document.getElementById(id);
          if (canvas) {
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
              console.log(`🗑️ Cleaning up chart: ${id}`);
              existingChart.destroy();
            }
          }
        });
      }
    };
  }, [data_transacciones, data_prediales, data_polygon_radio]);

  const hasData = data_transacciones || data_prediales || data_polygon_radio;

  if (!hasData) return null;

  return (
    <>
      {/* Load Chart.js via CDN lazily when needed */}
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('📊 Chart.js loaded successfully for MarketCharts');
          // Trigger chart initialization after script loads
          setTimeout(() => {
            const event = new CustomEvent('chartJsLoaded');
            window.dispatchEvent(event);
          }, 100);
        }}
      />

      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Análisis de Mercado
          </h3>
          {isLoading && (
            <span className="text-sm text-gray-500 animate-pulse">
              Cargando gráficas...
            </span>
          )}
        </div>

        {/* Transactions Chart */}
        <Card className="shadow-md">
          <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Transacciones por Año
              </h3>
            </div>
          </div>
          <div className="p-6">
            <div className="w-full h-[350px]">
              <canvas id="TransChartEstudioMercado"></canvas>
            </div>
          </div>
        </Card>

        {/* Predial Chart */}
        <Card className="shadow-md">
          <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Avalúos e Impuestos por Año
              </h3>
            </div>
          </div>
          <div className="p-6">
            <div className="w-full h-[350px]">
              <canvas id="PredialChartEstudioMercado"></canvas>
            </div>
          </div>
        </Card>

        {/* Box Plot Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Área Construida
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="w-full h-[250px]">
                <canvas id="BoxArea"></canvas>
              </div>
            </div>
          </Card>

          <Card className="shadow-md">
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Año de Construcción
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="w-full h-[250px]">
                <canvas id="BoxAntiguedad"></canvas>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
