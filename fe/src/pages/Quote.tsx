import { useState } from 'react';
import { Calculator, MapPin, Package, TrendingUp, DollarSign } from 'lucide-react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

// Types
interface ShippingResult {
  municipio: string;
  region: string;
  estado: string;
  tarifaTransporte: number;
  precioBase: number;
  chatarra: number;
  varilla: number;
  gas: number;
  hrcct: number;
  tipoCambio: number;
  precioTotal: number;
  marketPrices: any;
}

// API function to fetch latest market prices
const fetchMarketPrices = async () => {
  const params = new URLSearchParams({
    table_name: 'precios_materiales',
    limit: '1'
  });

  const response = await axios.get(`http://127.0.0.1:8000/api/v1/data/?${params}`);
  const data = response.data.data[0];

  return {
    chatarra: data.scrap_mxn || data.scrap,
    varilla: data.rebar_mxn || data.rebar || data.varilla_distribuidor,
    gas: data.gas_mxn || data.gas,
    hrcct: data.hrcc1_mxn || data.hrcc1,
    tipoCambio: data.tipo_de_cambio,
    precioBase: data.precio_mercado
  };
};

const ShippingCalculator = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    codigoPostal: '',
    peso: '',
    material: 'Chatarra'
  });

  const [result, setResult] = useState<ShippingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const materials = ['Chatarra', 'Varilla', 'Gas', 'HRCCT'];

  // Fetch market prices using React Query
  const { data: marketData, isLoading: marketDataLoading, error: marketDataError } = useQuery({
    queryKey: ['marketPrices'],
    queryFn: fetchMarketPrices,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 600000, // Consider data fresh for 10 minutes
  });
  
  // Calculate shipping using the backend API
  const calculateShipping = async () => {
    // Check if market data is available
    if (!marketData) {
      setError('Los precios de mercado no están disponibles. Por favor, inténtalo más tarde.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData = {
        codigo_postal: formData.codigoPostal,
        peso: parseFloat(formData.peso),
        material: formData.material.toLowerCase()
      };

      const response = await axios.post('http://127.0.0.1:8000/api/v1/quote/calcular-envio', requestData);

      // Transform API response to match component expectations
      const apiResult = response.data;
      const transformedResult = {
        municipio: apiResult.municipio,
        region: apiResult.region,
        estado: apiResult.estado,
        tarifaTransporte: apiResult.tarifa_transporte,
        precioBase: apiResult.precio_material_mxn,
        chatarra: apiResult.market_prices.scrap_mxn,
        varilla: apiResult.market_prices.rebar_mxn,
        gas: apiResult.market_prices.gas_mxn,
        hrcct: apiResult.market_prices.hrcc1_mxn,
        tipoCambio: apiResult.tipo_cambio,
        precioTotal: apiResult.precio_total,
        marketPrices: apiResult.market_prices
      };

      setResult(transformedResult);
      setStep(3);
    } catch (error: any) {
      console.error('Error calculating shipping:', error);
      let errorMessage = 'Error al calcular la cotización. Por favor, inténtalo de nuevo.';

      if (error.response) {
        // Server responded with error status
        if (error.response.status === 404) {
          if (error.response.data.detail?.includes('Código postal')) {
            errorMessage = 'Código postal no encontrado. Verifica que sea correcto.';
          } else if (error.response.data.detail?.includes('precios')) {
            errorMessage = 'No hay precios disponibles en el sistema.';
          }
        } else if (error.response.status === 400) {
          errorMessage = 'Datos inválidos. Verifica el código postal y peso.';
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = () => {
    if (formData.codigoPostal && formData.peso) {
      setStep(2);
    }
  };

  const resetForm = () => {
    setFormData({ codigoPostal: '', peso: '', material: 'Chatarra' });
    setResult(null);
    setError(null);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Calculator className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Calculadora de Envío
          </h1>
          <p className="text-gray-600">
            Ingresa tu código postal y peso para calcular el costo de transporte
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step >= 1 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Datos</span>
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step >= 2 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Confirmar</span>
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step >= 3 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Resultado</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Input */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                  Código Postal
                </label>
                <input
                  type="text"
                  value={formData.codigoPostal}
                  onChange={(e) => setFormData({...formData, codigoPostal: e.target.value})}
                  placeholder="Ej: 45010"
                  maxLength={5}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-lg"
                />
                <p className="mt-1 text-sm text-gray-500">Ingresa los 5 dígitos de tu código postal</p>
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Package className="w-5 h-5 mr-2 text-indigo-600" />
                  Peso (kg)
                </label>
                <input
                  type="number"
                  value={formData.peso}
                  onChange={(e) => setFormData({...formData, peso: e.target.value})}
                  placeholder="Ej: 150"
                  min="15"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-lg"
                />
                <p className="mt-1 text-sm text-gray-500">Peso mínimo: 15 kg</p>
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-5 h-5 mr-2 text-indigo-600" />
                  Material
                </label>
                <select
                  value={formData.material}
                  onChange={(e) => setFormData({...formData, material: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-lg"
                >
                  {materials.map(mat => (
                    <option key={mat} value={mat}>{mat}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCalculate}
                disabled={!formData.codigoPostal || !formData.peso}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center text-lg"
              >
                Calcular Costo
                <Calculator className="ml-2 w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirma tu información</h2>
                <p className="text-gray-600">Verifica que los datos sean correctos</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600 font-medium">Código Postal:</span>
                  <span className="text-xl font-bold text-gray-800">{formData.codigoPostal}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600 font-medium">Peso:</span>
                  <span className="text-xl font-bold text-gray-800">{formData.peso} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Material:</span>
                  <span className="text-xl font-bold text-gray-800">{formData.material}</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Modificar
                </button>
              <button
                onClick={calculateShipping}
                disabled={loading || marketDataLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Calculando...' : marketDataLoading ? 'Cargando precios...' : 'Confirmar'}
              </button>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && result && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Cotización Calculada</h2>
              </div>

              {/* Location Info */}
              <div className="bg-indigo-50 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-indigo-900 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Ubicación
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Municipio:</span>
                    <span className="font-semibold text-gray-800">{result.municipio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Región:</span>
                    <span className="font-semibold text-gray-800">{result.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-semibold text-gray-800">{result.estado}</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Desglose de Costos
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Precio Base ({formData.material}):</span>
                    <span className="font-semibold text-gray-800">
                      ${result.precioBase.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">KG Solicitados:</span>
                    <span className="font-semibold text-gray-800">
                      {formData.peso} kg
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Tarifa de Transporte:</span>
                    <span className="font-semibold text-gray-800">
                      ${result.tarifaTransporte.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Tipo de Cambio:</span>
                    <span className="font-semibold text-gray-800">
                      ${result.tipoCambio.toFixed(2)} MXN/USD
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-xl font-bold text-gray-900">TOTAL:</span>
                    <span className="text-3xl font-bold text-indigo-600">
                      ${result.precioTotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={resetForm}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
              >
                Nueva Cotización
              </button>
            </div>
          )}
        </div>

        {/* Market Info Footer */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
            Precios de Mercado Actuales
          </h3>
          {marketDataLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Cargando precios de mercado...</p>
            </div>
          ) : marketDataError ? (
            <div className="text-center py-4">
              <p className="text-red-600">Error al cargar precios de mercado</p>
            </div>
          ) : marketData ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Chatarra</p>
                <p className="font-bold text-gray-800">${marketData.chatarra.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Varilla</p>
                <p className="font-bold text-gray-800">${marketData.varilla.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Gas</p>
                <p className="font-bold text-gray-800">${marketData.gas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">HRCCT</p>
                <p className="font-bold text-gray-800">${marketData.hrcct.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Tipo Cambio</p>
                <p className="font-bold text-gray-800">${marketData.tipoCambio.toFixed(2)}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export function Quote() {
  return <ShippingCalculator />;
}