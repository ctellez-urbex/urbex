/**
 * UnitInfoCards Component
 * Displays property unit basic information and cadastral data
 * Includes PredialChart within the Información Catastral card
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Home, FileText, Users, ExternalLink } from 'lucide-react';
import PredialChart from './PredialChart';

interface InfoItem {
  label: string;
  value: string | number | null;
  isLink?: boolean;
  linkUrl?: string;
}

interface SectionData {
  title: string;
  items: InfoItem[];
}

interface PredialChartData {
  year: number;
  avaluo_catastral: number;
  impuesto_total: number;
}

interface UnitInfoCardsProps {
  sections: SectionData[];
  chartData?: PredialChartData[];
}

const InfoCard: React.FC<{ 
  section: SectionData; 
  icon: React.ReactNode;
  showChart?: boolean;
  chartData?: PredialChartData[];
}> = ({ section, icon, showChart, chartData }) => {
  const validItems = section.items.filter(item => 
    item.value !== null && 
    item.value !== '' && 
    item.value !== 'Sin información'
  );

  if (validItems.length === 0) return null;

  return (
    <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 dark:text-blue-400">{icon}</span>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{section.title}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {validItems.map((item, index) => (
            <div 
              key={index} 
              className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                {item.label}
              </span>
              <span className={`text-sm font-medium text-gray-900 dark:text-gray-100 text-right flex-1 ${
                item.label.includes('Avalúo') || item.label.includes('Impuesto') 
                  ? 'font-bold text-purple-600 dark:text-purple-400' 
                  : ''
              }`}>
                {item.isLink && item.linkUrl ? (
                  <a
                    href={item.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Render chart inside Información Catastral card */}
        {showChart && chartData && chartData.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="w-full h-[300px]">
              <canvas id="PredialChart"></canvas>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default function UnitInfoCards({ sections, chartData }: UnitInfoCardsProps) {
  const icons = [
    <Home className="w-5 h-5" key="home" />,
    <FileText className="w-5 h-5" key="file" />,
    <Users className="w-5 h-5" key="users1" />,
    <Users className="w-5 h-5" key="users2" />
  ];

  // Initialize chart when component mounts
  React.useEffect(() => {
    if (chartData && chartData.length > 0) {
      // Chart will be initialized by PredialChart component logic embedded in the card
      const timer = setTimeout(() => {
        const event = new CustomEvent('initPredialChart', { detail: { data: chartData } });
        window.dispatchEvent(event);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [chartData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sections.map((section, index) => {
        // Check if card has valid items
        const hasValidItems = section.items.some(item => 
          item.value !== null && 
          item.value !== '' && 
          item.value !== 'Sin información'
        );
        
        // Don't render if no valid items
        if (!hasValidItems) return null;

        // Render chart only in "Información Catastral" card
        const showChart = section.title === 'Información Catastral';

        return (
          <InfoCard 
            key={index} 
            section={section} 
            icon={icons[index] || <FileText className="w-5 h-5" />}
            showChart={showChart}
            chartData={chartData}
          />
        );
      })}
    </div>
  );
}

