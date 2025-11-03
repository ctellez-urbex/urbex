'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface StaircaseConfig {
  piso_inicio: number;
  piso_fin: number;
  aislamiento_frontal: number;
  aislamiento_frontal_cara_larga: number;
  aislamiento_frontal_cara_corta: number;
  aislamiento_posterior: number;
  aislamiento_posterior_cara_larga: number;
  aislamiento_posterior_cara_corta: number;
  aislamiento_lateral: number;
  aislamiento_lateral_cara_larga: number;
  aislamiento_lateral_cara_corta: number;
}

export interface StaircaseSettingsData {
  escalones_config: StaircaseConfig[];
}

interface StaircaseSettingsProps {
  onStaircaseChange: (staircase: StaircaseSettingsData) => void;
  initialStaircase?: Partial<StaircaseSettingsData>;
  numeroPisos: number;
}

export default function StaircaseSettings({ 
  onStaircaseChange, 
  initialStaircase = {},
  numeroPisos 
}: StaircaseSettingsProps) {
  const [isStaircaseActive, setIsStaircaseActive] = useState(false);
  const [escalonesActivos, setEscalonesActivos] = useState<StaircaseConfig[]>([]);

  useEffect(() => {
    onStaircaseChange({ escalones_config: escalonesActivos });
  }, [escalonesActivos, onStaircaseChange]);

  const handleStaircaseToggle = (checked: boolean) => {
    setIsStaircaseActive(checked);
    if (!checked) {
      setEscalonesActivos([]);
    } else if (escalonesActivos.length === 0) {
      // Add first step automatically
      addEscalon();
    }
  };

  const addEscalon = () => {
    const ultimoPisoFin = escalonesActivos.length > 0 
      ? Math.max(...escalonesActivos.map(e => e.piso_fin))
      : 1;
    
    const nuevoEscalon: StaircaseConfig = {
      piso_inicio: ultimoPisoFin + 1,
      piso_fin: numeroPisos,
      aislamiento_frontal: 0,
      aislamiento_frontal_cara_larga: 0,
      aislamiento_frontal_cara_corta: 0,
      aislamiento_posterior: 0,
      aislamiento_posterior_cara_larga: 0,
      aislamiento_posterior_cara_corta: 0,
      aislamiento_lateral: 0,
      aislamiento_lateral_cara_larga: 0,
      aislamiento_lateral_cara_corta: 0,
    };

    setEscalonesActivos(prev => [...prev, nuevoEscalon]);
  };

  const removeEscalon = (index: number) => {
    setEscalonesActivos(prev => prev.filter((_, i) => i !== index));
  };

  const updateEscalon = (index: number, field: keyof StaircaseConfig, value: number) => {
    setEscalonesActivos(prev => 
      prev.map((escalon, i) => 
        i === index ? { ...escalon, [field]: value } : escalon
      )
    );
  };

  const getValidStartFloors = (index: number) => {
    if (index === 0) return Array.from({ length: numeroPisos - 1 }, (_, i) => i + 2);
    
    const previousEnd = escalonesActivos[index - 1]?.piso_fin || 0;
    return Array.from({ length: numeroPisos - previousEnd }, (_, i) => previousEnd + i + 1);
  };

  const getValidEndFloors = (startFloor: number) => {
    return Array.from({ length: numeroPisos - startFloor + 1 }, (_, i) => startFloor + i);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Layers className="w-5 h-5 text-indigo-600" />
          Edificio Escalonado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="escalones" 
            checked={isStaircaseActive}
            onCheckedChange={handleStaircaseToggle}
          />
          <Label htmlFor="escalones" className="text-sm font-medium">
            Activar edificio escalonado
          </Label>
        </div>

        {isStaircaseActive && (
          <div className="space-y-6">
            {escalonesActivos.map((escalon, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">
                    Escalón {index + 1}
                  </h4>
                  {escalonesActivos.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeEscalon(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Rango de pisos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Desde el piso:</Label>
                    <Select
                      value={escalon.piso_inicio.toString()}
                      onValueChange={(value) => updateEscalon(index, 'piso_inicio', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getValidStartFloors(index).map(piso => (
                          <SelectItem key={piso} value={piso.toString()}>
                            Piso {piso}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Hasta el piso:</Label>
                    <Select
                      value={escalon.piso_fin.toString()}
                      onValueChange={(value) => updateEscalon(index, 'piso_fin', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getValidEndFloors(escalon.piso_inicio).map(piso => (
                          <SelectItem key={piso} value={piso.toString()}>
                            Piso {piso}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Aislamientos del escalón */}
                <div className="space-y-4">
                  <h5 className="text-sm font-medium text-gray-600">Aislamientos del escalón</h5>
                  
                  {/* Aislamiento Frontal */}
                  <div className="space-y-2">
                    <Label>Aislamiento frontal (metros):</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={escalon.aislamiento_frontal}
                      onChange={(e) => updateEscalon(index, 'aislamiento_frontal', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  {escalon.aislamiento_frontal > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Frontal cara larga:</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={escalon.aislamiento_frontal_cara_larga}
                          onChange={(e) => updateEscalon(index, 'aislamiento_frontal_cara_larga', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Frontal cara corta:</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={escalon.aislamiento_frontal_cara_corta}
                          onChange={(e) => updateEscalon(index, 'aislamiento_frontal_cara_corta', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Aislamiento Posterior */}
                  <div className="space-y-2">
                    <Label>Aislamiento posterior (metros):</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={escalon.aislamiento_posterior}
                      onChange={(e) => updateEscalon(index, 'aislamiento_posterior', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  {escalon.aislamiento_posterior > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Posterior cara larga:</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={escalon.aislamiento_posterior_cara_larga}
                          onChange={(e) => updateEscalon(index, 'aislamiento_posterior_cara_larga', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Posterior cara corta:</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={escalon.aislamiento_posterior_cara_corta}
                          onChange={(e) => updateEscalon(index, 'aislamiento_posterior_cara_corta', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Aislamiento Lateral */}
                  <div className="space-y-2">
                    <Label>Aislamiento lateral (metros):</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={escalon.aislamiento_lateral}
                      onChange={(e) => updateEscalon(index, 'aislamiento_lateral', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  {escalon.aislamiento_lateral > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Lateral cara larga:</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={escalon.aislamiento_lateral_cara_larga}
                          onChange={(e) => updateEscalon(index, 'aislamiento_lateral_cara_larga', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Lateral cara corta:</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={escalon.aislamiento_lateral_cara_corta}
                          onChange={(e) => updateEscalon(index, 'aislamiento_lateral_cara_corta', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {index < escalonesActivos.length - 1 && <Separator />}
              </div>
            ))}

            {/* Add new step button */}
            {escalonesActivos.length > 0 && 
             escalonesActivos[escalonesActivos.length - 1].piso_fin < numeroPisos && (
              <Button
                variant="outline"
                onClick={addEscalon}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Escalón
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
