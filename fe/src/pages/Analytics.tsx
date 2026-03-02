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
import { MonthlyAnalysisTable } from '@/components/charts/MonthlyAnalysisTable';
import { exportToExcel, TranslationKeys } from '@/utils/excelExport'


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
  coeficiente: number
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

const fetchMaterialPrices = async (startDate?: string, endDate?: string, transform?: string, forecast_periods?: string, modelType?: string, value_column?: string): Promise<ApiResponse> => {
  const params = new URLSearchParams({
    table_name: 'precios_materiales',
    limit: '200',
    forecast_periods: forecast_periods || '18',
    value_column: value_column || "scrap_mxn",
    transform: transform || 'none',
    model_type: modelType || 'lstm',
    use_trained_model: 'false'
  })

  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const response = await axios.get(`${API_URL}/api/v1/forecast/?${params}`)
  return response.data
}


export function Analytics() {
  const { t } = useTranslation()
  const [userRole, setUserRole] = useState<string>('user')

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
  const [selectedModel, setSelectedModel] = useState('empirical')
  const { isLoggedIn } = useAuth();
  const [material, setMaterial] = useState('');
  const [volumen, setVolumen] = useState('');
  const [showMXN, setShowMXN] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

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

  const toggleLine = (lineKey: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({ ...prev, [lineKey]: !prev[lineKey] }))
  }

  const handleExportExcel = async () => {
    if (!data) { alert(t('errors.serverError')); return }
    setIsExporting(true)
    try {
      const translations: TranslationKeys = {
        date: t('analytics.startDate'),
        type: 'Tipo',
        typeHistorical: 'Histórico',
        typeForecast: 'Pronóstico',
        varillaDistribuidor: t('analytics.varillaDistribuidor'),
        varillaCredito: t('analytics.varillaCredito'),
        precioMercado: t('analytics.precioMercado'),
        scrapMxn: t('analytics.scrap_mxn'),
        scrap: t('analytics.scrap'),
        gasMxn: t('analytics.gas_mxn'),
        gas: t('analytics.gas'),
        rebarMxn: t('analytics.rebar_mxn'),
        rebar: t('analytics.rebar'),
        hrcc1Mxn: t('analytics.hrcc1_mxn'),
        hrcc1: t('analytics.hrcc1'),
        tipoDeCambio: t('analytics.tipoDeCambio'),
        predictedBajista: 'Pronóstico Bajista',
        predictedConservador: 'Pronóstico Conservador',
        predictedAlza: 'Pronóstico Alza',
        confidenceLower: 'Intervalo Confianza (Inferior)',
        confidenceUpper: 'Intervalo Confianza (Superior)',
      }
      exportToExcel({ historicalData: data.data, forecastData: data.forecast, startDate, endDate }, translations)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert(t('common.error'))
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    if (userRole !== 'admin') {
      setVisibleLines(prev => ({
        ...prev,
        scrap_mxn: false, rebar_mxn: false, gas_mxn: false, hrcc1_mxn: false,
        scrap: false, rebar: false, gas: false, hrcc1: false, tipoDeCambio: false,
      }))
    }
  }, [userRole])

  const setDateRange = (period: string) => {
    const today = new Date()
    const endDate = today.toISOString().split('T')[0]
    let startDate = new Date()
    switch (period) {
      case '5D': startDate.setDate(today.getDate() - 5); break
      case '1M': startDate.setMonth(today.getMonth() - 1); break
      case '6M': startDate.setMonth(today.getMonth() - 6); break
      case 'YTD': startDate = new Date(today.getFullYear(), 0, 1); break
      case '1Y': startDate.setFullYear(today.getFullYear() - 1); break
      case '5Y': startDate.setFullYear(today.getFullYear() - 5); break
      default: return
    }
    setStartDate(startDate.toISOString().split('T')[0])
    setEndDate(endDate)
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['materialPrices', startDate, endDate],
    queryFn: () => fetchMaterialPrices(startDate, endDate, 'none', '18', selectedModel, 'scrap_mxn'),
    refetchInterval: false,
    staleTime: 0,
    gcTime: 0,
  })

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
        n++; sumX += x; sumY += y; sumXX += x * x; sumYY += y * y; sumXY += x * y
      }
      const denom = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))
      return denom ? (n * sumXY - sumX * sumY) / denom : NaN
    }
    const matrix = keys.map((k1) => keys.map((k2) => pearson(k1, k2)))
    return { keys, matrix }
  }, [data?.data])


  return (
    <div className="space-y-4 md:space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{t('analytics.title')}</h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5">{t('analytics.subtitle')}</p>
      </div>

      {/* Stats Bar */}
      {isLoggedIn && (
        <UserStatsBar
          cotizaciones={10} comprado={75000} tokens={5} variacion={1.6}
          cp="" nombreProyecto="" material={material} volumen={volumen}
          onMaterialChange={setMaterial} onVolumenChange={setVolumen}
        />
      )}

      {/* Date Filters — admin only */}
      {userRole === 'admin' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">{t('analytics.dateRangeFilter')}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{t('analytics.selectDateRange')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick presets — scrollable on mobile */}
            <div>
              <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                {t('analytics.quickSelect') || 'Selección rápida'}
              </Label>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {['5D', '1M', '6M', 'YTD', '1Y', '5Y'].map((period) => (
                  <Button
                    key={period}
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange(period)}
                    className="text-xs shrink-0"
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date inputs + refresh */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex flex-col space-y-1 flex-1">
                <Label htmlFor="start-date" className="text-xs sm:text-sm">{t('analytics.startDate')}</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-sm w-full"
                />
              </div>
              <div className="flex flex-col space-y-1 flex-1">
                <Label htmlFor="end-date" className="text-xs sm:text-sm">{t('analytics.endDate')}</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-sm w-full"
                />
              </div>
              <Button onClick={() => refetch()} disabled={isLoading} className="w-full sm:w-auto shrink-0">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {t('analytics.updateData')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model selector — admin only */}
      {userRole === 'admin' && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-sm font-medium text-gray-700 shrink-0">Model Type</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="lstm">LSTM (Neural Network)</option>
            <option value="simple_linear">Simple Linear</option>
          </select>
        </div>
      )}

      {/* ── MAIN CHART CARD ── */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">{t('analytics.priceTrendsAnalysis')}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {t('analytics.priceMovements', { startDate, endDate })}
          </CardDescription>
        </CardHeader>
        {/* px-0 on mobile so chart touches card edges; restore on sm+ */}
        <CardContent className="space-y-4 !px-0 sm:!px-6 pb-4 sm:pb-6">

          {/* Controls panel — restore horizontal padding on mobile */}
          <div className="mx-3 sm:mx-0 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">

            {/* Currency toggle */}
            <div className="pb-3 border-b border-gray-200 dark:border-gray-600">
              <Label className="text-xs sm:text-sm font-medium mb-2 block">
                {t('analytics.titleCurrency')}
              </Label>
              <div className="flex items-center gap-3">
                <Switch
                  id="currency_toggle"
                  checked={showMXN}
                  onCheckedChange={setShowMXN}
                  disabled={userRole !== 'admin'}
                />
                <Label htmlFor="currency_toggle" className="text-xs sm:text-sm cursor-pointer">
                  {showMXN ? 'MXN (Pesos)' : 'USD (Dólares)'}
                </Label>
              </div>
            </div>

            {/* Line visibility switches */}
            <div>
              <Label className="text-xs sm:text-sm font-medium mb-3 block">
                {t('analytics.showLines') || 'Mostrar líneas en el gráfico'}
              </Label>

              {/* 
                Mobile: 2-col grid
                Tablet: 3-col
                Desktop: up to 6-col
              */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                {showMXN ? (
                  <>
                    {userRole === 'admin' && (
                      <SwitchRow id="scrap_mxn" checked={visibleLines.scrap_mxn} onChange={() => toggleLine('scrap_mxn')} label={t('analytics.scrap_mxn') || 'Chatarra MXN'} />
                    )}
                    {userRole === 'admin' && (
                      <SwitchRow id="gas_mxn" checked={visibleLines.gas_mxn} onChange={() => toggleLine('gas_mxn')} label={t('analytics.gas_mxn') || 'Gas MXN'} />
                    )}
                    {userRole === 'admin' && (
                      <SwitchRow id="hrcc1_mxn" checked={visibleLines.hrcc1_mxn} onChange={() => toggleLine('hrcc1_mxn')} label={t('analytics.hrcc1_mxn') || 'HRCC1 MXN'} />
                    )}
                  </>
                ) : (
                  <>
                    <SwitchRow id="scrap" checked={visibleLines.scrap} onChange={() => toggleLine('scrap')} label={t('analytics.scrap') || 'Chatarra USD'} />
                    <SwitchRow id="rebar" checked={visibleLines.rebar} onChange={() => toggleLine('rebar')} label={t('analytics.rebar') || 'Varilla USD'} />
                    <SwitchRow id="gas" checked={visibleLines.gas} onChange={() => toggleLine('gas')} label={t('analytics.gas') || 'Gas USD'} />
                    <SwitchRow id="hrcc1" checked={visibleLines.hrcc1} onChange={() => toggleLine('hrcc1')} label={t('analytics.hrcc1') || 'HRCC1 USD'} />
                  </>
                )}
                {userRole === 'admin' && (
                  <SwitchRow id="tipoDeCambio" checked={visibleLines.tipoDeCambio} onChange={() => toggleLine('tipoDeCambio')} label={t('analytics.tipoDeCambio')} />
                )}
                <SwitchRow id="precioMercado" checked={visibleLines.precioMercado} onChange={() => toggleLine('precioMercado')} label={t('analytics.precioMercado')} />
              </div>
            </div>
          </div>

          {/* Chart — taller on mobile so it breathes */}
          {isLoading ? (
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{t('common.loading')}</span>
              </div>
            </div>
          ) : error ? (
            <div className="h-64 sm:h-80 flex items-center justify-center text-red-500">
              <div className="text-center">
                <p className="text-sm">{t('errors.serverError')}</p>
                <Button variant="outline" onClick={() => refetch()} className="mt-2 text-xs">
                  {t('common.refresh')}
                </Button>
              </div>
            </div>
          ) : (
            /* 
              Mobile: 280px — enough to read without scrolling
              sm+:    320px
            */
            <div className="h-[260px] sm:h-[340px]">
              <ForecastChart
                data={data}
                showMXN={showMXN}
                visibleLines={visibleLines}
                height={280}
                simplified={false}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly analysis table — wrapped so it scrolls horizontally on mobile */}
      <div className="w-full overflow-x-auto rounded-lg">
        <div className="min-w-[600px]">
          <MonthlyAnalysisTable data={data?.data} />
        </div>
      </div>

      {/* ── NORMALIZED CHART — admin only ── */}
      {userRole === 'admin' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">{t('analytics.priceTrendsAnalysisNormalized')}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t('analytics.priceMovements', { startDate, endDate })}
            </CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Label htmlFor="normalization" className="text-xs sm:text-sm shrink-0">Normalización</Label>
              <select
                id="normalization"
                value={normalization}
                onChange={(e) => setNormalization(e.target.value as 'none' | 'log' | 'sqrt' | 'normalize')}
                className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs sm:text-sm"
              >
                <option value="normalize">0–1 (min-max)</option>
                <option value="log">Log</option>
                <option value="sqrt">Sqrt</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {secondaryLoading ? (
              <div className="h-64 sm:h-80 flex items-center justify-center">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{t('common.loading')}</span>
                </div>
              </div>
            ) : secondaryError ? (
              <div className="h-64 sm:h-80 flex items-center justify-center text-red-500">
                <div className="text-center">
                  <p className="text-sm">{t('errors.serverError')}</p>
                  <Button variant="outline" onClick={() => refetchSecondary()} className="mt-2 text-xs">
                    {t('common.refresh')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[280px] sm:h-80">
                {(() => {
                  const historicalData = secondaryData?.data?.map(item => ({
                    date: new Date(item.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
                    fullDate: item.date,
                    [t('analytics.scrap_mxn')]: item.scrap_mxn,
                    [t('analytics.rebar_mxn')]: item.rebar_mxn,
                    [t('analytics.gas_mxn')]: item.gas_mxn,
                    [t('analytics.hrcc1_mxn')]: item.hrcc1_mxn,
                    [t('analytics.scrap')]: item.scrap,
                    [t('analytics.rebar')]: item.rebar,
                    [t('analytics.gas')]: item.gas,
                    [t('analytics.hrcc1')]: item.hrcc1,
                    [t('analytics.precioMercado')]: item.precio_mercado,
                    [t('analytics.varillaDistribuidor')]: item.varilla_distribuidor,
                    [t('analytics.varillaCredito')]: item.varilla_credito,
                    [t('analytics.tipoDeCambio')]: item.tipo_de_cambio,
                    [t('analytics.coeficiente')]: item.coeficiente,
                    type: 'historical'
                  })) || []

                  const forecastData = data?.forecast?.map((item) => ({
                    date: new Date(item.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
                    fullDate: item.date,
                    [t('analytics.varillaDistribuidor')]: null,
                    [t('analytics.varillaCredito')]: null,
                    [t('analytics.precioMercado')]: null,
                    type: 'forecast'
                  })) || []

                  const combinedData = [...historicalData, ...forecastData]
                    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={combinedData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={55}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fontSize: 10 }}
                          width={55}
                          tickFormatter={(v) => `$${v.toLocaleString()}`}
                          domain={[(d: number) => d * 0.99, (d: number) => d * 1.01]}
                          allowDataOverflow
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                          labelFormatter={(label, payload) => {
                            if (payload?.[0]) {
                              const t = payload[0].payload.type
                              return `${payload[0].payload.fullDate}${t === 'forecast' ? ' (Forecast)' : ''}`
                            }
                            return label
                          }}
                          contentStyle={{ fontSize: 11 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                        {showMXN ? (
                          <>
                            {visibleLines.scrap_mxn && <Line type="monotone" dataKey={t('analytics.scrap_mxn')} stroke="#3b82f6" strokeWidth={2} dot={false} />}
                            {visibleLines.rebar_mxn && <Line type="monotone" dataKey={t('analytics.rebar_mxn')} stroke="#06b6d4" strokeWidth={2} dot={false} />}
                            {visibleLines.gas_mxn && <Line type="monotone" dataKey={t('analytics.gas_mxn')} stroke="#6aa84f" strokeWidth={2} dot={false} />}
                            {visibleLines.hrcc1_mxn && <Line type="monotone" dataKey={t('analytics.hrcc1_mxn')} stroke="#741b47" strokeWidth={2} dot={false} />}
                          </>
                        ) : (
                          <>
                            {visibleLines.scrap && <Line type="monotone" dataKey={t('analytics.scrap')} stroke="#8b5cf6" strokeWidth={2} dot={false} />}
                            {visibleLines.rebar && <Line type="monotone" dataKey={t('analytics.rebar')} stroke="#06b6d4" strokeWidth={2} dot={false} />}
                            {visibleLines.gas && <Line type="monotone" dataKey={t('analytics.gas')} stroke="#6aa84f" strokeWidth={2} dot={false} />}
                            {visibleLines.hrcc1 && <Line type="monotone" dataKey={t('analytics.hrcc1')} stroke="#741b47" strokeWidth={2} dot={false} />}
                          </>
                        )}
                        {visibleLines.tipoDeCambio && <Line type="monotone" dataKey={t('analytics.tipoDeCambio')} stroke="#10b981" strokeWidth={2} dot={false} />}
                        {visibleLines.precioMercado && <Line type="monotone" dataKey={t('analytics.precioMercado')} stroke="#f59e0b" strokeWidth={2} dot={false} />}
                      </LineChart>
                    </ResponsiveContainer>
                  )
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Correlation Matrix — admin only */}
      {userRole === 'admin' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">{t('analytics.correlationAnalysis')}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{t('analytics.correlationDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {correlationMatrix && (
              /* Horizontal scroll wrapper for the matrix table on mobile */
              <div className="overflow-x-auto -mx-2 px-2">
                <p className="text-xs sm:text-sm font-semibold mb-2">Matriz de Correlación (Pearson)</p>
                <table className="min-w-max border-collapse text-[10px] sm:text-xs">
                  <thead>
                    <tr>
                      <th className="sticky left-0 bg-white border px-1.5 py-1 text-left"> </th>
                      {correlationMatrix.keys.map((k) => (
                        <th key={k} className="border px-1.5 py-1 text-left whitespace-nowrap font-medium">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correlationMatrix.keys.map((rowKey, i) => (
                      <tr key={rowKey}>
                        <td className="sticky left-0 bg-white border px-1.5 py-1 font-medium whitespace-nowrap">{rowKey}</td>
                        {correlationMatrix.matrix[i].map((v, j) => (
                          <td
                            key={`${rowKey}-${j}`}
                            className="border px-1.5 py-1 text-center"
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
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistical Insights — hidden role */}
      {userRole === 'adminHidden' && (
        <Card>
          <CardHeader>
            <CardTitle>Statistical Insights</CardTitle>
            <CardDescription>Key metrics and correlations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0.43337</div>
                <p className="text-sm text-gray-600">Correlation Coefficient</p>
                <p className="text-xs text-gray-500">Gas vs. Rebar</p>
                <div className="mt-2 text-xs text-gray-400">
                  <BlockMath math={String.raw`r = \frac{\text{Cov}(X,Y)}{\sigma_X \cdot \sigma_Y}`} />
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

      {/* Export */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">{t('analytics.exportShare')}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{t('analytics.downloadAnalysis')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={isExporting || !data}
              className="text-xs sm:text-sm"
            >
              {isExporting ? t('common.loading') : t('analytics.exportExcel')}
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

/* ── Small helper to keep switch rows DRY and consistent ── */
function SwitchRow({
  id,
  checked,
  onChange,
  label,
}: {
  id: string
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Switch id={id} checked={checked} onCheckedChange={onChange} className="shrink-0 scale-90" />
      <Label htmlFor={id} className="text-xs cursor-pointer truncate leading-tight">
        {label}
      </Label>
    </div>
  )
}