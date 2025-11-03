/**
 * UnitAnalysis Component
 * Displays detailed analysis of property units and construction details
 * Receives DetailUnitResponse data
 * 
 * @component
 * @architecture Clean Architecture - Presentation Layer
 * @principles SOLID - Single Responsibility, Separation of Concerns
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { DetailUnitResponse } from '@/config/api-detail-property';
import {
  UnitInfoCards,
  PredialChart,
  PredialesTable,
  TimelineHistorial,
} from './unit-analysis-sections';
import { TransaccionesTable, CTLTable } from './overview-sections';

interface UnitAnalysisProps {
  data: Partial<DetailUnitResponse>;
  initialSelectedChip?: string | null;
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

export default function UnitAnalysis({ data, initialSelectedChip }: UnitAnalysisProps) {
  const prediales = data?.data_prediales_actuales || {};
  const transacciones = data?.data_transacciones || {};
  const propietarios = data?.data_propietarios || {};
  const ctl = data?.data_ctl || {};
  console.log('🔍 UnitAnalysis - CTL Anotaciones --:', ctl);

  // Get unique properties (chips) with their addresses
  const availableProperties = useMemo(() => {
    const dataArray = prediales?.data || [];
    if (!Array.isArray(dataArray) || dataArray.length === 0) return [];

    // Get unique chips with their most recent address
    const uniqueChips = dataArray.reduce((acc: any[], curr: any) => {
      if (curr.chip && !acc.find(item => item.chip === curr.chip)) {
        acc.push({
          chip: curr.chip,
          direccion: curr.direccion || curr.predirecc || `Predio ${curr.chip.slice(-6)}`,
          preaconst: curr.preaconst || 0
        });
      }
      return acc;
    }, []);

    // Sort by area (largest first)
    return uniqueChips.sort((a, b) => (b.preaconst || 0) - (a.preaconst || 0));
  }, [prediales]);

  // Selected property state - Use initialSelectedChip if provided and valid
  const [selectedChip, setSelectedChip] = useState<string>(() => {
    if (initialSelectedChip && availableProperties.find(p => p.chip === initialSelectedChip)) {
      return initialSelectedChip;
    }
    return availableProperties[0]?.chip || '';
  });

  // Update selectedChip when initialSelectedChip changes
  useEffect(() => {
    if (initialSelectedChip && availableProperties.find(p => p.chip === initialSelectedChip)) {
      setSelectedChip(initialSelectedChip);
    }
  }, [initialSelectedChip, availableProperties]);

  // Process prediales data - FILTERED BY SELECTED CHIP
  const predialesData = useMemo(() => {
    const dataArray = prediales?.data || [];
    if (!Array.isArray(dataArray) || dataArray.length === 0) return [];
    
    // Filter by selected chip
    const filtered = selectedChip 
      ? dataArray.filter((p: any) => p.chip === selectedChip)
      : dataArray;
    
    // Sort by year descending
    return filtered.sort((a: any, b: any) => (b.year || 0) - (a.year || 0));
  }, [prediales, selectedChip]);

  // Get latest predial information
  const latestPredial = predialesData[0] || {};
  const vigencia = latestPredial.year || new Date().getFullYear();
  const avaluoCatastral = latestPredial.avaluo_catastral || null;
  const impuestoPredial = latestPredial.impuesto_total || latestPredial.impuesto_predial || latestPredial.impuesto_ajustado || null;

  // Process owners from prediales
  const ownersFromPrediales = useMemo(() => {
    if (!Array.isArray(predialesData) || predialesData.length === 0) return [];
    
    const latestYear = Math.max(...predialesData.map((p: any) => p.year || 0));
    const latestData = predialesData.filter((p: any) => p.year === latestYear);
    
    // Remove duplicates by identificacion
    const uniqueOwners = latestData.reduce((acc: any[], curr: any) => {
      if (curr.identificacion && !acc.find((o: any) => o.identificacion === curr.identificacion)) {
        acc.push(curr);
      }
      return acc;
    }, []);

    return uniqueOwners.map((owner: any, index: number) => ({
      label: uniqueOwners.length > 1 ? `Propietario ${index + 1}:` : '',
      nombre: owner.nombre,
      copropiedad: owner.copropiedad,
      tipoPropietario: owner.tipoPropietario,
      tipo: owner.tipo || owner.tipoDocumento,
      identificacion: owner.identificacion,
      telefonos: owner.telefonos,
      email: owner.email
    }));
  }, [predialesData]);

  // Process owners from transactions - FILTERED BY SELECTED CHIP
  const transaccionesData = useMemo(() => {
    const transactions = transacciones?.transactions || [];
    if (!Array.isArray(transactions) || transactions.length === 0) return [];
    
    // Filter by selected chip
    return selectedChip 
      ? transactions.filter((t: any) => t.chip === selectedChip)
      : transactions;
  }, [transacciones, selectedChip]);

  const ownersFromTransactions = useMemo(() => {
    if (!Array.isArray(transaccionesData) || transaccionesData.length === 0) return [];
    
    // Get latest transaction
    const sorted = [...transaccionesData].sort((a: any, b: any) => 
      new Date(b.fecha_documento_publico || 0).getTime() - new Date(a.fecha_documento_publico || 0).getTime()
    );
    
    const latestDate = sorted[0]?.fecha_documento_publico;
    const latestTransactions = sorted.filter((t: any) => t.fecha_documento_publico === latestDate);
    
    return latestTransactions.map((owner: any, index: number) => ({
      label: latestTransactions.length > 1 ? `Propietario ${index + 1}:` : '',
      nombre: owner.titular,
      tipoPropietario: owner.tipoPropietario,
      tipo: owner.tipo || owner.tipoDocumento,
      identificacion: owner.nrodocumento,
      telefonos: owner.telefonos,
      email: owner.email,
      fecha: owner.fecha_documento_publico
    }));
  }, [transaccionesData]);

  // Prepare chart data (last 4 years)
  const chartData = useMemo(() => {
    if (!Array.isArray(predialesData)) return [];
    
    const currentYear = new Date().getFullYear();
    return predialesData
      .filter((p: any) => 
        p.avaluo_catastral != null && 
        (p.impuesto_predial != null || p.impuesto_total != null) &&
        p.year > currentYear - 4
      )
      .map((p: any) => ({
        year: p.year,
        avaluo_catastral: p.avaluo_catastral,
        impuesto_total: p.impuesto_total || p.impuesto_predial || p.impuesto_ajustado
      }));
  }, [predialesData]);

  // Prepare info sections
  const infoSections = useMemo(() => {
    const sections = [];

    // Información del predio
    sections.push({
      title: 'Información del Predio',
      items: [
        { label: 'Dirección:', value: latestPredial.direccion || latestPredial.predirecc || null },
        { label: 'Chip:', value: latestPredial.chip || null },
        { label: 'Matrícula Inmobiliaria:', value: latestPredial.matriculainmobiliaria || null },
        { label: 'Cédula catastral:', value: latestPredial.cedula_catastral || latestPredial.precedcata || null },
        { label: 'Área privada:', value: latestPredial.preaconst ? `${latestPredial.preaconst.toLocaleString('es-CO')} m²` : null },
        { label: 'Área de terreno:', value: latestPredial.preaterre ? `${latestPredial.preaterre.toLocaleString('es-CO')} m²` : null },
        { label: 'Uso:', value: latestPredial.link || null },
        { label: 'Predios (mismo uso):', value: latestPredial.tipouso || null },
      ]
    });

    // Información Catastral
    sections.push({
      title: 'Información Catastral',
      items: [
        { label: 'Vigencia:', value: vigencia || null },
        { label: 'Avalúo Catastral:', value: formatCurrency(avaluoCatastral) },
        { label: 'Impuesto Predial:', value: formatCurrency(impuestoPredial) },
      ]
    });

    // Propietarios (según último predial)
    if (ownersFromPrediales.length > 0) {
      const ownerItems: any[] = [];
      ownersFromPrediales.forEach((owner) => {
        if (owner.label) ownerItems.push({ label: owner.label, value: '' });
        if (owner.nombre) ownerItems.push({ label: 'Nombre:', value: owner.nombre });
        if (owner.copropiedad) ownerItems.push({ label: 'Copropiedad (%):', value: `${owner.copropiedad}%` });
        if (owner.tipoPropietario) ownerItems.push({ label: 'Tipo:', value: owner.tipoPropietario });
        if (owner.tipo) ownerItems.push({ label: 'Tipo documento:', value: owner.tipo });
        if (owner.identificacion) ownerItems.push({ label: 'Identificación:', value: owner.identificacion });
        if (owner.telefonos) ownerItems.push({ label: 'Teléfonos:', value: owner.telefonos });
        if (owner.email) ownerItems.push({ label: 'Email:', value: owner.email });
      });

      sections.push({
        title: 'Propietarios (según último predial)',
        items: ownerItems
      });
    }

    // Propietarios (según última transacción)
    if (ownersFromTransactions.length > 0) {
      const ownerItems: any[] = [];
      ownersFromTransactions.forEach((owner) => {
        if (owner.label) ownerItems.push({ label: owner.label, value: '' });
        if (owner.nombre) ownerItems.push({ label: 'Nombre:', value: owner.nombre });
        if (owner.tipoPropietario) ownerItems.push({ label: 'Tipo:', value: owner.tipoPropietario });
        if (owner.tipo) ownerItems.push({ label: 'Tipo documento:', value: owner.tipo });
        if (owner.identificacion) ownerItems.push({ label: 'Identificación:', value: owner.identificacion });
        if (owner.telefonos) ownerItems.push({ label: 'Teléfonos:', value: owner.telefonos });
        if (owner.email) ownerItems.push({ label: 'Email:', value: owner.email });
        if (owner.fecha) ownerItems.push({ label: 'Fecha:', value: new Date(owner.fecha).toLocaleDateString('es-CO') });
      });

      sections.push({
        title: 'Propietarios (según última transacción)',
        items: ownerItems
      });
    }

    return sections;
  }, [latestPredial, vigencia, avaluoCatastral, impuestoPredial, ownersFromPrediales, ownersFromTransactions]);

  // Process CTL data - FILTERED BY SELECTED CHIP
  const ctlData = useMemo(() => {
    const certificados = ctl?.certificados || [];
    if (!Array.isArray(certificados) || certificados.length === 0) return [];
    
    return selectedChip 
      ? certificados.filter((c: any) => c.chip === selectedChip)
      : certificados;
  }, [ctl, selectedChip]);

  // Process CTL anotaciones - FILTERED BY SELECTED CHIP
  const ctlAnotaciones = useMemo(() => {
    const anotaciones = ctl?.anotaciones || [];
    console.log('🔍 UnitAnalysis - CTL Anotaciones debug:', {
      originalAnotaciones: anotaciones,
      length: anotaciones?.length,
      selectedChip,
      firstItem: anotaciones?.[0]
    });
    
    if (!Array.isArray(anotaciones) || anotaciones.length === 0) return [];
    
    const filtered = selectedChip 
      ? anotaciones.filter((a: any) => a.chip === selectedChip)
      : anotaciones;
    
    console.log('🔍 UnitAnalysis - Filtered anotaciones:', {
      filtered,
      length: filtered.length
    });
    
    return filtered;
  }, [ctl, selectedChip]);

  return (
    <div className="space-y-6">
      {/* Header with Property Selector */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-8 rounded-xl shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <Building2 className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Análisis de Unidad</h1>
        </div>
        <p className="text-blue-100 text-lg mb-4">
          Información catastral detallada, propietarios, transacciones y certificados de tradición
        </p>

        {/* Property Selector - Only show if more than 1 property */}
        {availableProperties.length > 1 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-blue-100 mb-2">
              Selecciona una dirección:
            </label>
            <div className="relative inline-block min-w-[300px]">
              <select
                value={selectedChip}
                onChange={(e) => setSelectedChip(e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-white text-gray-900 rounded-lg shadow-md border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none appearance-none cursor-pointer font-medium"
              >
                {availableProperties.map((prop) => (
                  <option key={prop.chip} value={prop.chip}>
                    {prop.direccion} ({prop.preaconst.toFixed(0)} m²)
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
            </div>
            <p className="text-xs text-blue-200 mt-2">
              Total de predios: {availableProperties.length}
            </p>
          </div>
        )}
      </div>

      {/* Info Cards - Only render if has data (chart is inside Información Catastral card) */}
      {infoSections.some(section => section.items.length > 0) && (
        <UnitInfoCards sections={infoSections} chartData={chartData} />
      )}

      {/* Prediales Table - Filtered by selected chip */}
      {predialesData.length > 0 && <PredialesTable data={predialesData} />}

      {/* Transacciones Table - Filtered by selected chip */}
      {transaccionesData.length > 0 && <TransaccionesTable data={transaccionesData} />}

      {/* CTL Table - Filtered by selected chip */}
      {ctlData.length > 0 && <CTLTable data={ctlData} />}

      {/* Timeline Historial - Filter by selected chip if available */}
      {ctlAnotaciones.length > 0 && <TimelineHistorial anotaciones={ctlAnotaciones} />}
    </div>
  );
}
