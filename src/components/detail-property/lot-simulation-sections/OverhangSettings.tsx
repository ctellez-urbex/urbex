'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { CornerDownRight, Ruler } from 'lucide-react';

export interface OverhangSettingsData {
  voladizo_frontal: number;
  voladizo_lateral: number;
  voladizo_posterior: number;
  voladizo_frontal_cara_larga: number;
  voladizo_frontal_cara_corta: number;
  voladizo_lateral_cara_larga: number;
  voladizo_lateral_cara_corta: number;
  voladizo_posterior_cara_larga: number;
  voladizo_posterior_cara_corta: number;
}

interface OverhangSettingsProps {
  onOverhangChange: (overhang: OverhangSettingsData) => void;
  initialOverhang?: Partial<OverhangSettingsData>;
}

export default function OverhangSettings({ 
  onOverhangChange, 
  initialOverhang = {} 
}: OverhangSettingsProps) {
  const [overhang, setOverhang] = useState<OverhangSettingsData>({
    voladizo_frontal: 0.0,
    voladizo_lateral: 0.0,
    voladizo_posterior: 0.0,
    voladizo_frontal_cara_larga: 0.0,
    voladizo_frontal_cara_corta: 0.0,
    voladizo_lateral_cara_larga: 0.0,
    voladizo_lateral_cara_corta: 0.0,
    voladizo_posterior_cara_larga: 0.0,
    voladizo_posterior_cara_corta: 0.0,
    ...initialOverhang
  });

  const [isOverhangActive, setIsOverhangActive] = useState(false);

  useEffect(() => {
    onOverhangChange(overhang);
  }, [overhang, onOverhangChange]);

  const handleOverhangChange = (key: keyof OverhangSettingsData, value: number) => {
    setOverhang(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleOverhangToggle = (checked: boolean) => {
    setIsOverhangActive(checked);
    if (!checked) {
      // Reset all overhang values when deactivated
      setOverhang(prev => ({
        ...prev,
        voladizo_frontal: 0.0,
        voladizo_lateral: 0.0,
        voladizo_posterior: 0.0,
        voladizo_frontal_cara_larga: 0.0,
        voladizo_frontal_cara_corta: 0.0,
        voladizo_lateral_cara_larga: 0.0,
        voladizo_lateral_cara_corta: 0.0,
        voladizo_posterior_cara_larga: 0.0,
        voladizo_posterior_cara_corta: 0.0,
      }));
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <CornerDownRight className="w-5 h-5 text-purple-600" />
          Voladizos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="voladizo" 
            checked={isOverhangActive}
            onCheckedChange={handleOverhangToggle}
          />
          <Label htmlFor="voladizo" className="text-sm font-medium">
            Activar voladizos
          </Label>
        </div>

        {isOverhangActive && (
          <div className="space-y-6">
            {/* Voladizo Frontal */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voladizo_frontal">Voladizo frontal (metros)</Label>
                <Input
                  id="voladizo_frontal"
                  type="number"
                  min="0"
                  step="0.1"
                  value={overhang.voladizo_frontal}
                  onChange={(e) => handleOverhangChange('voladizo_frontal', parseFloat(e.target.value) || 0)}
                />
              </div>

              {overhang.voladizo_frontal > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voladizo_frontal_cara_larga">Frontal cara larga</Label>
                    <Input
                      id="voladizo_frontal_cara_larga"
                      type="number"
                      min="0"
                      step="0.1"
                      value={overhang.voladizo_frontal_cara_larga}
                      onChange={(e) => handleOverhangChange('voladizo_frontal_cara_larga', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voladizo_frontal_cara_corta">Frontal cara corta</Label>
                    <Input
                      id="voladizo_frontal_cara_corta"
                      type="number"
                      min="0"
                      step="0.1"
                      value={overhang.voladizo_frontal_cara_corta}
                      onChange={(e) => handleOverhangChange('voladizo_frontal_cara_corta', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Voladizo Lateral */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voladizo_lateral">Voladizo lateral (metros)</Label>
                <Input
                  id="voladizo_lateral"
                  type="number"
                  min="0"
                  step="0.1"
                  value={overhang.voladizo_lateral}
                  onChange={(e) => handleOverhangChange('voladizo_lateral', parseFloat(e.target.value) || 0)}
                />
              </div>

              {overhang.voladizo_lateral > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voladizo_lateral_cara_larga">Lateral cara larga</Label>
                    <Input
                      id="voladizo_lateral_cara_larga"
                      type="number"
                      min="0"
                      step="0.1"
                      value={overhang.voladizo_lateral_cara_larga}
                      onChange={(e) => handleOverhangChange('voladizo_lateral_cara_larga', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voladizo_lateral_cara_corta">Lateral cara corta</Label>
                    <Input
                      id="voladizo_lateral_cara_corta"
                      type="number"
                      min="0"
                      step="0.1"
                      value={overhang.voladizo_lateral_cara_corta}
                      onChange={(e) => handleOverhangChange('voladizo_lateral_cara_corta', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Voladizo Posterior */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voladizo_posterior">Voladizo posterior (metros)</Label>
                <Input
                  id="voladizo_posterior"
                  type="number"
                  min="0"
                  step="0.1"
                  value={overhang.voladizo_posterior}
                  onChange={(e) => handleOverhangChange('voladizo_posterior', parseFloat(e.target.value) || 0)}
                />
              </div>

              {overhang.voladizo_posterior > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voladizo_posterior_cara_larga">Posterior cara larga</Label>
                    <Input
                      id="voladizo_posterior_cara_larga"
                      type="number"
                      min="0"
                      step="0.1"
                      value={overhang.voladizo_posterior_cara_larga}
                      onChange={(e) => handleOverhangChange('voladizo_posterior_cara_larga', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voladizo_posterior_cara_corta">Posterior cara corta</Label>
                    <Input
                      id="voladizo_posterior_cara_corta"
                      type="number"
                      min="0"
                      step="0.1"
                      value={overhang.voladizo_posterior_cara_corta}
                      onChange={(e) => handleOverhangChange('voladizo_posterior_cara_corta', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
