import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import UserStatsBar from '../components/shared/UserStatsBar';
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {  RefreshCw, Calculator } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import { Switch } from '@/components/ui/switch'

// Types for the API response
interface MaterialPrice {
  id: number
  date: string
  varilla_distribuidor: number
  varilla_credito: number
  precio_mercado: number,
  scrap_mxn: number,
  scrap: number,
  gas: number,
  gas_mxn: number,
  rebar: number,
  rebar_mxn: number,
  hrcc1: number,
  hrcc1_mxn: number,
  tipoDeCambio: number
}

interface ForecastPrice {
  id: number,
  date: string,
  period: number,
  predicted_value: number,
  confidence_interval: {
    lower: number,
    upper: number
  }
}

interface ValidationPrice {
  id: number,
  date: string,
  period: number,
  predicted_value: number,
}

interface ApiResponse {
  data: MaterialPrice[]
  validation: ValidationPrice[],
  forecast: ForecastPrice[]
  total_count: number
  limit: number
  offset: number
  startDate: string
}

interface CorrelationRequest {
  data: MaterialPrice[]
  field1: string
  field2: string
}

interface CorrelationResponse {
  correlation_coefficient: number
  p_value: number
  field1: string
  field2: string
  sample_size: number
  interpretation: string
}

// API function to fetch data
const fetchMaterialPrices = async (startDate?: string, endDate?: string, transform?: string, forecast_periods?: string): Promise<ApiResponse> => {
  const params = new URLSearchParams({
    table_name: 'precios_materiales',
    limit: '200',
    forecast_periods: forecast_periods || '7',
    value_column: "precio_mercado",
    transform: transform || ''
  })
  
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)
  
  //const response = await axios.get(`http://127.0.0.1:8000/api/v1/data/?${params}`)
  const response = await axios.get(`http://127.0.0.1:8000/api/v1/forecast/?${params}`)
  console.log(response)
  return response.data
}


// API function to calculate correlation using the new service
const calculateCorrelation = async (request: CorrelationRequest): Promise<CorrelationResponse> => {
  const analysisRequest = {
    analysis_type: 'correlation',
    data: request.data,
    parameters: {
      field1: request.field1,
      field2: request.field2
    }
  }
  const response = await axios.post('http://127.0.0.1:8000/api/v1/ml/analyze', analysisRequest)
  return response.data.result
}




export function Analytics() {
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState('2025-01-01')
  const today = new Date().toISOString().split('T')[0]
  const [endDate, setEndDate] = useState(today)
  const [correlationField1, setCorrelationField1] = useState('varilla_distribuidor')
  const [correlationField2, setCorrelationField2] = useState('varilla_credito')
  const [correlationResult, setCorrelationResult] = useState<CorrelationResponse | null>(null)
  const [isCalculatingCorrelation, setIsCalculatingCorrelation] = useState(false)

  const { isLoggedIn } = useAuth();
  const [material, setMaterial] = useState('');
  const [volumen, setVolumen] = useState('');
  const [showMXN, setShowMXN] = useState(true) // true = MXN, false = USD

  // Add state for line visibility - all visible by default
  const [visibleLines, setVisibleLines] = useState({
    scrap_mxn: true,
    rebar_mxn: true,
    gas_mxn: true,
    precioMercado: true,
    hrcc1_mxn: true,
    
    varillaDistribuidor: true,
    varillaCredito: true,
    precioMercadoValidation: true,

    scrap: true,
    gas: true,
    rebar: true,
    hrcc1: true,
    tipoDeCambio: true
  })

  // Toggle function for line visibility
  const toggleLine = (lineKey: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({
      ...prev,
      [lineKey]: !prev[lineKey]
    }))
  }

  // Function to set date range based on preset buttons
  const setDateRange = (period: string) => {
    const today = new Date()
    const endDate = today.toISOString().split('T')[0]
    let startDate = new Date()

    switch (period) {
      case '5D':
        startDate.setDate(today.getDate() - 5)
        break
      case '1M':
        startDate.setMonth(today.getMonth() - 1)
        break
      case '6M':
        startDate.setMonth(today.getMonth() - 6)
        break
      case 'YTD':
        startDate = new Date(today.getFullYear(), 0, 1)
        break
      case '1Y':
        startDate.setFullYear(today.getFullYear() - 1)
        break
      case '5Y':
        startDate.setFullYear(today.getFullYear() - 5)
        break
      default:
        return
    }

    setStartDate(startDate.toISOString().split('T')[0])
    setEndDate(endDate)
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['materialPrices', startDate, endDate],
    queryFn: () => fetchMaterialPrices(startDate, endDate),
    refetchInterval: false,
    staleTime: 0, // Force refetch when dates change
    gcTime: 0, // Don't cache results
  })

    // Query for secondary chart (gas, scrap, rebar, hrcc1)
    const { data: secondaryData, isLoading: secondaryLoading, error: secondaryError, refetch: refetchSecondary } = useQuery({
      queryKey: ['materialPrices', startDate, endDate, 'secondary'],
      queryFn: () => fetchMaterialPrices(startDate, endDate, 'normalize', '1'), //["log", "sqrt", "normalize"
      refetchInterval: false,
      staleTime: 0,
      gcTime: 0,
    })

  

  const handleCorrelationCalculation = async () => {
    if (!data?.data) return
    
    setIsCalculatingCorrelation(true)
    try {
      const result = await calculateCorrelation({
        data: data.data,
        field1: correlationField1,
        field2: correlationField2
      })
      setCorrelationResult(result)
    } catch (error) {
      console.error('Error calculating correlation:', error)
    } finally {
      setIsCalculatingCorrelation(false)
    }
  }

  const fieldOptions = [
    { value: 'varilla_distribuidor', label: t('analytics.varillaDistribuidor') },
    { value: 'varilla_credito', label: t('analytics.varillaCredito') },
    { value: 'precio_mercado', label: t('analytics.precioMercado') },
    { value: 'tipoDeCambio', label: t('analytics.tipoDeCambio') },    
    { value: 'scrap_mxn', label: t('analytics.scrap_mxn') },
    { value: 'rebar_mxn', label: t('analytics.rebar_mxn') },
    { value: 'hrcc1_mxn', label: t('analytics.hrcc1_mxn') },
    { value: 'gas_mxn', label: t('analytics.gas_mxn') },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('analytics.title')}</h1>
        <p className="text-gray-600">{t('analytics.subtitle')}</p>
      </div>

      {/* Stats Bar - Only show when logged in */}
      {isLoggedIn && (
        <UserStatsBar
          cotizaciones={10}
          comprado={75000}
          tokens={5}
          variacion={1.6}
          cp=""
          nombreProyecto=""
          material={material}
          volumen={volumen}
          onMaterialChange={setMaterial}
          onVolumenChange={setVolumen}
        />
      )}


      {/* Date Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.dateRangeFilter')}</CardTitle>
          <CardDescription>{t('analytics.selectDateRange')}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Preset Date Range Buttons */}
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              {t('analytics.quickSelect') || 'Quick Select'}
            </Label>
            <div className="flex flex-wrap gap-2">
              {['5D', '1M', '6M', 'YTD', '1Y', '5Y'].map((period) => (
                <Button
                  key={period}
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(period)}
                  className="text-xs"
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>

          {/* Manual Date Selection */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="start-date">{t('analytics.startDate')}</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="end-date">{t('analytics.endDate')}</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t('analytics.updateData')}
            </Button>
          </div>
        </CardContent>
      </Card>

      

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.priceTrendsAnalysis')}</CardTitle>
            <CardDescription>{t('analytics.priceMovements', { startDate, endDate })}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add line visibility controls */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {/* Currency Toggle */}
              <div className="mb-4 pb-4 border-b border-gray-300 dark:border-gray-600">
                <Label className="text-sm font-medium mb-2 block">
                  Moneda / Currency
                </Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="currency_toggle"
                      checked={showMXN}
                      onCheckedChange={setShowMXN}
                    />
                    <Label htmlFor="currency_toggle" className="text-sm cursor-pointer">
                      {showMXN ? 'MXN (Pesos)' : 'USD (Dólares)'}
                    </Label>
                  </div>
                  <span className="text-xs text-gray-500">
                    Mostrando: {showMXN ? 'Valores en MXN' : 'Valores en USD'}
                  </span>
                </div>
              </div>

              <Label className="text-sm font-medium mb-3 block">
                {t('analytics.showLines') || 'Mostrar líneas en el gráfico'}
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Show switches based on currency */}
                {showMXN ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="scrap_mxn"
                        checked={visibleLines.scrap_mxn}
                        onCheckedChange={() => toggleLine('scrap_mxn')}
                      />
                      <Label htmlFor="scrap_mxn" className="text-sm cursor-pointer">
                        {t('analytics.scrap_mxn') || 'Chatarra MXN'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="rebar_mxn"
                        checked={visibleLines.rebar_mxn}
                        onCheckedChange={() => toggleLine('rebar_mxn')}
                      />
                      <Label htmlFor="rebar_mxn" className="text-sm cursor-pointer">
                        {t('analytics.rebar_mxn') || 'Varilla MXN'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="gas_mxn"
                        checked={visibleLines.gas_mxn}
                        onCheckedChange={() => toggleLine('gas_mxn')}
                      />
                      <Label htmlFor="gas_mxn" className="text-sm cursor-pointer">
                        {t('analytics.gas_mxn') || 'Gas MXN'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hrcc1_mxn"
                        checked={visibleLines.hrcc1_mxn}
                        onCheckedChange={() => toggleLine('hrcc1_mxn')}
                      />
                      <Label htmlFor="hrcc1_mxn" className="text-sm cursor-pointer">
                        {t('analytics.hrcc1_mxn') || 'HRCC1 MXN'}
                      </Label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="scrap"
                        checked={visibleLines.scrap}
                        onCheckedChange={() => toggleLine('scrap')}
                      />
                      <Label htmlFor="scrap" className="text-sm cursor-pointer">
                        {t('analytics.scrap') || 'Chatarra USD'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="rebar"
                        checked={visibleLines.rebar}
                        onCheckedChange={() => toggleLine('rebar')}
                      />
                      <Label htmlFor="rebar" className="text-sm cursor-pointer">
                        {t('analytics.rebar') || 'Varilla USD'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="gas"
                        checked={visibleLines.gas}
                        onCheckedChange={() => toggleLine('gas')}
                      />
                      <Label htmlFor="gas" className="text-sm cursor-pointer">
                        {t('analytics.gas') || 'Gas USD'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hrcc1"
                        checked={visibleLines.hrcc1}
                        onCheckedChange={() => toggleLine('hrcc1')}
                      />
                      <Label htmlFor="hrcc1" className="text-sm cursor-pointer">
                        {t('analytics.hrcc1') || 'HRCC1 USD'}
                      </Label>
                    </div>
                  </>
                )}
                {/* These are always shown regardless of currency */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="tipoDeCambio"
                    checked={visibleLines.tipoDeCambio}
                    onCheckedChange={() => toggleLine('tipoDeCambio')}
                  />
                  <Label htmlFor="tipoDeCambio" className="text-sm cursor-pointer">
                    {t('analytics.tipoDeCambio')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="precioMercado"
                    checked={visibleLines.precioMercado}
                    onCheckedChange={() => toggleLine('precioMercado')}
                  />
                  <Label htmlFor="precioMercado" className="text-sm cursor-pointer">
                    {t('analytics.precioMercado')}
                  </Label>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{t('common.loading')}</span>
                </div>
              </div>
            ) : error ? (
              <div className="h-80 flex items-center justify-center text-red-500">
                <div className="text-center">
                  <p>{t('errors.serverError')}</p>
                  <Button variant="outline" onClick={() => refetch()} className="mt-2">
                    {t('common.refresh')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-80">
                {(() => {
                  // Transform data for the chart
                  const historicalData = data?.data?.map(item => ({
                    date: new Date(item.date).toLocaleDateString('es-MX', { 
                      month: 'short', 
                      day: 'numeric' 
                    }),
                    fullDate: item.date,
                    // MXN values
                    [t('analytics.scrap_mxn')]: item.scrap_mxn,
                    [t('analytics.rebar_mxn')]: item.rebar_mxn,
                    [t('analytics.gas_mxn')]: item.gas_mxn,
                    [t('analytics.hrcc1_mxn')]: item.hrcc1_mxn,
                    // USD values
                    [t('analytics.scrap')]: item.scrap,
                    [t('analytics.rebar')]: item.rebar,
                    [t('analytics.gas')]: item.gas,
                    [t('analytics.hrcc1')]: item.hrcc1,
                    // Other values (always shown)
                    [t('analytics.precioMercado')]: item.precio_mercado,
                    [t('analytics.varillaDistribuidor')]: item.varilla_distribuidor,
                    [t('analytics.varillaCredito')]: item.varilla_credito,
                    [t('analytics.tipoDeCambio')]: item.tipoDeCambio,
                    type: 'historical'
                  })) || []

                  // Calculate validation period (7 days before selected start date)
                  const validationData = [];
                  if (historicalData.length > 0 && data?.startDate) {
                    const startDate = new Date(data.startDate);
                    const validationStartDate = new Date(startDate);
                    validationStartDate.setDate(validationStartDate.getDate() - 7);
                    
                    // Filter historical data for the validation period
                    validationData.push(...historicalData.filter(item => {
                      const itemDate = new Date(item.fullDate);
                      return itemDate >= validationStartDate && itemDate < startDate;
                    }).map(item => ({
                      ...item,
                      type: 'validation'
                    })));
                  }

                 
                  const forecastData = data?.forecast?.map((item) => {
                    return {
                      date: new Date(item.date).toLocaleDateString('es-MX', { 
                        month: 'short', 
                        day: 'numeric' 
                      }),
                      fullDate: item.date,
                      [t('analytics.varillaDistribuidor')]: null,
                      [t('analytics.varillaCredito')]: null,
                      [t('analytics.precioMercado')]: null,
                      [`${t('analytics.precioMercado')} (Validation)`]: item.predicted_value,
                      type: 'forecast'
                    };
                  }) || [];
                  
                  const combinedData = [...historicalData, ...forecastData];
                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={combinedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                          domain={['dataMin - 100', 'dataMax + 100']}
                          allowDataOverflow
                        />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            `$${value.toLocaleString()}`, 
                            name
                          ]}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                              const dataType = payload[0].payload.type;
                              const typeLabel = dataType === 'forecast' ? ' (Forecast)' : 
                                               dataType === 'validation' ? ' (Validation)' : '';
                              return `Date: ${payload[0].payload.fullDate}${typeLabel}`;
                            }
                            return label
                          }}
                        />
                        <Legend />
                        {showMXN ? (
                          <>
                            {visibleLines.scrap_mxn && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.scrap_mxn')} 
                                stroke="#3b82f6"  
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                            {visibleLines.rebar_mxn && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.rebar_mxn')} 
                                stroke="#06b6d4" 
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                            {visibleLines.gas_mxn && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.gas_mxn')} 
                                stroke="#6aa84f" 
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                            {visibleLines.hrcc1_mxn && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.hrcc1_mxn')} 
                                stroke="#741b47" 
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                          </>
                        ) : (
                          <>
                            {visibleLines.scrap && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.scrap')} 
                                stroke="#8b5cf6" 
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                            {visibleLines.rebar && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.rebar')} 
                                stroke="#06b6d4" 
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                            {visibleLines.gas && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.gas')} 
                                stroke="#6aa84f" 
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                            {visibleLines.hrcc1 && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.hrcc1')} 
                                stroke="#741b47" 
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                          </>
                        )}
                        {/* Always show these regardless of currency */}
                        {visibleLines.tipoDeCambio && (
                          <Line 
                            type="monotone" 
                            dataKey={t('analytics.tipoDeCambio')} 
                            stroke="#10b981"  
                            strokeWidth={2}
                            dot={false}
                          />
                        )}
                        {visibleLines.precioMercado && (
                          <Line 
                            type="monotone" 
                            dataKey={t('analytics.precioMercado')} 
                            stroke="#f59e0b" 
                            strokeWidth={2}
                            dot={false}
                          />
                        )}
                        
                      </LineChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      

      {/* Gas, scrap,  Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.priceTrendsAnalysis')}</CardTitle>
            <CardDescription>{t('analytics.priceMovements', { startDate, endDate })}</CardDescription>
          </CardHeader>
          <CardContent>
            {secondaryLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{t('common.loading')}</span>
                </div>
              </div>
            ) : secondaryError ? (
              <div className="h-80 flex items-center justify-center text-red-500">
                <div className="text-center">
                  <p>{t('errors.serverError')}</p>
                  <Button variant="outline" onClick={() => refetchSecondary()} className="mt-2">
                    {t('common.refresh')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-80">
                {(() => {
                  // Transform data for the chart
                  const historicalData = secondaryData?.data?.map(item => ({
                    date: new Date(item.date).toLocaleDateString('es-MX', { 
                      month: 'short', 
                      day: 'numeric' 
                    }),
                    fullDate: item.date,
                    // MXN values
                    [t('analytics.scrap_mxn')]: item.scrap_mxn,
                    [t('analytics.rebar_mxn')]: item.rebar_mxn,
                    [t('analytics.gas_mxn')]: item.gas_mxn,
                    [t('analytics.hrcc1_mxn')]: item.hrcc1_mxn,
                    // USD values
                    [t('analytics.scrap')]: item.scrap,
                    [t('analytics.rebar')]: item.rebar,
                    [t('analytics.gas')]: item.gas,
                    [t('analytics.hrcc1')]: item.hrcc1,
                    // Other values (always shown)
                    [t('analytics.precioMercado')]: item.precio_mercado,
                    [t('analytics.varillaDistribuidor')]: item.varilla_distribuidor,
                    [t('analytics.varillaCredito')]: item.varilla_credito,
                    [t('analytics.tipoDeCambio')]: item.tipoDeCambio,
                    type: 'historical'
                  })) || [] 

                  // Calculate validation period (7 days before selected start date)
                  const validationData = [];
                  if (historicalData.length > 0 && data?.startDate) {
                    const startDate = new Date(data.startDate);
                    const validationStartDate = new Date(startDate);
                    validationStartDate.setDate(validationStartDate.getDate() - 7);
                    
                    // // Filter historical data for the validation period
                    // validationData.push(...historicalData.filter(item => {
                    //   const itemDate = new Date(item.fullDate);
                    //   return itemDate >= validationStartDate && itemDate < startDate;
                    // }).map(item => ({
                    //   ...item,
                    //   type: 'validation'
                    // })));
                  }

                 
                  const forecastData = data?.forecast?.map((item) => {
                    return {
                      date: new Date(item.date).toLocaleDateString('es-MX', { 
                        month: 'short', 
                        day: 'numeric' 
                      }),
                      fullDate: item.date,
                      [t('analytics.varillaDistribuidor')]: null,
                      [t('analytics.varillaCredito')]: null,
                      [t('analytics.precioMercado')]: null,
                      //[`${t('analytics.precioMercado')} (Validation)`]: item.predicted_value,
                      type: 'forecast'
                    };
                  }) || [];
                  
                  //const combinedData = [...historicalData, ...forecastData];
                  const combinedData = historicalData
                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={combinedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                          domain={['dataMin - .9', 'dataMax + .9']}
                          allowDataOverflow
                        />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            `$${value.toLocaleString()}`, 
                            name
                          ]}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                              const dataType = payload[0].payload.type;
                              const typeLabel = dataType === 'forecast' ? ' (Forecast)' : 
                                               dataType === 'validation' ? ' (Validation)' : '';
                              return `Date: ${payload[0].payload.fullDate}${typeLabel}`;
                            }
                            return label
                          }}
                        />
                        <Legend />
                        {showMXN ? (
                          <>
                            {visibleLines.scrap_mxn && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.scrap_mxn')} 
                                stroke="#3b82f6"  
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                            {visibleLines.rebar_mxn && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.rebar_mxn')} 
                                stroke="#06b6d4" 
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                            {visibleLines.gas_mxn && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.gas_mxn')} 
                                stroke="#6aa84f" 
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                            {visibleLines.hrcc1_mxn && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.hrcc1_mxn')} 
                                stroke="#741b47" 
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                          </>
                        ) : (
                          <>
                            {visibleLines.scrap && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.scrap')} 
                                stroke="#8b5cf6" 
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                            {visibleLines.rebar && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.rebar')} 
                                stroke="#06b6d4" 
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                            {visibleLines.gas && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.gas')} 
                                stroke="#6aa84f" 
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                            {visibleLines.hrcc1 && (
                              <Line 
                                type="monotone" 
                                dataKey={t('analytics.hrcc1')} 
                                stroke="#741b47" 
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                          </>
                        )}
                        {/* Always show these regardless of currency */}
                        {visibleLines.tipoDeCambio && (
                          <Line 
                            type="monotone" 
                            dataKey={t('analytics.tipoDeCambio')} 
                            stroke="#10b981"  
                            strokeWidth={2}
                            dot={false}
                          />
                        )}
                        {visibleLines.precioMercado && (
                          <Line 
                            type="monotone" 
                            dataKey={t('analytics.precioMercado')} 
                            stroke="#f59e0b" 
                            strokeWidth={2}
                            dot={false}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

       
      </div>

      {/* Correlation Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.correlationAnalysis')}</CardTitle>
          <CardDescription>{t('analytics.correlationDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="field1">{t('analytics.firstField')}</Label>
                <select
                  id="field1"
                  value={correlationField1}
                  onChange={(e) => setCorrelationField1(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fieldOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="field2">{t('analytics.secondField')}</Label>
                <select
                  id="field2"
                  value={correlationField2}
                  onChange={(e) => setCorrelationField2(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fieldOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button 
                onClick={handleCorrelationCalculation}
                disabled={isCalculatingCorrelation || !data?.data}
              >
                <Calculator className={`h-4 w-4 mr-2 ${isCalculatingCorrelation ? 'animate-spin' : ''}`} />
                {t('analytics.calculateCorrelation')}
              </Button>
            </div>
            
            {correlationResult && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">{t('analytics.correlationResults')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('analytics.correlationCoefficient')}:</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {correlationResult.correlation_coefficient.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('analytics.interpretation')}:</p>
                    <p className="text-sm font-medium text-blue-800">
                      {correlationResult.interpretation}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('analytics.pValue')}:</p>
                    <p className="text-sm font-medium">
                      {correlationResult.p_value.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('analytics.sampleSize')}:</p>
                    <p className="text-sm font-medium">
                      {correlationResult.sample_size} {t('analytics.dataPoints')}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">{t('analytics.pearsonFormula')}:</p>
                  <InlineMath math="r = \frac{\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_{i=1}^{n}(x_i - \bar{x})^2 \sum_{i=1}^{n}(y_i - \bar{y})^2}}" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      

      {/* Statistical Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Statistical Insights</CardTitle>
          <CardDescription>Key metrics and correlations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0.43337</div>
              <p className="text-sm text-gray-600">Correlation Coefficient</p>
              <p className="text-xs text-gray-500">Gas vs. Rebar </p>
              <div className="mt-2 text-xs text-gray-400">
               {/* Pearson correlation formula */}
                <BlockMath math={
                  String.raw`r = \frac{\text{Cov}(X,Y)}{\sigma_X \cdot \sigma_Y}`
                } />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">12.3%</div>
              <p className="text-sm text-gray-600">Annual Volatility</p>
              <p className="text-xs text-gray-500">Average across materials</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0.92</div>
              <p className="text-sm text-gray-600">R² Score</p>
              <p className="text-xs text-gray-500">Forecast accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Patterns</CardTitle>
            <CardDescription>Recurring price patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chart placeholder - Seasonal decomposition
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Material Clusters</CardTitle>
            <CardDescription>Grouping by price behavior</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chart placeholder - Clustering analysis
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export & Share</CardTitle>
          <CardDescription>Download analysis results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">Export as PDF</Button>
            <Button variant="outline">Export as Excel</Button>
            <Button variant="outline">Share Dashboard</Button>
            <Button variant="outline">Schedule Reports</Button>
          </div>
        </CardContent>
      </Card>


      {/* <Card>
          <CardHeader>
            <CardTitle>Volatility Analysis</CardTitle>
            <CardDescription>Price volatility patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-gray-500">
              Chart placeholder - Volatility heatmap or chart
            </div>
          </CardContent>
        </Card> */}
    </div>
  )
}
