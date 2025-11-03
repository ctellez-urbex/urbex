'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Shield, Ruler } from 'lucide-react';

export interface IsolationSettingsData {
  aislamiento_frontal: number;
  aislamiento_lateral: number;
  aislamiento_posterior: number;
  aislamiento_frontal_cara_larga: number;
  aislamiento_frontal_cara_corta: number;
  aislamiento_lateral_cara_larga: number;
  aislamiento_lateral_cara_corta: number;
  aislamiento_posterior_cara_larga: number;
  aislamiento_posterior_cara_corta: number;
  reduccion_poligono: number;
}

interface IsolationSettingsProps {
  onIsolationChange: (isolation: IsolationSettingsData) => void;
  initialIsolation?: Partial<IsolationSettingsData>;
}

export default function IsolationSettings({ 
  onIsolationChange, 
  initialIsolation = {} 
}: IsolationSettingsProps) {
  const [isolation, setIsolation] = useState<IsolationSettingsData>({
    aislamiento_frontal: 0,
    aislamiento_lateral: 0,
    aislamiento_posterior: 0,
    aislamiento_frontal_cara_larga: 0,
    aislamiento_frontal_cara_corta: 0,
    aislamiento_lateral_cara_larga: 0,
    aislamiento_lateral_cara_corta: 0,
    aislamiento_posterior_cara_larga: 0,
    aislamiento_posterior_cara_corta: 0,
    reduccion_poligono: 0,
    ...initialIsolation
  });

  const [isIsolationActive, setIsIsolationActive] = useState(false);
  const [isReductionActive, setIsReductionActive] = useState(false);

  useEffect(() => {
    onIsolationChange(isolation);
  }, [isolation, onIsolationChange]);

  const handleIsolationChange = (key: keyof IsolationSettingsData, value: number) => {
    setIsolation(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleIsolationToggle = (checked: boolean) => {
    setIsIsolationActive(checked);
    if (!checked) {
      // Reset all isolation values when deactivated
      setIsolation(prev => ({
        ...prev,
        aislamiento_frontal: 0,
        aislamiento_lateral: 0,
        aislamiento_posterior: 0,
        aislamiento_frontal_cara_larga: 0,
        aislamiento_frontal_cara_corta: 0,
        aislamiento_lateral_cara_larga: 0,
        aislamiento_lateral_cara_corta: 0,
        aislamiento_posterior_cara_larga: 0,
        aislamiento_posterior_cara_corta: 0,
      }));
    }
  };

  const handleReductionToggle = (checked: boolean) => {
    setIsReductionActive(checked);
    if (!checked) {
      handleIsolationChange('reduccion_poligono', 0);
    } else {
      handleIsolationChange('reduccion_poligono', 70);
    }
  };

  return (
    <div className="space-y-6">
      {/* Aislamiento del Lote */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="w-5 h-5 text-green-600" />
            Aislamiento del Lote
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="aislamiento" 
              checked={isIsolationActive}
              onCheckedChange={handleIsolationToggle}
            />
            <Label htmlFor="aislamiento" className="text-sm font-medium">
              Activar aislamientos del lote
            </Label>
          </div>

          {isIsolationActive && (
            <div className="space-y-6">
              {/* Aislamiento Frontal */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aislamiento_frontal">Aislamiento frontal (metros)</Label>
                  <Input
                    id="aislamiento_frontal"
                    type="number"
                    min="0"
                    step="1"
                    value={isolation.aislamiento_frontal}
                    onChange={(e) => handleIsolationChange('aislamiento_frontal', parseInt(e.target.value) || 0)}
                  />
                </div>

                {isolation.aislamiento_frontal > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="aislamiento_frontal_cara_larga">Frontal cara larga</Label>
                      <Input
                        id="aislamiento_frontal_cara_larga"
                        type="number"
                        min="0"
                        step="1"
                        value={isolation.aislamiento_frontal_cara_larga}
                        onChange={(e) => handleIsolationChange('aislamiento_frontal_cara_larga', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aislamiento_frontal_cara_corta">Frontal cara corta</Label>
                      <Input
                        id="aislamiento_frontal_cara_corta"
                        type="number"
                        min="0"
                        step="1"
                        value={isolation.aislamiento_frontal_cara_corta}
                        onChange={(e) => handleIsolationChange('aislamiento_frontal_cara_corta', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Aislamiento Lateral */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aislamiento_lateral">Aislamiento lateral (metros)</Label>
                  <Input
                    id="aislamiento_lateral"
                    type="number"
                    min="0"
                    step="1"
                    value={isolation.aislamiento_lateral}
                    onChange={(e) => handleIsolationChange('aislamiento_lateral', parseInt(e.target.value) || 0)}
                  />
                </div>

                {isolation.aislamiento_lateral > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="aislamiento_lateral_cara_larga">Lateral cara larga</Label>
                      <Input
                        id="aislamiento_lateral_cara_larga"
                        type="number"
                        min="0"
                        step="1"
                        value={isolation.aislamiento_lateral_cara_larga}
                        onChange={(e) => handleIsolationChange('aislamiento_lateral_cara_larga', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aislamiento_lateral_cara_corta">Lateral cara corta</Label>
                      <Input
                        id="aislamiento_lateral_cara_corta"
                        type="number"
                        min="0"
                        step="1"
                        value={isolation.aislamiento_lateral_cara_corta}
                        onChange={(e) => handleIsolationChange('aislamiento_lateral_cara_corta', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Aislamiento Posterior */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aislamiento_posterior">Aislamiento posterior (metros)</Label>
                  <Input
                    id="aislamiento_posterior"
                    type="number"
                    min="0"
                    step="1"
                    value={isolation.aislamiento_posterior}
                    onChange={(e) => handleIsolationChange('aislamiento_posterior', parseInt(e.target.value) || 0)}
                  />
                </div>

                {isolation.aislamiento_posterior > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="aislamiento_posterior_cara_larga">Posterior cara larga</Label>
                      <Input
                        id="aislamiento_posterior_cara_larga"
                        type="number"
                        min="0"
                        step="1"
                        value={isolation.aislamiento_posterior_cara_larga}
                        onChange={(e) => handleIsolationChange('aislamiento_posterior_cara_larga', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aislamiento_posterior_cara_corta">Posterior cara corta</Label>
                      <Input
                        id="aislamiento_posterior_cara_corta"
                        type="number"
                        min="0"
                        step="1"
                        value={isolation.aislamiento_posterior_cara_corta}
                        onChange={(e) => handleIsolationChange('aislamiento_posterior_cara_corta', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reducción del Polígono */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Ruler className="w-5 h-5 text-orange-600" />
            Porcentaje de reducción del lote
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="reduccion" 
              checked={isReductionActive}
              onCheckedChange={handleReductionToggle}
            />
            <Label htmlFor="reduccion" className="text-sm font-medium">
              Activar porcentaje del lote
            </Label>
          </div>

          {isReductionActive && (
            <div className="space-y-2">
              <Label htmlFor="reduccion_poligono">Porcentaje del lote para construir (%)</Label>
              <Input
                id="reduccion_poligono"
                type="number"
                min="0"
                max="100"
                value={isolation.reduccion_poligono}
                onChange={(e) => handleIsolationChange('reduccion_poligono', parseInt(e.target.value) || 0)}
                disabled={isIsolationActive}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
