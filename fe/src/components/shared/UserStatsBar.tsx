import React from 'react';
import { FileText, DollarSign, Coins, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

interface UserStatsBarProps {
    cotizaciones?: number;
    comprado?: number;
    tokens?: number;
    variacion?: number;
    cp?: string;
    nombreProyecto?: string;
    material?: string;
    volumen?: string;
    onCPChange?: (value: string) => void;
    onNombreProyectoChange?: (value: string) => void;
    onMaterialChange?: (value: string) => void;
    onVolumenChange?: (value: string) => void;
}

const fetchQuotesTotal = async (): Promise<{ total_cotizaciones: number }> => {
  const response = await axios.get('http://127.0.0.1:8000/api/v1/quote/total/')
  return response.data
}

const UserStatsBar: React.FC<UserStatsBarProps> = ({
    cotizaciones: propCotizaciones,
    comprado = 75000,
    tokens = 5,
    variacion = 1.6,
}) => {
  // Fetch quotes total using React Query
  const { data: quotesData, isLoading: quotesLoading } = useQuery({
    queryKey: ['quotesTotal'],
    queryFn: () => fetchQuotesTotal(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 60000, // Consider data fresh for 1 minute
  })

  // Use API data if available, otherwise use prop value as fallback
  const cotizaciones = quotesData?.total_cotizaciones ?? propCotizaciones ?? 0
  return (
    <div className="relative z-10 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Cotizaciones */}
          <div className="flex items-center space-x-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">
                {quotesLoading ? '...' : cotizaciones}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Cotizaciones</div>
            </div>
          </div>

          {/* Comprado */}
          <div className="flex items-center space-x-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">
                {comprado.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Comprado</div>
            </div>
          </div>

          {/* Tokens */}
          <div className="flex items-center space-x-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <Coins className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{tokens}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Tokens</div>
            </div>
          </div>

          {/* Variación */}
          <div className="flex items-center space-x-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className={`text-3xl font-bold ${variacion >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {variacion > 0 ? '+' : ''}{variacion}%
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide whitespace-nowrap">
                Variación Última Cotización
              </div>
            </div>
          </div>
        </div>

        {/* Project Details Section */}
        {/* <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-xl p-4 border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
             CP 
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                CP
              </label>
              <input
                type="text"
                value={cp}
                placeholder="Código Postal"
                className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white"
                onChange={(e) => onCPChange?.(e.target.value)}
              />
            </div>

            {/* Nombre del Proyecto 
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Nombre del Proyecto
              </label>
              <input
                type="text"
                value={nombreProyecto}
                placeholder="Ingresa el nombre"
                className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white"
                onChange={(e) => onNombreProyectoChange?.(e.target.value)}
              />
            </div>

            {/* Material Dropdown 
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Material
              </label>
              <div className="relative">
                <select
                  value={material}
                  onChange={(e) => onMaterialChange?.(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-800 bg-white cursor-pointer"
                >
                  <option value="">Seleccionar material</option>
                  <option value="acero_estructural">Acero Estructural</option>
                  <option value="varilla_corrugada">Varilla Corrugada</option>
                  <option value="lamina_galvanizada">Lámina Galvanizada</option>
                  <option value="perfil_metalico">Perfil Metálico</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600 pointer-events-none" />
              </div>
            </div>

            {/* Volumen Dropdown 
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Volumen
              </label>
              <div className="relative">
                <select
                  value={volumen}
                  onChange={(e) => onVolumenChange?.(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-800 bg-white cursor-pointer"
                >
                  <option value="">Seleccionar volumen</option>
                  <option value="1_10">1 - 10 toneladas</option>
                  <option value="10_50">10 - 50 toneladas</option>
                  <option value="50_100">50 - 100 toneladas</option>
                  <option value="100_plus">100+ toneladas</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600 pointer-events-none" />
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default UserStatsBar;