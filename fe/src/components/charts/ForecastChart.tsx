import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts'

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
  coeficiente: number
  vix: number;
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
  simplified?: boolean
  startDate?: string
  endDate?: string
}

// Detect mobile via window width — safe for SSR
function useIsMobile() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 640
}

export function ForecastChart({
  data,
  showMXN = true,
  visibleLines = {},
  height = 320,
  simplified = false,
}: ForecastChartProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  if (!data) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500 text-sm">
        No hay datos disponibles
      </div>
    )
  }

  const historicalData = data?.data?.map(item => ({
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
    [t('analytics.vix')]: item.vix,
    [t('analytics.precioMercado')]: item.precio_mercado,
    [t('analytics.varillaDistribuidor')]: item.varilla_distribuidor,
    [t('analytics.varillaCredito')]: item.varilla_credito,
    [t('analytics.tipoDeCambio')]: item.tipo_de_cambio,
    type: 'historical'
  })) || []

  const forecastData = data?.forecast?.map((item) => ({
    date: new Date(item.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
    fullDate: item.date,
    [t('analytics.scrap_mxn')]: null,
    [t('analytics.rebar_mxn')]: null,
    [t('analytics.gas_mxn')]: null,
    [t('analytics.hrcc1_mxn')]: null,
    [t('analytics.scrap')]: null,
    [t('analytics.rebar')]: null,
    [t('analytics.gas')]: null,
    [t('analytics.hrcc1')]: null,
    [`${t('analytics.precioMercado')} (Bajista)`]: item.predicted_value_bajista,
    [`${t('analytics.precioMercado')}`]: item.predicted_value_conservador,
    [`${t('analytics.precioMercado')} (Alza)`]: item.predicted_value_alza,
    forecastLower: item.predicted_value_bajista,
    forecastDiff: item.predicted_value_alza - item.predicted_value_bajista,
    [t('analytics.varillaDistribuidor')]: null,
    [t('analytics.varillaCredito')]: null,
    [t('analytics.tipoDeCambio')]: null,
    type: 'forecast'
  })) || []

  const combinedData = [...historicalData, ...forecastData].sort(
    (a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
  )

  // ── Mobile-aware axis config ──────────────────────────────────────────────
  // On mobile: hide right YAxis entirely, shrink left YAxis, reduce XAxis height
  const leftYAxisWidth  = isMobile ? 52 : 65
  const rightYAxisWidth = isMobile ? 0  : 50   // 0 = hidden on mobile
  const xAxisHeight     = isMobile ? 45 : 65
  const xAxisAngle      = isMobile ? -35 : -60
  const xAxisFontSize   = isMobile ? 9  : 10
  const yAxisFontSize   = isMobile ? 9  : 10

  // On mobile show fewer ticks so labels don't overlap
  const xAxisInterval = isMobile ? 'preserveStartEnd' : 'preserveStartEnd'

  // Compact number formatter for mobile YAxis labels
  const yTickFormatter = (value: number) =>
    isMobile
      ? `$${(value / 1000).toFixed(0)}k`   // e.g. $14k
      : `$${value.toLocaleString()}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={combinedData}
        margin={{
          top: 5,
          right: isMobile ? 8 : 16,
          left: isMobile ? 0 : 4,
          bottom: isMobile ? 4 : 8,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.6} />

        <XAxis
          dataKey="date"
          tick={{ fontSize: xAxisFontSize }}
          angle={xAxisAngle}
          textAnchor="end"
          height={xAxisHeight}
          interval={xAxisInterval}
          tickLine={false}
        />

        {/* Left Y-Axis — always shown, compact on mobile */}
        <YAxis
          yAxisId="left"
          tick={{ fontSize: yAxisFontSize }}
          tickFormatter={yTickFormatter}
          domain={[(dataMin: number) => dataMin * 0.95, (dataMax: number) => dataMax * 1.05]}
          allowDataOverflow
          width={leftYAxisWidth}
          tickLine={false}
          axisLine={false}
        />

        {/* Right Y-Axis — hidden on mobile to reclaim ~50px of chart width */}
        {!simplified && !isMobile && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: yAxisFontSize }}
            tickFormatter={(value) => value.toFixed(1)}
            domain={[(dataMin: number) => dataMin * 0.99, (dataMax: number) => dataMax * 1.01]}
            allowDataOverflow
            width={rightYAxisWidth}
            tickLine={false}
            axisLine={false}
          />
        )}

        <Tooltip
          formatter={(value: number, name: string) => [
            `$${value.toLocaleString()}`,
            name
          ]}
          labelFormatter={(label, payload) => {
            if (payload?.[0]) {
              const dataType = payload[0].payload.type
              const suffix = dataType === 'forecast' ? ' (Pronóstico)' :
                             dataType === 'validation' ? ' (Validación)' : ''
              return `Fecha: ${payload[0].payload.fullDate}${suffix}`
            }
            return label
          }}
          contentStyle={{ fontSize: isMobile ? 11 : 13 }}
        />

        {/* Legend — smaller font, wrap on mobile */}
        <Legend
          wrapperStyle={{
            fontSize: isMobile ? 10 : 12,
            paddingTop: isMobile ? 4 : 8,
            lineHeight: '1.6',
          }}
          iconSize={isMobile ? 8 : 10}
        />

        {/* Uncertainty cone */}
        {(visibleLines.precioMercado || simplified) && (
          <>
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="forecastLower"
              stackId="forecast"
              stroke="none"
              fill="transparent"
              legendType="none"
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="forecastDiff"
              stackId="forecast"
              stroke="none"
              fill="#f59e0b"
              fillOpacity={0.2}
              name="Zona de incertidumbre"
            />
          </>
        )}

        {/* MXN commodity lines — use left axis on mobile (right hidden) */}
        {!simplified && showMXN && (
          <>
            {visibleLines.scrap_mxn && (
              <Line yAxisId={isMobile ? 'left' : 'right'} type="monotone" dataKey={t('analytics.scrap_mxn')}  stroke="#3b82f6" strokeWidth={2} dot={false} />
            )}
            {visibleLines.rebar_mxn && (
              <Line yAxisId={isMobile ? 'left' : 'right'} type="monotone" dataKey={t('analytics.rebar_mxn')}  stroke="#06b6d4" strokeWidth={2} dot={false} />
            )}
            {visibleLines.gas_mxn && (
              <Line yAxisId={isMobile ? 'left' : 'right'} type="monotone" dataKey={t('analytics.gas_mxn')}    stroke="#6aa84f" strokeWidth={2} dot={false} />
            )}
            {visibleLines.hrcc1_mxn && (
              <Line yAxisId={isMobile ? 'left' : 'right'} type="monotone" dataKey={t('analytics.hrcc1_mxn')}  stroke="#741b47" strokeWidth={2} dot={false} />
            )}
            {visibleLines.vix && (
              <Line yAxisId={isMobile ? 'left' : 'right'} type="monotone" dataKey={t('analytics.vix')}  stroke="#978A4F" strokeWidth={2} dot={false} />
            )}
          </>
        )}

        {/* USD commodity lines */}
        {!simplified && !showMXN && (
          <>
            {visibleLines.scrap  && <Line yAxisId="left" type="monotone" dataKey={t('analytics.scrap')}  stroke="#8b5cf6" strokeWidth={2} dot={false} />}
            {visibleLines.rebar  && <Line yAxisId="left" type="monotone" dataKey={t('analytics.rebar')}  stroke="#06b6d4" strokeWidth={2} dot={false} />}
            {visibleLines.gas    && <Line yAxisId="left" type="monotone" dataKey={t('analytics.gas')}    stroke="#6aa84f" strokeWidth={2} dot={false} />}
            {visibleLines.hrcc1  && <Line yAxisId="left" type="monotone" dataKey={t('analytics.hrcc1')}  stroke="#741b47" strokeWidth={2} dot={false} />}
            {visibleLines.vix  && <Line yAxisId="left" type="monotone" dataKey={t('analytics.vix')}  stroke="#978A4F" strokeWidth={2} dot={false} />}
          </>
        )}

        {/* Tipo de cambio — right axis on desktop, left on mobile */}
        {!simplified && visibleLines.tipoDeCambio && (
          <Line
            yAxisId={isMobile ? 'left' : 'right'}
            type="monotone"
            dataKey={t('analytics.tipoDeCambio')}
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
        )}

      {!simplified && visibleLines.vix && (
        <YAxis
          yAxisId="vix"
          orientation="right"
          tick={{ fontSize: yAxisFontSize }}
          tickFormatter={(value) => value.toFixed(1)}
          domain={['auto', 'auto']}
          width={isMobile ? 38 : 44}
          tickLine={false}
          axisLine={false}
          stroke="#978A4F"
        />
      )}

        {/* Precio mercado + forecast lines — always on left axis */}
        {(visibleLines.precioMercado || simplified) && (
          <>
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={t('analytics.precioMercado')}
              stroke="#f59e0b"
              strokeWidth={isMobile ? 1.5 : 2}
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={`${t('analytics.precioMercado')} (Bajista)`}
              stroke="#ef4444"
              strokeWidth={isMobile ? 1.5 : 2}
              dot={false}
              strokeDasharray="6 4"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={`${t('analytics.precioMercado')} (Alza)`}
              stroke="#22c55e"
              strokeWidth={isMobile ? 1.5 : 2}
              dot={false}
              strokeDasharray="6 4"
            />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}