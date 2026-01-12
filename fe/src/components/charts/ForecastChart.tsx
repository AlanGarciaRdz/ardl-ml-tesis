import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts'

// Types for the API response
export interface MaterialPrice {
  id: number
  date: string
  varilla_distribuidor: number
  varilla_credito: number
  precio_mercado: number
  scrap_mxn: number
  scrap: number
  gas: number
  gas_mxn: number
  rebar: number
  rebar_mxn: number
  hrcc1: number
  hrcc1_mxn: number
  tipo_de_cambio: number
}

export interface ForecastPrice {
  id: number
  date: string
  period: number
  predicted_value_bajista: number
  predicted_value_conservador: number
  predicted_value_alza: number
  confidence_interval: {
    lower: number
    upper: number
  }
}

export interface ValidationPrice {
  id: number
  date: string
  period: number
  predicted_value: number
}

export interface ApiResponse {
  data: MaterialPrice[]
  validation: ValidationPrice[]
  forecast: ForecastPrice[]
  total_count: number
  limit: number
  offset: number
  startDate: string
}

interface ForecastChartProps {
  data: ApiResponse | undefined
  showMXN?: boolean
  visibleLines?: Record<string, boolean>
  height?: number
  simplified?: boolean  // true for Quote view, false for Analytics
  startDate?: string
  endDate?: string
}

export function ForecastChart({ 
  data, 
  showMXN = true, 
  visibleLines = {}, 
  height = 320,
  simplified = false,
}: ForecastChartProps) {
  const { t } = useTranslation()

  if (!data) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        No hay datos disponibles
      </div>
    )
  }

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
      [t('analytics.scrap_mxn')]: null,
      [t('analytics.rebar_mxn')]: null,
      [t('analytics.gas_mxn')]: null,
      [t('analytics.hrcc1_mxn')]: null,
      // USD values
      [t('analytics.scrap')]: null,
      [t('analytics.rebar')]: null,
      [t('analytics.gas')]: null,
      [t('analytics.hrcc1')]: null,
      // Other values
      [`${t('analytics.precioMercado')} (Bajista)`]: item.predicted_value_bajista,
      [`${t('analytics.precioMercado')}`]: item.predicted_value_conservador,
      [`${t('analytics.precioMercado')} (Alza)`]: item.predicted_value_alza,
      // Add bounds for uncertainty cone
      forecastLower: item.predicted_value_bajista,
      forecastDiff: item.predicted_value_alza - item.predicted_value_bajista,
      [t('analytics.varillaDistribuidor')]: null,
      [t('analytics.varillaCredito')]: null,
      [t('analytics.tipoDeCambio')]: null,
      type: 'forecast'
    }
  }) || []

  const combinedData = [...historicalData, ...forecastData].sort((a, b) => {
    return new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
  })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={combinedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10 }}
          angle={-60}
          textAnchor="end"
          height={80}
          interval="preserveStartEnd"
        />
        <YAxis
           yAxisId="left"
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
          domain={[(dataMin: number) => dataMin * 0.95, (dataMax: number) => dataMax * 1.05]}
          allowDataOverflow
          width={65}
        />
        {/* Secondary Y-Axis for exchange rate */}
        {!simplified && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => `${value.toFixed(2)}`}
            domain={[(dataMin: number) => dataMin * 0.99, (dataMax: number) => dataMax * 1.01]}
            allowDataOverflow
            width={50}
          />
        )}
        <Tooltip
          formatter={(value: number, name: string) => [
            `$${value.toLocaleString()}`,
            name
          ]}
          labelFormatter={(label, payload) => {
            if (payload && payload[0]) {
              const dataType = payload[0].payload.type
              const typeLabel = dataType === 'forecast' ? ' (Pronóstico)' :
                dataType === 'validation' ? ' (Validación)' : ''
              return `Fecha: ${payload[0].payload.fullDate}${typeLabel}`
            }
            return label
          }}
        />
        <Legend />
        
        {/* Cone of uncertainty - Area between bajista and alza using stacking */}
        {(visibleLines.precioMercado || simplified) && (
          <>
            {/* Base area (invisible) to set the baseline at forecastLower */}
            <Area
              yAxisId={simplified ? "left" : "right"}
              type="monotone"
              dataKey="forecastLower"
              stackId="forecast"
              stroke="none"
              fill="transparent"
              legendType="none"
            />
            {/* Difference area that shows the cone of uncertainty */}
            <Area
              yAxisId={simplified ? "left" : "right"}
              type="monotone"
              dataKey="forecastDiff"
              stackId="forecast"
              stroke="none"
              fill="#f59e0b"
              fillOpacity={0.25}
              name="Zona de incertidumbre"
            />
          </>
        )}
        
        {!simplified && showMXN ? (
          <>
            {visibleLines.scrap_mxn && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={t('analytics.scrap_mxn')}
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            )}
            {visibleLines.rebar_mxn && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={t('analytics.rebar_mxn')}
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
              />
            )}
            {visibleLines.gas_mxn && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={t('analytics.gas_mxn')}
                stroke="#6aa84f"
                strokeWidth={2}
                dot={false}
              />
            )}
            {visibleLines.hrcc1_mxn && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={t('analytics.hrcc1_mxn')}
                stroke="#741b47"
                strokeWidth={2}
                dot={false}
              />
            )}
          </>
        ) : !simplified && !showMXN ? (
          <>
            {visibleLines.scrap && (
              <Line
                yAxisId="left"
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
        ) : null}
        
        {/* Always show these regardless of currency (or in simplified mode) */}
        {!simplified && visibleLines.tipoDeCambio && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={t('analytics.tipoDeCambio')}
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
        )}
        
        {(visibleLines.precioMercado || simplified) && (
          <>
            <Line
              yAxisId={simplified ? "left" : "right"}
              type="monotone"
              dataKey={t('analytics.precioMercado')}
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
            <Line 
              yAxisId={simplified ? "left" : "right"} 
              type="monotone" 
              dataKey={`${t('analytics.precioMercado')} (Bajista)`} 
              stroke="#ef4444" 
              strokeWidth={2} 
              dot={false} 
              strokeDasharray="6 4" 
            />
            <Line 
              yAxisId={simplified ? "left" : "right"} 
              type="monotone" 
              dataKey={`${t('analytics.precioMercado')} (Alza)`} 
              stroke="#22c55e" 
              strokeWidth={2} 
              dot={false} 
              strokeDasharray="6 4" 
            />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}

