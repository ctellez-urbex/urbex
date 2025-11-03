/**
 * ListingsGrid Component
 * Displays property listings with images and details
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Home, Bed, Bath, Car, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Listing {
  codigoPropiedad?: string;
  tipoNegocio?: string;
  tipoInmueble?: string;
  precioTotal?: number;
  precioPorM2?: number;
  direccionCompleta?: string;
  urlImagenes?: string;
  caracteristicas?: {
    areaConstruida?: number;
    numeroHabitaciones?: number;
    numeroBanos?: number;
    numeroGarajes?: number;
  };
  estadoListado?: string;
  fechaPublicacion?: string;
  diasEnMercado?: number;
}

interface ListingsGridProps {
  data: Listing[];
  title?: string;
}

const formatCurrency = (value: any): string => {
  if (value == null || isNaN(Number(value))) return '-';
  return `$${Number(value).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
};

export default function ListingsGrid({ data, title = 'Listings' }: ListingsGridProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {title} ({data.length})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((listing, index) => {
          const mainImage = listing.urlImagenes?.split('|')[0]?.trim() || 
                           'https://personal-data-bucket-online.s3.us-east-2.amazonaws.com/sin_imagen.png';
          
          const isActive = listing.estadoListado === 'Activo';
          
          return (
            <Card 
              key={index}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                <img
                  src={mainImage}
                  alt={listing.direccionCompleta || 'Propiedad'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 
                      'https://personal-data-bucket-online.s3.us-east-2.amazonaws.com/sin_imagen.png';
                  }}
                />
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge 
                    className={isActive 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-500 text-white'
                    }
                  >
                    {listing.estadoListado || 'Desconocido'}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(listing.precioTotal)}
                  </span>
                  {listing.caracteristicas?.areaConstruida && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {listing.caracteristicas.areaConstruida} m²
                    </span>
                  )}
                </div>

                {/* Features */}
                {listing.tipoInmueble?.toLowerCase().includes('apartamento') || 
                 listing.tipoInmueble?.toLowerCase().includes('casa') ? (
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                    {listing.caracteristicas?.numeroHabitaciones ? (
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span className="text-sm">
                          {Math.floor(listing.caracteristicas.numeroHabitaciones)}
                        </span>
                      </div>
                    ) : null}
                    {listing.caracteristicas?.numeroBanos ? (
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span className="text-sm">
                          {Math.floor(listing.caracteristicas.numeroBanos)}
                        </span>
                      </div>
                    ) : null}
                    {listing.caracteristicas?.numeroGarajes ? (
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        <span className="text-sm">
                          {Math.floor(listing.caracteristicas.numeroGarajes)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* Address */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {listing.direccionCompleta || 'Sin dirección'}
                </p>

                {/* Details List */}
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Tipo de negocio:</span>
                    <span className="font-semibold">{listing.tipoNegocio || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tipo de inmueble:</span>
                    <span className="font-semibold">{listing.tipoInmueble || '-'}</span>
                  </div>
                  {listing.precioPorM2 && (
                    <div className="flex justify-between">
                      <span>Valor m²:</span>
                      <span className="font-semibold">{formatCurrency(listing.precioPorM2)}</span>
                    </div>
                  )}
                  {listing.fechaPublicacion && (
                    <div className="flex justify-between">
                      <span>Fecha publicación:</span>
                      <span className="font-semibold">{listing.fechaPublicacion}</span>
                    </div>
                  )}
                  {listing.diasEnMercado != null && (
                    <div className="flex justify-between">
                      <span>Días en el mercado:</span>
                      <span className="font-semibold">{listing.diasEnMercado}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

