/**
 * PredialChart Component
 * Displays dual-axis chart for cadastral appraisal and property tax history
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface PredialData {
  year: number;
  avaluo_catastral: number;
  impuesto_total: number;
}

interface PredialChartProps {
  data: PredialData[];
}

export default function PredialChart({ data }: PredialChartProps) {
  const chartInitialized = useRef(false);

  useEffect(() => {
    if (chartInitialized.current || !data || data.length === 0) return;

    // Listen for Chart.js load event
    const handleChartJsLoad = () => {
      console.log('📊 Chart.js loaded event received for PredialChart');
      setTimeout(initChart, 100);
    };
    
    window.addEventListener('chartJsLoaded', handleChartJsLoad);

    const initChart = () => {
      if (!(window as any).Chart) {
        console.warn('⏳ Chart.js not loaded yet for PredialChart, retrying...');
        setTimeout(initChart, 500);
        return;
      }

      try {
        const Chart = (window as any).Chart;
        const ctx = document.getElementById('PredialChart') as HTMLCanvasElement;
        
        if (!ctx) {
          console.error('❌ PredialChart canvas not found');
          return;
        }

        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(ctx);
        if (existingChart) {
          console.log('🗑️ Destroying existing PredialChart');
          existingChart.destroy();
        }

        const years = data.map(d => d.year);
        const avaluos = data.map(d => d.avaluo_catastral);
        const prediales = data.map(d => d.impuesto_total);

        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: years,
            datasets: [
              {
                label: 'Avalúo catastral',
                data: avaluos,
                backgroundColor: '#4BB3FD',
                borderColor: '#2D8FD5',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.7,
                yAxisID: 'y',
              },
              {
                label: 'Impuesto predial',
                data: prediales,
                backgroundColor: '#A16CFF',
                borderColor: '#8557D9',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.7,
                yAxisID: 'y1',
              }
            ]
          },
          options: {
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    const val = context.parsed.y;
                    return new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0
                    }).format(val);
                  }
                }
              },
              legend: { position: 'bottom' }
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: { display: false }
              },
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Avalúo catastral (COP)'
                },
                ticks: {
                  callback: (v: any) => v.toLocaleString('es-CO')
                },
                grid: { color: 'rgba(0,0,0,0.05)' }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Impuesto predial (COP)'
                },
                ticks: {
                  callback: (v: any) => v.toLocaleString('es-CO')
                },
                grid: { display: false }
              }
            }
          }
        });

        chartInitialized.current = true;
        console.log('✅ PredialChart initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing PredialChart:', error);
      }
    };

    const timer = setTimeout(initChart, 1500);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('chartJsLoaded', handleChartJsLoad);
      
      // Cleanup chart when component unmounts
      if (typeof window !== 'undefined' && (window as any).Chart) {
        const Chart = (window as any).Chart;
        const canvas = document.getElementById('PredialChart');
        if (canvas) {
          const existingChart = Chart.getChart(canvas);
          if (existingChart) {
            console.log('🗑️ Cleaning up PredialChart');
            existingChart.destroy();
          }
        }
      }
    };
  }, [data]);

  if (!data || data.length === 0) return null;

  return (
    <Card className="shadow-md">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Histórico de Avalúos e Impuestos
          </h3>
        </div>
      </div>
      <div className="p-6">
        <div className="w-full h-[300px]">
          <canvas id="PredialChart"></canvas>
        </div>
      </div>
    </Card>
  );
}

