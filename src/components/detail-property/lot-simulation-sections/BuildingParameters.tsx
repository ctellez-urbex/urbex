'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Building, Settings, Ruler } from 'lucide-react';

export interface BuildingParametersData {
  numero_pisos: number;
  alturapiso: number;
  proporcion_areas_comunes: number;
  shape: string;
  distancia_minima: number;
  min_area: number;
  max_area: number;
  max_blocks: number;
}

interface BuildingParametersProps {
  onParametersChange: (parameters: BuildingParametersData) => void;
  initialParameters?: Partial<BuildingParametersData>;
}

export default function BuildingParameters({ 
  onParametersChange, 
  initialParameters = {} 
}: BuildingParametersProps) {
  const [parameters, setParameters] = useState<BuildingParametersData>({
    numero_pisos: 5,
    alturapiso: 3.0,
    proporcion_areas_comunes: 20.0,
    shape: 'optimizacion',
    distancia_minima: 10,
    min_area: 620,
    max_area: 800,
    max_blocks: 0,
    ...initialParameters
  });

  const [isOptimization, setIsOptimization] = useState(parameters.shape === 'optimizacion');

  useEffect(() => {
    onParametersChange(parameters);
  }, [parameters, onParametersChange]);

  const handleParameterChange = (key: keyof BuildingParametersData, value: any) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleShapeChange = (shape: string) => {
    handleParameterChange('shape', shape);
    setIsOptimization(shape === 'optimizacion');
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Building className="w-5 h-5 text-blue-600" />
          Parámetros Básicos del Edificio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuración de Edificio */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Settings className="w-4 h-4" />
            Configuración de Edificio
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_pisos">Número de pisos a simular:</Label>
              <Select 
                value={parameters.numero_pisos.toString()} 
                onValueChange={(value) => handleParameterChange('numero_pisos', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 40 }, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} pisos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alturapiso">Altura de cada planta (metros):</Label>
              <Input
                id="alturapiso"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={parameters.alturapiso}
                onChange={(e) => handleParameterChange('alturapiso', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proporcion_areas_comunes">Porcentaje de uso de áreas comunes:</Label>
              <Input
                id="proporcion_areas_comunes"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={parameters.proporcion_areas_comunes}
                onChange={(e) => handleParameterChange('proporcion_areas_comunes', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shape">Forma del edificio:</Label>
              <Select value={parameters.shape} onValueChange={handleShapeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="optimizacion">Optimización</SelectItem>
                  <SelectItem value="rectangulo">Rectángulo</SelectItem>
                  <SelectItem value="cuadrado">Cuadrado</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="U">U</SelectItem>
                  <SelectItem value="superficie">Superficie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Configuración de Optimización */}
        {isOptimization && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Ruler className="w-4 h-4" />
                Configuración de Optimización
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distancia_minima">Distancia entre edificios (metros):</Label>
                  <Input
                    id="distancia_minima"
                    type="number"
                    min="0"
                    max="100"
                    value={parameters.distancia_minima}
                    onChange={(e) => handleParameterChange('distancia_minima', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_area">Área mínima por planta (m²):</Label>
                  <Input
                    id="min_area"
                    type="number"
                    min="0"
                    max="10000"
                    value={parameters.min_area}
                    onChange={(e) => handleParameterChange('min_area', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_area">Área máxima por planta (m²):</Label>
                  <Input
                    id="max_area"
                    type="number"
                    min="0"
                    max="10000"
                    value={parameters.max_area}
                    onChange={(e) => handleParameterChange('max_area', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_blocks">Número máximo de edificaciones:</Label>
                  <Input
                    id="max_blocks"
                    type="number"
                    min="0"
                    max="100"
                    value={parameters.max_blocks}
                    onChange={(e) => handleParameterChange('max_blocks', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
