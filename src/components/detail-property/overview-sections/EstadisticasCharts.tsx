/**
 * EstadisticasCharts Component
 * Displays statistical charts using Chart.js
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import Script from 'next/script';

interface ChartData {
  year: number;
  label: string;
  valor: number;
}

interface EstadisticasChartsProps {
  transaccionesData?: ChartData[];
  avaluoData?: ChartData[];
  predialData?: ChartData[];
  listingsData?: ChartData[];
  transaccionesStats?: {
    min?: number;
    q1?: number;
    median?: number;
    mean?: number;
    q3?: number;
    max?: number;
  };
  tipologiaData?: Array<{
    usosuelo: string;
    preaconst_precusoprop: number;
  }>;
  areaStats?: {
    min?: number;
    q1?: number;
    median?: number;
    mean?: number;
    q3?: number;
    max?: number;
  };
}

export default function EstadisticasCharts({
  transaccionesData,
  avaluoData,
  predialData,
  listingsData,
  transaccionesStats,
  tipologiaData,
  areaStats,
}: EstadisticasChartsProps) {
  const chartsInitialized = useRef(false);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    if (chartsInitialized.current || typeof window === 'undefined') return;
    
    // Listen for Chart.js load event
    const handleChartJsLoad = () => {
      console.log('📊 Chart.js loaded event received');
      setTimeout(initCharts, 100);
    };
    
    window.addEventListener('chartJsLoaded', handleChartJsLoad);
    
    const initCharts = () => {
      // Check if Chart.js and Data Labels plugin are loaded
      if (!(window as any).Chart || !(window as any).ChartDataLabels) {
        console.warn('⏳ Chart.js or Data Labels plugin not loaded yet, retrying...');
        setTimeout(initCharts, 500);
        return;
      }

      try {
        const Chart = (window as any).Chart;
        const ChartDataLabels = (window as any).ChartDataLabels;
        
        // Register the Data Labels plugin
        Chart.register(ChartDataLabels);
        console.log('✅ Chart.js Data Labels plugin registered');
        
        console.log('📊 Initializing charts...');
        console.log('📊 Data received:', {
          transaccionesData: transaccionesData?.length || 0,
          avaluoData: avaluoData?.length || 0,
          predialData: predialData?.length || 0,
          listingsData: listingsData?.length || 0,
          tipologiaData: tipologiaData?.length || 0,
          hasTransaccionesStats: !!transaccionesStats,
          hasAreaStats: !!areaStats
        });
        
        // Initialize Multi-axis Bar Chart
        if (transaccionesData || avaluoData || predialData || listingsData) {
          console.log('🔷 Attempting to initialize ChartBarras...');
          const ctx1 = document.getElementById('ChartBarras') as HTMLCanvasElement;
          console.log('🔷 ChartBarras canvas element:', ctx1 ? 'Found ✅' : 'Not Found ❌');
          if (ctx1) {
            // Destroy existing chart if it exists
            const existingChart = Chart.getChart(ctx1);
            if (existingChart) {
              console.log('🗑️ Destroying existing ChartBarras');
              existingChart.destroy();
            }
            const allData: ChartData[] = [
              ...(transaccionesData || []),
              ...(avaluoData || []),
              ...(predialData || []),
              ...(listingsData || [])
            ];

            const years = allData
              .map(d => d.year)
              .filter((year, index, self) => self.indexOf(year) === index)
              .sort();
            const labels = allData
              .map(d => d.label)
              .filter((label, index, self) => self.indexOf(label) === index);

            const datasets = labels.map((label, index) => {
              const data = years.map(year => {
                const item = allData.find(d => d.year === year && d.label === label);
                return item ? item.valor : 0;
              });

              const colors = [
                'rgba(0, 32, 96, 0.8)',
                'rgba(0, 51, 153, 0.8)',
                'rgba(0, 70, 171, 0.8)',
                'rgba(0, 90, 189, 0.8)',
                'rgba(0, 109, 207, 0.8)',
                'rgba(0, 128, 225, 0.8)'
              ];

              return {
                label,
                data,
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length].replace('0.8', '1'),
                borderWidth: 1
              };
            });

            new Chart(ctx1, {
              type: 'bar',
              data: { labels: years, datasets },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { boxWidth: 20, padding: 15 }
                  },
                  title: {
                    display: true,
                    text: 'Indicadores por Año',
                    font: { size: 16, weight: 'bold' }
                  },
                  subtitle: {
                    display: true,
                    text: 'Permite visualizar mejor valores de diferentes magnitudes',
                    font: { size: 11, style: 'italic' },
                    color: '#666'
                  },
                  datalabels: {
                    display: true,
                    color: '#000',
                    anchor: 'end',
                    align: 'top',
                    font: {
                      size: 10,
                      weight: 'bold'
                    },
                    formatter: function(value: any) {
                      if (value === 0) return '';
                      if (value >= 1000000) return (value/1000000).toFixed(1) + 'M';
                      if (value >= 1000) return (value/1000).toFixed(0) + 'K';
                      return value.toFixed(0);
                    }
                  }
                },
                scales: {
                  y: {
                    type: 'logarithmic',
                    beginAtZero: false,
                    min: 1000, // Minimum value to avoid log(0)
                    ticks: {
                      callback: function(value: any) {
                        // Only show major ticks for cleaner axis
                        const logValue = Math.log10(value);
                        if (Math.abs(logValue - Math.round(logValue)) < 0.01) {
                          if (value >= 1000000) return (value/1000000).toFixed(0) + 'M';
                          if (value >= 1000) return (value/1000).toFixed(0) + 'K';
                          return value;
                        }
                        return '';
                      }
                    },
                    grid: {
                      display: true,
                      drawBorder: true,
                      color: 'rgba(0, 0, 0, 0.1)'
                    }
                  }
                }
              }
            });
            console.log('✅ ChartBarras initialized successfully');
          } else {
            console.error('❌ ChartBarras canvas not found in DOM');
          }
        } else {
          console.log('⚠️ No data for ChartBarras');
        }

        // Initialize Tipología Pie Chart
        if (tipologiaData && tipologiaData.length > 0) {
          console.log('🔷 Attempting to initialize byProporcion...');
          const ctx2 = document.getElementById('byProporcion') as HTMLCanvasElement;
          console.log('🔷 byProporcion canvas element:', ctx2 ? 'Found ✅' : 'Not Found ❌');
          if (ctx2) {
            // Destroy existing chart if it exists
            const existingChart = Chart.getChart(ctx2);
            if (existingChart) {
              console.log('🗑️ Destroying existing byProporcion');
              existingChart.destroy();
            }
            const sortedData = [...tipologiaData].sort((a, b) => 
              b.preaconst_precusoprop - a.preaconst_precusoprop
            );

            const colors = [
              '#4A148C', '#7B1FA2', '#9C27B0', '#BA68C8', '#E1BEE7',
              '#006837', '#66BD63', '#D9EF8B', '#00ACC1', '#4DD0E1', '#B2EBF2'
            ];

            new Chart(ctx2, {
              type: 'pie',
              data: {
                labels: sortedData.map(d => d.usosuelo),
                datasets: [{
                  data: sortedData.map(d => d.preaconst_precusoprop),
                  backgroundColor: colors.slice(0, sortedData.length),
                  borderColor: 'white',
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                  title: {
                    display: true,
                    text: 'Tipos de Uso',
                    font: { size: 16, weight: 'bold' }
                  }
                }
              }
            });
            console.log('✅ byProporcion initialized successfully');
          } else {
            console.error('❌ byProporcion canvas not found in DOM');
          }
        } else {
          console.log('⚠️ No tipologia data for byProporcion');
        }

        // Initialize BoxTransacciones (Transactions Stats)
        if (transaccionesStats && transaccionesStats.median != null) {
          console.log('🔷 Attempting to initialize BoxTransacciones...');
          const ctx3 = document.getElementById('BoxTransacciones') as HTMLCanvasElement;
          console.log('🔷 BoxTransacciones canvas element:', ctx3 ? 'Found ✅' : 'Not Found ❌');
          if (ctx3) {
            // Destroy existing chart if it exists
            const existingChart = Chart.getChart(ctx3);
            if (existingChart) {
              console.log('🗑️ Destroying existing BoxTransacciones');
              existingChart.destroy();
            }
            const { q1, q3, median, mean, min, max } = transaccionesStats;
            const iqr = (q3 || 0) - (q1 || 0);
            const y_min = Math.max(0, (q1 || 0) - 1.5 * iqr);
            const y_max = (q3 || 0) + 1.5 * iqr;

            new Chart(ctx3, {
              type: 'bar',
              data: {
                labels: ['Transacciones'],
                datasets: [{
                  label: 'Min',
                  data: [min || y_min],
                  backgroundColor: 'rgba(74, 20, 140, 0.3)',
                  borderColor: '#4A148C',
                  borderWidth: 2
                }, {
                  label: 'Q1',
                  data: [q1],
                  backgroundColor: 'rgba(156, 39, 176, 0.5)',
                  borderColor: '#9C27B0',
                  borderWidth: 2
                }, {
                  label: 'Mediana',
                  data: [median],
                  backgroundColor: 'rgba(186, 104, 200, 0.7)',
                  borderColor: '#BA68C8',
                  borderWidth: 2
                }, {
                  label: 'Q3',
                  data: [q3],
                  backgroundColor: 'rgba(156, 39, 176, 0.5)',
                  borderColor: '#9C27B0',
                  borderWidth: 2
                }, {
                  label: 'Max',
                  data: [max || y_max],
                  backgroundColor: 'rgba(74, 20, 140, 0.3)',
                  borderColor: '#4A148C',
                  borderWidth: 2
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 15 } },
                  title: {
                    display: true,
                    text: 'Estadísticas de Transacciones',
                    font: { size: 16, weight: 'bold' }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    min: y_min,
                    max: y_max,
                    ticks: { 
                      callback: function(value: any) {
                        if (value >= 1000000) return (value/1000000).toFixed(1) + 'M';
                        if (value >= 1000) return (value/1000).toFixed(1) + 'K';
                        return value;
                      }
                    }
                  }
                }
              }
            });
            console.log('✅ BoxTransacciones initialized successfully');
          } else {
            console.error('❌ BoxTransacciones canvas not found in DOM');
          }
        } else {
          console.log('⚠️ No transacciones stats for BoxTransacciones');
        }

        // Initialize BoxArea (Area Stats)
        if (areaStats && areaStats.median != null) {
          console.log('🔷 Attempting to initialize BoxArea...');
          const ctx4 = document.getElementById('BoxArea') as HTMLCanvasElement;
          console.log('🔷 BoxArea canvas element:', ctx4 ? 'Found ✅' : 'Not Found ❌');
          if (ctx4) {
            // Destroy existing chart if it exists
            const existingChart = Chart.getChart(ctx4);
            if (existingChart) {
              console.log('🗑️ Destroying existing BoxArea');
              existingChart.destroy();
            }
            const { q1, q3, median, mean, min, max } = areaStats;
            const iqr = (q3 || 0) - (q1 || 0);
            const y_min = Math.max(0, (q1 || 0) - 1.5 * iqr);
            const y_max = (q3 || 0) + 1.5 * iqr;

            new Chart(ctx4, {
              type: 'bar',
              data: {
                labels: ['Área Construida'],
                datasets: [{
                  label: 'Min',
                  data: [min || y_min],
                  backgroundColor: 'rgba(0, 104, 55, 0.3)',
                  borderColor: '#006837',
                  borderWidth: 2
                }, {
                  label: 'Q1',
                  data: [q1],
                  backgroundColor: 'rgba(102, 189, 99, 0.5)',
                  borderColor: '#66BD63',
                  borderWidth: 2
                }, {
                  label: 'Mediana',
                  data: [median],
                  backgroundColor: 'rgba(217, 239, 139, 0.7)',
                  borderColor: '#D9EF8B',
                  borderWidth: 2
                }, {
                  label: 'Q3',
                  data: [q3],
                  backgroundColor: 'rgba(102, 189, 99, 0.5)',
                  borderColor: '#66BD63',
                  borderWidth: 2
                }, {
                  label: 'Max',
                  data: [max || y_max],
                  backgroundColor: 'rgba(0, 104, 55, 0.3)',
                  borderColor: '#006837',
                  borderWidth: 2
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 15 } },
                  title: {
                    display: true,
                    text: 'Estadísticas de Área Construida',
                    font: { size: 16, weight: 'bold' }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    min: y_min,
                    max: y_max,
                    ticks: {
                      callback: function(value: any) {
                        return value.toFixed(0) + ' m²';
                      }
                    }
                  }
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

        chartsInitialized.current = true;
        setIsLoading(false);
        console.log('🎉 All charts initialization process completed');
      } catch (error) {
        console.error('❌ Error initializing charts:', error);
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
        const chartIds = ['ChartBarras', 'byProporcion', 'BoxTransacciones', 'BoxArea'];
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
  }, [transaccionesData, avaluoData, predialData, listingsData, tipologiaData]);

  const hasData = transaccionesData || avaluoData || predialData || listingsData || 
                  tipologiaData || transaccionesStats || areaStats;

  if (!hasData) return null;

  return (
    <>
      {/* Load Chart.js via CDN lazily when needed */}
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('📊 Chart.js loaded successfully');
        }}
      />
      
      {/* Load Chart.js Data Labels Plugin */}
      <Script
        src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('📊 Chart.js Data Labels plugin loaded successfully');
          // Trigger chart initialization after both scripts load
          setTimeout(() => {
            const event = new CustomEvent('chartJsLoaded');
            window.dispatchEvent(event);
          }, 100);
        }}
      />

      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Estadísticas
          </h3>
          {isLoading && (
            <span className="text-sm text-gray-500 animate-pulse">
              Cargando gráficas...
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Multi-axis Bar Chart - Full Width */}
          {(transaccionesData || avaluoData || predialData || listingsData) && (
            <Card className="p-6 shadow-md">
              <div className="w-full h-[400px]">
                <canvas id="ChartBarras"></canvas>
              </div>
            </Card>
          )}

          {/* Three columns for other charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* BoxTransacciones - Transactions Statistics */}
            {transaccionesStats && transaccionesStats.median != null && (
              <Card className="p-4 shadow-md">
                <div className="w-full h-[300px]">
                  <canvas id="BoxTransacciones"></canvas>
                </div>
              </Card>
            )}

            {/* Tipología Pie Chart */}
            {tipologiaData && tipologiaData.length > 0 && (
              <Card className="p-4 shadow-md">
                <div className="w-full h-[300px]">
                  <canvas id="byProporcion"></canvas>
                </div>
              </Card>
            )}

            {/* BoxArea - Area Statistics */}
            {areaStats && areaStats.median != null && (
              <Card className="p-4 shadow-md">
                <div className="w-full h-[300px]">
                  <canvas id="BoxArea"></canvas>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

