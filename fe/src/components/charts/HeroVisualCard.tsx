import { useEffect, useState } from 'react'

interface PrecioData {
  date: string
  precio_mercado: number
}

function get6MonthsAgoDate(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 6)
  return d.toISOString().split('T')[0]
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function formatMXN(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateLabel(dateStr: string): string {
  const [year, month] = dateStr.split('-')
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${months[parseInt(month) - 1]} ${year.slice(2)}`
}

export function HeroVisualCard() {
  const [data, setData] = useState<PrecioData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const startDate = get6MonthsAgoDate()
    const endDate = getTodayDate()

    fetch(
      `https://soypitiax.com/api/v1/data/?table_name=precios_materiales&start_date=${startDate}&end_date=${endDate}`
    )
      .then((res) => {
        if (!res.ok) throw new Error('Network error')
        return res.json()
      })
      .then((json) => {
        const sorted: PrecioData[] = (json.data as PrecioData[])
          .map((d) => ({ date: d.date, precio_mercado: d.precio_mercado }))
          .sort((a, b) => a.date.localeCompare(b.date))
        setData(sorted)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const prices = data.map((d) => d.precio_mercado)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const latestPrice = prices[prices.length - 1] ?? 0
  const firstPrice = prices[0] ?? 0
  const pctChange = firstPrice > 0 ? ((latestPrice - firstPrice) / firstPrice) * 100 : 0
  const isPositive = pctChange >= 0

  const normalizeHeight = (val: number) => {
    if (prices.length < 2) return 50
    return 10 + ((val - minPrice) / (maxPrice - minPrice)) * 85
  }

  const startLabel = data[0] ? formatDateLabel(data[0].date) : '—'
  const endLabel = data[data.length - 1] ? formatDateLabel(data[data.length - 1].date) : '—'

  return (
    <div className="relative mt-6 lg:mt-0">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-[#2596be]/20 shadow-2xl">
        <div className="mb-4 sm:mb-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
              Precio del Acero — Últimos 6 meses
            </h3>
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse ${error ? 'bg-red-400' : loading ? 'bg-yellow-400' : 'bg-green-400'}`} />
          </div>

          {/* Chart */}
          <div className="h-36 sm:h-44 md:h-48 bg-gradient-to-t from-[#2596be]/20 to-transparent rounded-lg p-3 sm:p-4 border border-[#2596be]/30">
            {loading && (
              <div className="flex items-end justify-between h-full gap-1">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-[#2596be]/20 rounded-t animate-pulse"
                    style={{ height: `${30 + Math.random() * 50}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            )}

            {error && !loading && (
              <div className="flex items-center justify-center h-full text-xs text-gray-400">
                No se pudo cargar la información
              </div>
            )}

            {!loading && !error && data.length > 0 && (
              <div className="flex items-end justify-between h-full gap-0.5 sm:gap-1">
                {data.map((d, i) => {
                  const h = normalizeHeight(d.precio_mercado)
                  const isLast = i === data.length - 1
                  return (
                    <div
                      key={d.date}
                      title={`${formatDateLabel(d.date)}: ${formatMXN(d.precio_mercado)}`}
                      className={`rounded-t flex-1 transition-all duration-700 cursor-pointer group relative
                        ${isLast
                          ? 'bg-gradient-to-t from-[#27348B] to-[#36A9E1]'
                          : 'bg-gradient-to-t from-[#2596be] to-[#2ca6e1] hover:from-[#1772b5] hover:to-[#2596be]'
                        }`}
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-gray-800 text-white text-[9px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {formatMXN(d.precio_mercado)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Date range + % change */}
          <div className="mt-3 flex justify-between text-xs sm:text-sm">
            <span className="text-gray-500">{startLabel}</span>
            {!loading && !error && (
              <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{pctChange.toFixed(1)}% {isPositive ? '↗' : '↘'}
              </span>
            )}
            <span className="text-gray-500">{endLabel}</span>
          </div>
        </div>

        {/* Price Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#2596be]/5 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Precio Mercado</div>
            {loading ? (
              <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-1" />
            ) : (
              <>
                <div className="text-base sm:text-lg font-bold text-gray-800">
                  {latestPrice ? formatMXN(latestPrice) : '—'}
                </div>
                <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{pctChange.toFixed(1)}% vs inicio
                </div>
              </>
            )}
          </div>

          <div className="bg-[#2596be]/5 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Rango 6 meses</div>
            {loading ? (
              <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-1" />
            ) : (
              <>
                <div className="text-base sm:text-lg font-bold text-gray-800">
                  {maxPrice ? formatMXN(maxPrice) : '—'}
                </div>
                <div className="text-xs text-gray-400">
                  Mín: {minPrice ? formatMXN(minPrice) : '—'}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="hidden sm:block absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-[#2ca6e1] to-[#41afe0] rounded-full blur-xl opacity-60 animate-bounce" />
      <div className="hidden sm:block absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-[#2596be] to-[#1772b5] rounded-full blur-xl opacity-60 animate-bounce delay-500" />
    </div>
  )
}