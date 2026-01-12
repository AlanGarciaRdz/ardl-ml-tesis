import { useState, useEffect } from 'react';
import { Calculator, MapPin, Package, TrendingUp, DollarSign, Search } from 'lucide-react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { ForecastChart, ApiResponse } from '@/components/charts/ForecastChart';
import { VolumeTierAnalysis, getSuggestedVolume } from '@/components/quote/VolumeTierAnalysis';
import { ZipCodeFinder } from '@/components/quote/ZipCodeFinder';

// Types
interface ShippingResult {
  municipio: string;
  region: string;
  estado: string;
  tarifaTransporte: number;
  tarifaPrecioBaseTn: number;
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
    varilla: data.rebar_mxn || data.rebar || data.precio_mercado,
    gas: data.gas_mxn || data.gas,
    hrcct: data.hrcc1_mxn || data.hrcc1,
    tipoCambio: data.tipo_de_cambio,
    precioBase: data.precio_mercado
  };
};

// API function to fetch forecast data
const fetchForecastData = async (): Promise<ApiResponse> => {
  // Calculate date one month ago to limit historical data
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const startDate = oneMonthAgo.toISOString().split('T')[0];
  
  const params = new URLSearchParams({
    table_name: 'precios_materiales',
    limit: '30',
    forecast_periods: '18',
    value_column: 'scrap_mxn',
    transform: 'none',
    model_type: 'lstm',
    use_trained_model: 'true',
    start_date: startDate  
  });

  const response = await axios.get(`http://127.0.0.1:8000/api/v1/forecast/?${params}`);
  return response.data;
};



  

const ShippingCalculator = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    codigoPostal: '',
    peso: '',
    material: 'Varilla'
  });

  const [result, setResult] = useState<ShippingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('user')
  const [suggestedVolume, setSuggestedVolume] = useState<number | null>(null);
  const [currentQuote, setCurrentQuote] = useState<any>(null);
  const [suggestedQuote, setSuggestedQuote] = useState<any>(null);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [isZipFinderOpen, setIsZipFinderOpen] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const materials = ['Varilla'];

  // Fetch market prices using React Query
  const { data: marketData, isLoading: marketDataLoading, error: marketDataError } = useQuery({
    queryKey: ['marketPrices'],
    queryFn: fetchMarketPrices,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 600000, // Consider data fresh for 10 minutes
  });

  // Fetch forecast data for Step 2.5
  const { data: forecastData, isLoading: forecastLoading } = useQuery({
    queryKey: ['forecast', 'quote'],
    queryFn: fetchForecastData,
    enabled: step === 2.5 || step === 2, // Fetch when entering step 2
    staleTime: 600000, // Consider data fresh for 10 minutes
  });
  
  // Calculate price for a specific volume
  const calculatePriceForVolume = async (volume: number) => {
    try {
      const requestData = {
        codigo_postal: formData.codigoPostal,
        peso: volume,
        material: formData.material.toLowerCase()
      };

      const response = await axios.post('http://127.0.0.1:8000/api/v1/quote/calcular-envio', requestData);
      return response.data;
    } catch (error) {
      console.error('Error calculating price for volume:', error);
      return null;
    }
  };

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
        marketPrices: apiResult.market_prices,
        tarifaPrecioBaseTn: apiResult.tarifa_precio_base_tn
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

  const handleConfirm = async () => {
    // Calculate suggested volume for next tier
    const currentVolume = parseFloat(formData.peso);
    const suggested = getSuggestedVolume(currentVolume);
    setSuggestedVolume(suggested);
    
    // Calculate prices for both volumes
    setLoadingPrices(true);
    try {
      // Calculate current volume price
      const currentPrice = await calculatePriceForVolume(currentVolume);
      setCurrentQuote(currentPrice);
      
      // Calculate suggested volume price if exists
      if (suggested) {
        const suggestedPrice = await calculatePriceForVolume(suggested);
        setSuggestedQuote(suggestedPrice);
      }
    } catch (error) {
      console.error('Error calculating prices:', error);
    } finally {
      setLoadingPrices(false);
    }
    
    setStep(2.5);
  };

  const handleContinueWithOriginal = () => {
    calculateShipping();
  };

  const handleAcceptSuggestion = () => {
    if (suggestedVolume) {
      setFormData({ ...formData, peso: suggestedVolume.toString() });
    }
    calculateShipping();
  };

  const resetForm = () => {
    setFormData({ codigoPostal: '', peso: '', material: 'Varilla' });
    setResult(null);
    setError(null);
    setStep(1);
    setSelectedMunicipality('');
  };

  const handleZipCodeSelect = (zipCode: string, municipalityName: string) => {
    setFormData({ ...formData, codigoPostal: zipCode });
    setSelectedMunicipality(municipalityName);
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'user'
    setUserRole(role)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center mb-3 md:mb-4">
            <Calculator className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Cotización
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Ingresa tu código postal y Toneladas de material para obtener una cotización
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6 md:mb-8 px-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 ${
                step >= 1 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 text-gray-400'
              }`}>
                <span className="text-xs sm:text-base font-medium">1</span>
              </div>
              <span className={`mt-1 text-xs sm:text-sm font-medium ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                Datos
              </span>
            </div>
            
            <div className={`w-8 sm:w-12 h-1 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 ${
                step >= 2 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 text-gray-400'
              }`}>
                <span className="text-xs sm:text-base font-medium">2</span>
              </div>
              <span className={`mt-1 text-xs sm:text-sm font-medium ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                Confirmar
              </span>
            </div>
            
            <div className={`w-8 sm:w-12 h-1 ${step >= 2.5 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 ${
                step >= 2.5 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 text-gray-400'
              }`}>
                <span className="text-xs sm:text-base font-medium">3</span>
              </div>
              <span className={`mt-1 text-xs sm:text-sm font-medium ${step >= 2.5 ? 'text-indigo-600' : 'text-gray-400'}`}>
                Análisis
              </span>
            </div>
            
            <div className={`w-8 sm:w-12 h-1 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            
            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 ${
                step >= 3 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 text-gray-400'
              }`}>
                <span className="text-xs sm:text-base font-medium">4</span>
              </div>
              <span className={`mt-1 text-xs sm:text-sm font-medium ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                Resultado
              </span>
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
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          {/* Step 1: Input */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                  Código postal de entrega (a donde enviaremos el acero)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.codigoPostal}
                    onChange={(e) => setFormData({...formData, codigoPostal: e.target.value})}
                    placeholder="Ej: 44100"
                    maxLength={5}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setIsZipFinderOpen(true)}
                    className="px-4 py-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors flex items-center gap-2 font-semibold"
                  >
                    <Search className="w-5 h-5" />
                    <span className="hidden sm:inline">Buscar</span>
                  </button>
                </div>
                {selectedMunicipality && (
                  <p className="mt-2 text-sm text-indigo-600 font-medium">
                    📍 {selectedMunicipality}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Ingresa tu código postal o búscalo por región/municipio
                </p>
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Package className="w-5 h-5 mr-2 text-indigo-600" />
                  Toneladas (Tn)
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
                <p className="mt-1 text-sm text-gray-500">Envio mínimo: 15 Toneladas</p>
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
                  <span className="text-xl font-bold text-gray-800">{formData.peso} Toneladas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Material:</span>
                  <span className="text-xl font-bold text-gray-800">{formData.material}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Modificar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading || marketDataLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Calculando...' : marketDataLoading ? 'Cargando precios...' : 'Continuar'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2.5: Forecast & Tier Analysis */}
          {step === 2.5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Análisis de Precios y Volumen</h2>
                <p className="text-gray-600">Optimiza tu compra con nuestra recomendación</p>
              </div>

              {/* Forecast Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Proyección de Precios</h3>
                {forecastLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-gray-500">Cargando pronósticos...</div>
                  </div>
                ) : forecastData ? (
                  <div className="h-64">
                    <ForecastChart 
                      data={forecastData}
                      showMXN={true}
                      visibleLines={{ precioMercado: true }}
                      height={256}
                      simplified={true}
                    />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No hay datos de pronóstico disponibles
                  </div>
                )}
              </div>

              {/* Volume Tier Analysis */}
              {loadingPrices ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-gray-500">Calculando precios...</div>
                </div>
              ) : currentQuote ? (
                <VolumeTierAnalysis 
                  currentVolume={parseFloat(formData.peso)}
                  currentTotal={currentQuote.precio_total}
                  currentPricePerTon={currentQuote.tarifa_precio_base_tn}
                  suggestedVolume={suggestedVolume}
                  suggestedTotal={suggestedQuote?.precio_total || null}
                  suggestedPricePerTon={suggestedQuote?.tarifa_precio_base_tn || null}
                />
              ) : null}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleContinueWithOriginal}
                  disabled={loading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  Continuar con {formData.peso} Toneladas
                </button>
                {suggestedVolume && (
                  <button
                    onClick={handleAcceptSuggestion}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 shadow-lg"
                  >
                    Actualizar a {suggestedVolume} Toneladas ⭐
                  </button>
                )}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full text-gray-600 hover:text-gray-800 text-sm underline"
              >
                ← Volver a modificar datos
              </button>
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
                <h3 className="font-semibold text-indigo-900 mb-3 flex items-center text-sm sm:text-base">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Ubicación
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Municipio:</span>
                    <span className="font-semibold text-gray-800 text-right">{result.municipio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Región:</span>
                    <span className="font-semibold text-gray-800 text-right">{result.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-semibold text-gray-800 text-right">{result.estado}</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-sm sm:text-base">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Desglose de Costos
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b text-xs sm:text-sm">
                    <span className="text-gray-600">Tonelada Solicitados:</span>
                    <span className="font-semibold text-gray-800">
                      {formData.peso} Toneladas
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b text-xs sm:text-sm">
                    <span className="text-gray-600">Precio base por Tonelada</span>
                    <span className="font-semibold text-gray-800">
                    ${result.tarifaPrecioBaseTn?.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-lg sm:text-xl font-bold text-gray-900">TOTAL:</span>
                    <span className="text-2xl sm:text-3xl font-bold text-indigo-600">
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
        {userRole === 'admin' && (
        <div className="mt-6 md:mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-sm sm:text-base">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
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
                <p className="text-sm text-gray-600 mb-1">Tipo Cambio</p>
                <p className="font-bold text-gray-800">${marketData.tipoCambio.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Varilla</p>
                <p className="font-bold text-gray-800">${marketData.precioBase.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Gas</p>
                <p className="font-bold text-gray-800">${marketData.gas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">HRCCT</p>
                <p className="font-bold text-gray-800">${marketData.hrcct.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
              
            </div>
          ) : null}
        </div>
        )}

        {/* Zip Code Finder Modal */}
        <ZipCodeFinder
          isOpen={isZipFinderOpen}
          onClose={() => setIsZipFinderOpen(false)}
          onSelectZipCode={handleZipCodeSelect}
        />
      </div>
    </div>
  );
};

export function Quote() {
  return <ShippingCalculator />;
}