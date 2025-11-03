/**
 * MarketMetrics Component
 * Displays key market metrics and statistics
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  MapPin,
  ExternalLink 
} from 'lucide-react';

interface MarketMetricsProps {
  data: {
    data_polygon_radio?: any;
    data_transacciones?: any;
    data_prediales?: any;
    data_market?: any;
  };
}

// Helper to safely get nested values
const getNestedValue = (obj: any, path: string, defaultValue: any = null): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? defaultValue;
};

// Helper to format currency
const formatCurrency = (value: any): string => {
  if (value == null || isNaN(Number(value))) return 'Sin información';
  return `$${Number(value).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
};

// Helper to format number
const formatNumber = (value: any): string => {
  if (value == null || isNaN(Number(value))) return 'Sin información';
  return Number(value).toLocaleString('es-CO');
};

export default function MarketMetrics({ data }: MarketMetricsProps) {
  const data_polygon_radio = data?.data_polygon_radio || {};
  const data_transacciones = data?.data_transacciones || {};
  const data_prediales = data?.data_prediales || {};
  const data_market = data?.data_market || {};

  // Extract metrics
  const numerofolios = getNestedValue(data_polygon_radio, 'prediosResumen.numeroLotes');
  const numeropredios = getNestedValue(data_polygon_radio, 'prediosResumen.numeroPredios');
  const numerotransacciones = getNestedValue(data_transacciones, 'summary.ultimoAno.total_compraventas');
  const valortransacciones = getNestedValue(data_transacciones, 'summary.ultimoAno.valor_promedio_mt2');
  const avaluocatastralmt2 = getNestedValue(data_prediales, 'avaluoCatastral.valorMt2');
  const predialmt2 = getNestedValue(data_prediales, 'impuestoPredial.valorMt2');
  const valorventamt2 = getNestedValue(data_market, 'indicadoresMercado.venta.valorMedianoPorM2');
  const numerolistingsventa = getNestedValue(data_market, 'indicadoresMercado.venta.propiedadesActivas');
  const valorarriendomt2 = getNestedValue(data_market, 'indicadoresMercado.arriendo.valorMedianoPorM2');
  const numerolistingsarriendo = getNestedValue(data_market, 'indicadoresMercado.arriendo.propiedadesActivas');

  // Get listing codes for buttons
  const codigoVenta = getNestedValue(data_market, 'listaCodigosActivos.venta');
  const codigoArriendo = getNestedValue(data_market, 'listaCodigosActivos.arriendo');

  const metrics = [
    {
      title: 'Número de folios de matrícula',
      value: formatNumber(numerofolios),
      icon: <FileText className="w-5 h-5" />,
      color: 'blue'
    },
    {
      title: 'Número de matrículas únicas',
      value: formatNumber(numeropredios),
      icon: <Building2 className="w-5 h-5" />,
      color: 'blue'
    },
    {
      title: 'Número de transacciones [2024-2025]',
      value: formatNumber(numerotransacciones),
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'green'
    },
    {
      title: 'Valor promedio de transacciones por mt² [2024-2025]',
      value: formatCurrency(valortransacciones),
      icon: <DollarSign className="w-5 h-5" />,
      color: 'green'
    },
    {
      title: 'Avalúo catastral por mt² (último año)',
      value: formatCurrency(avaluocatastralmt2),
      icon: <DollarSign className="w-5 h-5" />,
      color: 'purple'
    },
    {
      title: 'Predial por mt² (último año)',
      value: formatCurrency(predialmt2),
      icon: <DollarSign className="w-5 h-5" />,
      color: 'purple'
    }
  ];

  const marketMetrics = [
    {
      title: 'Listings en Venta',
      value: formatCurrency(valorventamt2),
      count: formatNumber(numerolistingsventa),
      icon: <DollarSign className="w-5 h-5" />,
      color: 'green',
      hasLink: !!codigoVenta,
      linkCode: codigoVenta
    },
    {
      title: 'Listings en Arriendo',
      value: formatCurrency(valorarriendomt2),
      count: formatNumber(numerolistingsarriendo),
      icon: <DollarSign className="w-5 h-5" />,
      color: 'blue',
      hasLink: !!codigoArriendo,
      linkCode: codigoArriendo
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-600 dark:text-blue-400',
      green: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-600 dark:text-green-400',
      purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 text-purple-600 dark:text-purple-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const generateListingLink = (code: string) => {
    const params = {
      type: 'listings',
      code: code,
      token: '' // Will be filled by parent component
    };
    const encodedParams = btoa(JSON.stringify(params));
    return `http://www.urbex.com.co/Reporte?token=${encodedParams}`;
  };

  return (
    <div className="space-y-6">
      {/* Basic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className={`p-4 border-b bg-gradient-to-r ${getColorClasses(metric.color)}`}>
              <div className="flex items-center gap-2">
                {metric.icon}
                <h3 className="text-sm font-medium">{metric.title}</h3>
              </div>
            </div>
            <div className="p-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {metric.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Market Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {marketMetrics.map((metric, index) => (
          <Card key={index} className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className={`p-4 border-b bg-gradient-to-r ${getColorClasses(metric.color)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <h3 className="text-sm font-medium">{metric.title}</h3>
                </div>
                {metric.hasLink && (
                  <Badge variant="secondary" className="text-xs">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Ver datos
                  </Badge>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {metric.value}
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {metric.count} propiedades activas
                </p>
                {metric.hasLink && (
                  <a
                    href={generateListingLink(metric.linkCode)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver datos detallados
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
