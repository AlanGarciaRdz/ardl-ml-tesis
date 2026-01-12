import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import UserStatsBar from '../components/shared/UserStatsBar';
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import 'katex/dist/katex.min.css'
import { BlockMath } from 'react-katex'
import { Switch } from '@/components/ui/switch'
import { ForecastChart } from '@/components/charts/ForecastChart'

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
  tipo_de_cambio: number
}

interface ForecastPrice {
  id: number,
  date: string,
  period: number,
  predicted_value_bajista: number,
  predicted_value_conservador: number,
  predicted_value_alza: number,
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

// API function to fetch data
const fetchMaterialPrices = async (startDate?: string, endDate?: string, transform?: string, forecast_periods?: string, modelType?: string, value_column?: string): Promise<ApiResponse> => {
  const params = new URLSearchParams({
    table_name: 'precios_materiales',
    limit: '200',
    forecast_periods: forecast_periods || '18',
    value_column: value_column || "scrap_mxn",
    transform: transform || 'none',
    model_type: modelType || 'lstm',
    use_trained_model: 'true'
  })

  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  //const response = await axios.get(`http://127.0.0.1:8000/api/v1/data/?${params}`)
  const response = await axios.get(`http://127.0.0.1:8000/api/v1/forecast/?${params}`)
  console.log(response)
  return response.data
}




export function Analytics() {
  const { t } = useTranslation()
  const [userRole, setUserRole] = useState<string>('user') // Default to 'user'

  const getSixMonthsAgo = () => {
    const today = new Date()
    const sixMonthsAgo = new Date(today)
    sixMonthsAgo.setMonth(today.getMonth() - 6)
    return sixMonthsAgo.toISOString().split('T')[0]
  }



  const [startDate, setStartDate] = useState(getSixMonthsAgo())
  const today = new Date().toISOString().split('T')[0]
  const [endDate, setEndDate] = useState(today)
  const [normalization, setNormalization] = useState<'none' | 'log' | 'sqrt' | 'normalize'>('normalize')

  const [selectedModel, setSelectedModel] = useState('lstm')

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

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'user'
    setUserRole(role)
  }, [])

  // Toggle function for line visibility
  const toggleLine = (lineKey: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({
      ...prev,
      [lineKey]: !prev[lineKey]
    }))
  }

  useEffect(() => {
    if (userRole !== 'admin') {
      setVisibleLines(prev => ({
        ...prev,
        scrap_mxn: false,
        rebar_mxn: false,
        gas_mxn: false,
        hrcc1_mxn: false,
        scrap: false,
        rebar: false,
        gas: false,
        hrcc1: false,
        tipoDeCambio: false,
      }))
    }
  }, [userRole])

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
    queryFn: () => fetchMaterialPrices(startDate, endDate, 'none', '18', selectedModel, 'scrap_mxn'),
    refetchInterval: false,
    staleTime: 0, // Force refetch when dates change
    gcTime: 0, // Don't cache results
  })

  // Query for secondary chart (gas, scrap, rebar, hrcc1)
  const { data: secondaryData, isLoading: secondaryLoading, error: secondaryError, refetch: refetchSecondary } = useQuery({
    queryKey: ['materialPrices', startDate, endDate, 'secondary', normalization],
    queryFn: () => fetchMaterialPrices(startDate, endDate, normalization, '1'),
    refetchInterval: false,
    staleTime: 0,
    gcTime: 0,
  })


  const correlationMatrix = useMemo(() => {
    const rows = data?.data ?? []
    if (rows.length < 2) return null

    const exclude = new Set(['id', 'date', 'Date', 'year'])
    const keys = Object.keys(rows[0] ?? {}).filter((k) => {
      if (exclude.has(k)) return false
      return typeof (rows[0] as any)[k] === 'number'
    })

    const pearson = (keyA: string, keyB: string) => {
      let n = 0, sumX = 0, sumY = 0, sumXX = 0, sumYY = 0, sumXY = 0
      for (const r of rows) {
        const x = Number((r as any)[keyA])
        const y = Number((r as any)[keyB])
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue
        n++
        sumX += x; sumY += y
        sumXX += x * x; sumYY += y * y
        sumXY += x * y
      }
      const denom = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))
      return denom ? (n * sumXY - sumX * sumY) / denom : NaN
    }

    const matrix = keys.map((k1) => keys.map((k2) => pearson(k1, k2)))
    return { keys, matrix }
  }, [data?.data])

  

 

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('analytics.title')}</h1>
        <p className="text-sm sm:text-base text-gray-600">{t('analytics.subtitle')}</p>
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
      {userRole === 'admin' && (
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
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-end">
              <div className="flex flex-col space-y-2 flex-1 min-w-[140px]">
                <Label htmlFor="start-date">{t('analytics.startDate')}</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-40"
                />
              </div>
              <div className="flex flex-col space-y-2 flex-1 min-w-[140px]">
                <Label htmlFor="end-date">{t('analytics.endDate')}</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full sm:w-40"
                />
              </div>
              <Button onClick={() => refetch()} disabled={isLoading} className="w-full sm:w-auto">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {t('analytics.updateData')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* // Add dropdown in the UI */}
      {userRole === 'admin' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model Type
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="lstm">LSTM (Neural Network)</option>
            <option value="simple_linear">Simple Linear</option>
          </select>
        </div>
      )}


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
                  {t('analytics.titleCurrency')}
                </Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="currency_toggle"
                      checked={showMXN}
                      onCheckedChange={setShowMXN}
                      disabled={userRole !== 'admin'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {/* Show switches based on currency */}
                {showMXN ? (
                  <>
                    {userRole === 'admin' && (
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
                    )}
                    {/* <div className="flex items-center space-x-2">
                      <Switch
                        id="rebar_mxn"
                        checked={visibleLines.rebar_mxn}
                        onCheckedChange={() => toggleLine('rebar_mxn')}
                      />
                      <Label htmlFor="rebar_mxn" className="text-sm cursor-pointer">
                        {t('analytics.rebar_mxn') || 'Varilla MXN'}
                      </Label>
                    </div> */}
                    {userRole === 'admin' && (
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
                    )}
                    {userRole === 'admin' && (
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
                    )}
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
                {userRole === 'admin' && (
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
                )}

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
                <ForecastChart 
                  data={data}
                  showMXN={showMXN}
                  visibleLines={visibleLines}
                  height={320}
                  simplified={false}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>



      {/* Normalized Charts */}
      {userRole === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">

          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.priceTrendsAnalysisNormalized')}</CardTitle>
              <CardDescription>{t('analytics.priceMovements', { startDate, endDate })}</CardDescription>
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
                <div className="mt-3 flex items-center gap-2">
                  <Label htmlFor="normalization" className="text-sm">Normalization</Label>
                  <select
                    id="normalization"
                    value={normalization}
                    onChange={(e) => setNormalization(e.target.value as 'none' | 'log' | 'sqrt' | 'normalize')}
                    className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm"
                  >
                    <option value="normalize">0–1 (min-max)</option>
                    <option value="log">Log</option>
                    <option value="sqrt">Sqrt</option>
                  </select>
                </div>
              </div>
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
                      [t('analytics.tipoDeCambio')]: item.tipo_de_cambio,
                      type: 'historical'
                    })) || []


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

                    const combinedData = [...historicalData, ...forecastData]
                      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
                    //const combinedData = historicalData
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
                            domain={[(dataMin: number) => dataMin * 0.99, (dataMax: number) => dataMax * 1.01]}
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
      )}

      {/* Correlation Calculator */}
      {userRole === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.correlationAnalysis')}</CardTitle>
            <CardDescription>{t('analytics.correlationDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {correlationMatrix && (
              <CardContent>
                <div className="text-sm font-semibold mb-2">Matriz de Correlacion (Pearson)</div>
                <div className="overflow-auto">
                  <table className="min-w-max border-collapse text-xs">
                    <thead>
                      <tr>
                        <th className="sticky left-0 bg-white border px-2 py-1 text-left"> </th>
                        {correlationMatrix.keys.map((k) => (
                          <th key={k} className="border px-2 py-1 text-left whitespace-nowrap">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {correlationMatrix.keys.map((rowKey, i) => (
                        <tr key={rowKey}>
                          <td className="sticky left-0 bg-white border px-2 py-1 font-medium whitespace-nowrap">{rowKey}</td>
                          {correlationMatrix.matrix[i].map((v, j) => (
                            <td
                              key={`${rowKey}-${j}`}
                              className="border px-2 py-1 text-center"
                              style={{ backgroundColor: `rgba(59,130,246,${Number.isFinite(v) ? Math.min(Math.abs(v), 1) * 0.35 : 0})` }}
                            >
                              {Number.isFinite(v) ? v.toFixed(2) : '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
            {/* <div className="space-y-4">
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
            </div> */}
          </CardContent>
        </Card>
      )}



      {/* Statistical Insights */}
      {userRole === 'adminHidden' && (
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
      )}

      {/* Advanced Analytics */}
      {userRole === 'adminHidden' && (
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
      )}

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.exportShare')}</CardTitle>
          <CardDescription>{t('analytics.downloadAnalysis')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {/* git <Button variant="outline">{t('analytics.exportPdf')}</Button> */}
            <Button variant="outline">{t('analytics.exportExcel')}</Button>
            {/* <Button variant="outline">{t('analytics.shareDashboard')}</Button>
            <Button variant="outline">{t('analytics.scheduleReports')}</Button> */}
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
