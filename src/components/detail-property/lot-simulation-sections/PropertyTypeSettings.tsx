'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building2, Plus, Trash2 } from 'lucide-react';

export interface PropertyTypeConfig {
  planta: number;
  tipoinmueble: string;
  porcentaje: number;
}

export interface PropertyTypeSettingsData {
  inputvar_tipologia: PropertyTypeConfig[];
}

interface PropertyTypeSettingsProps {
  onPropertyTypeChange: (propertyType: PropertyTypeSettingsData) => void;
  initialPropertyType?: Partial<PropertyTypeSettingsData>;
  numeroPisos: number;
}

const TIPO_INMUEBLE_OPTIONS = [
  'Áreas comunes',
  'Apartamento', 
  'Bodega', 
  'Casa', 
  'Local', 
  'Oficina'
];

export default function PropertyTypeSettings({ 
  onPropertyTypeChange, 
  initialPropertyType = {},
  numeroPisos 
}: PropertyTypeSettingsProps) {
  const [propertyTypeConfig, setPropertyTypeConfig] = useState<PropertyTypeConfig[]>([]);
  const [planta1Configs, setPlanta1Configs] = useState<PropertyTypeConfig[]>([]);
  const [siguientesPlantasConfigs, setSiguientesPlantasConfigs] = useState<PropertyTypeConfig[]>([]);

  useEffect(() => {
    const allConfigs = [...planta1Configs, ...siguientesPlantasConfigs];
    onPropertyTypeChange({ inputvar_tipologia: allConfigs });
  }, [planta1Configs, siguientesPlantasConfigs, onPropertyTypeChange]);

  const addPlanta1Config = () => {
    const porcentajeAcumulado = planta1Configs.reduce((sum, config) => sum + config.porcentaje, 0);
    const maxValue = (1 - porcentajeAcumulado) * 100;
    
    if (maxValue > 0) {
      const newConfig: PropertyTypeConfig = {
        planta: 1,
        tipoinmueble: 'Áreas comunes',
        porcentaje: maxValue / 100
      };
      setPlanta1Configs(prev => [...prev, newConfig]);
    }
  };

  const updatePlanta1Config = (index: number, field: keyof PropertyTypeConfig, value: any) => {
    setPlanta1Configs(prev => 
      prev.map((config, i) => 
        i === index ? { ...config, [field]: value } : config
      )
    );
  };

  const removePlanta1Config = (index: number) => {
    setPlanta1Configs(prev => prev.filter((_, i) => i !== index));
  };

  const addSiguientesPlantasConfig = () => {
    const pisosDisponibles = Array.from({ length: numeroPisos - 1 }, (_, i) => i + 2);
    const pisosUsados = siguientesPlantasConfigs.map(config => config.planta);
    const pisosDisponiblesFiltrados = pisosDisponibles.filter(piso => !pisosUsados.includes(piso));
    
    if (pisosDisponiblesFiltrados.length > 0) {
      const pisoInicio = pisosDisponiblesFiltrados[0];
      const pisoFin = pisoInicio;
      
      const newConfig: PropertyTypeConfig = {
        planta: pisoInicio,
        tipoinmueble: 'Apartamento',
        porcentaje: 1
      };
      
      // Add config for each floor in the range
      const configsToAdd: PropertyTypeConfig[] = [];
      for (let piso = pisoInicio; piso <= pisoFin; piso++) {
        configsToAdd.push({
          ...newConfig,
          planta: piso
        });
      }
      
      setSiguientesPlantasConfigs(prev => [...prev, ...configsToAdd]);
    }
  };

  const updateSiguientesPlantasConfig = (index: number, field: keyof PropertyTypeConfig, value: any) => {
    setSiguientesPlantasConfigs(prev => 
      prev.map((config, i) => 
        i === index ? { ...config, [field]: value } : config
      )
    );
  };

  const removeSiguientesPlantasConfig = (index: number) => {
    setSiguientesPlantasConfigs(prev => prev.filter((_, i) => i !== index));
  };

  const getMaxPercentageForPlanta1 = () => {
    const porcentajeAcumulado = planta1Configs.reduce((sum, config) => sum + config.porcentaje, 0);
    return (1 - porcentajeAcumulado) * 100;
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Building2 className="w-5 h-5 text-teal-600" />
          Configuración por tipo de inmueble
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Planta 1 */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Planta 1:</h4>
          
          {planta1Configs.map((config, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border rounded-lg bg-gray-50">
              <div className="space-y-2">
                <Label>Tipo de inmueble:</Label>
                <Select
                  value={config.tipoinmueble}
                  onValueChange={(value) => updatePlanta1Config(index, 'tipoinmueble', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_INMUEBLE_OPTIONS.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Porcentaje:</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    max={getMaxPercentageForPlanta1()}
                    step="0.1"
                    value={config.porcentaje * 100}
                    onChange={(e) => updatePlanta1Config(index, 'porcentaje', parseFloat(e.target.value) / 100)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePlanta1Config(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={addPlanta1Config}
            disabled={getMaxPercentageForPlanta1() <= 0}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Configuración Planta 1
          </Button>
        </div>

        <Separator />

        {/* Siguientes Plantas */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Siguientes plantas:</h4>
          
          {siguientesPlantasConfigs.map((config, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border rounded-lg bg-gray-50">
              <div className="space-y-2">
                <Label>Piso:</Label>
                <Input
                  type="number"
                  min="2"
                  max={numeroPisos}
                  value={config.planta}
                  onChange={(e) => updateSiguientesPlantasConfig(index, 'planta', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo de inmueble:</Label>
                <Select
                  value={config.tipoinmueble}
                  onValueChange={(value) => updateSiguientesPlantasConfig(index, 'tipoinmueble', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartamento">Apartamento</SelectItem>
                    <SelectItem value="Oficina">Oficina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Acciones:</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeSiguientesPlantasConfig(index)}
                  className="w-full text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={addSiguientesPlantasConfig}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Configuración Siguientes Plantas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
