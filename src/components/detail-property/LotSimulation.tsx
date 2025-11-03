'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  Calculator, 
  Map, 
  FileText, 
  Settings,
  Play,
  Download,
  ExternalLink,
  Loader2
} from 'lucide-react';
import {
  BuildingParameters,
  IsolationSettings,
  OverhangSettings,
  StaircaseSettings,
  PropertyTypeSettings,
  SimulationResults,
  BuildingParametersData,
  IsolationSettingsData,
  OverhangSettingsData,
  StaircaseSettingsData,
  PropertyTypeSettingsData,
  SimulationResultsData
} from './lot-simulation-sections';

interface LotSimulationProps {
  data: any;
}

export default function LotSimulation({ data }: LotSimulationProps) {
  // Estados para los parámetros de simulación
  const [buildingParams, setBuildingParams] = useState<BuildingParametersData>({
    numero_pisos: 5,
    alturapiso: 3.0,
    proporcion_areas_comunes: 20.0,
    shape: 'optimizacion',
    distancia_minima: 10,
    min_area: 620,
    max_area: 800,
    max_blocks: 0,
  });

  const [isolationSettings, setIsolationSettings] = useState<IsolationSettingsData>({
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
  });

  const [overhangSettings, setOverhangSettings] = useState<OverhangSettingsData>({
    voladizo_frontal: 0.0,
    voladizo_lateral: 0.0,
    voladizo_posterior: 0.0,
    voladizo_frontal_cara_larga: 0.0,
    voladizo_frontal_cara_corta: 0.0,
    voladizo_lateral_cara_larga: 0.0,
    voladizo_lateral_cara_corta: 0.0,
    voladizo_posterior_cara_larga: 0.0,
    voladizo_posterior_cara_corta: 0.0,
  });

  const [staircaseSettings, setStaircaseSettings] = useState<StaircaseSettingsData>({
    escalones_config: [],
  });

  const [propertyTypeSettings, setPropertyTypeSettings] = useState<PropertyTypeSettingsData>({
    inputvar_tipologia: [],
  });

  // Estados para la simulación
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResultsData | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Función para ejecutar la simulación
  const handleSimulate = async () => {
    setIsSimulating(true);
    setShowResults(false);
    
    try {
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Datos de ejemplo para la simulación
      const mockResults: SimulationResultsData = {
        area_total_construida: 2500.5,
        area_total_vendible: 2000.4,
        recaudo_estimado: 1500000000,
        avaluo_catastral_total: 500000000,
        avaluo_catastral_suelo_mt2: 2500000,
        propietarios: 3,
        area_terreno: 800.0,
        area_construida_actual: 600.0,
        estrato: 4,
        numero_predios: 2,
        pisos_maximos_construidos: 3,
        sotanos: 0,
        antiguedad_minima: 15,
        antiguedad_maxima: 25,
        esquinero: 'Sí',
        via_principal: 'Carrera 7',
        impuesto_predial_total: 2500000,
        predial_suelo_mt2: 12500,
        area_poligono: 800.0,
        aislamiento_frontal: buildingParams.numero_pisos > 5 ? 3 : 0,
        aislamiento_lateral: 2,
        aislamiento_posterior: 2,
        area_terreno_despues_aislamientos: 750.0,
        voladizo_frontal: overhangSettings.voladizo_frontal,
        voladizo_lateral: overhangSettings.voladizo_lateral,
        voladizo_posterior: overhangSettings.voladizo_posterior,
        superficie_edificio: 600.0,
        numero_pisos: buildingParams.numero_pisos,
        altura: buildingParams.numero_pisos * buildingParams.alturapiso,
        area_total_construida_supuestos: 2500.5,
        area_total_vendible_supuestos: 2000.4,
        numero_lotes_colindantes: 8,
        maximo_pisos_colindantes: 6,
        tabla_plantas: [
          {
            de_planta: 1,
            a_planta: 1,
            superficie_construida_planta: 600.0,
            superficie_vendible_planta: 480.0,
            superficie_construida_total: 600.0,
            superficie_vendible_total: 480.0,
          },
          {
            de_planta: 2,
            a_planta: 5,
            superficie_construida_planta: 600.0,
            superficie_vendible_planta: 480.0,
            superficie_construida_total: 2400.0,
            superficie_vendible_total: 1920.0,
          },
        ],
        tabla_recaudo: [
          {
            tipo_inmueble: 'Apartamento',
            precio_mt2: '$2,500,000',
            superficie_construida: 1920.0,
            superficie_vendible: 1536.0,
            recaudo: '$3,840,000,000',
          },
          {
            tipo_inmueble: 'Oficina',
            precio_mt2: '$3,000,000',
            superficie_construida: 480.0,
            superficie_vendible: 384.0,
            recaudo: '$1,152,000,000',
          },
        ],
        pot_info: {
          tipo_tratamiento: 'Tratamiento de Renovación Urbana',
          tipologia: 'Mixta',
          acto_admin: 'Decreto 555 de 2023',
          altura_maxima_tratamiento: '12 pisos',
          area_actividad: 'Centro de la ciudad',
          actuacion_estrategica: 'Renovación urbana',
          priorizacion: 'Alta',
          antejardin_descripcion: 'Mínimo 3 metros',
          antejardin_dimension: '3.0 m',
          altura_aeronautica: 'No aplica',
          elevacion_aeronautica: 'No aplica',
          clasificacion_suelo: 'Suelo urbano',
          perimetro_urbano: 'Dentro del perímetro',
          upl: 'UPL Centro',
        },
      };
      
      setSimulationResults(mockResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error en la simulación:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleGeneratePDF = () => {
    console.log('Generando PDF...');
    // Implementar generación de PDF
  };

  const handleViewNewProjects = () => {
    console.log('Viendo proyectos nuevos...');
    // Implementar navegación a proyectos nuevos
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 rounded-xl shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Building className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Simulación de Desarrollo del Lote</h1>
        </div>
        <p className="text-purple-100 text-lg">
          Análisis de cabida y potencial de desarrollo del terreno
        </p>
      </div>

      {/* Configuración de Parámetros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda - Parámetros */}
        <div className="space-y-6">
          <BuildingParameters
            onParametersChange={setBuildingParams}
            initialParameters={buildingParams}
          />
          
          <IsolationSettings
            onIsolationChange={setIsolationSettings}
            initialIsolation={isolationSettings}
          />
          
          <OverhangSettings
            onOverhangChange={setOverhangSettings}
            initialOverhang={overhangSettings}
          />
        </div>

        {/* Columna Derecha - Configuraciones Avanzadas */}
        <div className="space-y-6">
          <StaircaseSettings
            onStaircaseChange={setStaircaseSettings}
            initialStaircase={staircaseSettings}
            numeroPisos={buildingParams.numero_pisos}
          />
          
          <PropertyTypeSettings
            onPropertyTypeChange={setPropertyTypeSettings}
            initialPropertyType={propertyTypeSettings}
            numeroPisos={buildingParams.numero_pisos}
          />
        </div>
      </div>

      {/* Botón de Simulación */}
      <div className="flex justify-center">
        <Button
          onClick={handleSimulate}
          disabled={isSimulating}
          size="lg"
          className="px-8 py-3 text-lg"
        >
          {isSimulating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Simulando...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Ejecutar Simulación
            </>
          )}
        </Button>
      </div>

      {/* Resultados de la Simulación */}
      {showResults && simulationResults && (
        <SimulationResults
          data={simulationResults}
          onGeneratePDF={handleGeneratePDF}
          onViewNewProjects={handleViewNewProjects}
        />
      )}

      {/* Información Adicional */}
      {!showResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Parámetros de Construcción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Configure los parámetros básicos del edificio, aislamientos, voladizos y 
                configuraciones avanzadas como edificios escalonados.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-green-600" />
                Cálculos de Cabida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                El sistema calculará automáticamente el área construible, número de pisos 
                óptimo, tipologías y potencial de recaudo.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}