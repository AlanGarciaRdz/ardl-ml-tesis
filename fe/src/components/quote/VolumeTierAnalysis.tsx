import { TrendingUp, Package, ArrowRight, Sparkles } from 'lucide-react'

export interface TierInfo {
  min: number
  max: number | null  // null for 500+
  pricePerTon: number
  tierName: string
  discount: number  // percentage discount
}

export const VOLUME_TIERS: TierInfo[] = [
  { min: 15, max: 30, pricePerTon: 0, tierName: "Básico", discount: 0 },
  { min: 30, max: 100, pricePerTon: 0, tierName: "Estándar", discount: 0.02 },
  { min: 100, max: 200, pricePerTon: 0, tierName: "Premium", discount: 0.05 },
  { min: 200, max: 500, pricePerTon: 0, tierName: "Empresarial", discount: 0.08 },
  { min: 500, max: null, pricePerTon: 0, tierName: "Industrial", discount: 0.12 }
]

interface VolumeTierAnalysisProps {
  currentVolume: number
  basePricePerTon: number
  onSelectVolume?: (volume: number) => void
}

export function getTierDiscount(volume: number): number {
  if (volume < 30) return 0
  if (volume < 100) return 0.02  // 2% discount
  if (volume < 200) return 0.05  // 5% discount
  if (volume < 500) return 0.08  // 8% discount
  return 0.12  // 12% discount for 500+
}

export function getCurrentTier(volume: number): TierInfo | null {
  return VOLUME_TIERS.find(tier => 
    volume >= tier.min && (tier.max === null || volume < tier.max)
  ) || null
}

export function getNextTier(volume: number): TierInfo | null {
  const currentTierIndex = VOLUME_TIERS.findIndex(tier => 
    volume >= tier.min && (tier.max === null || volume < tier.max)
  )
  
  if (currentTierIndex === -1 || currentTierIndex === VOLUME_TIERS.length - 1) {
    return null  // Already in the highest tier
  }
  
  return VOLUME_TIERS[currentTierIndex + 1] || null
}

export function getSuggestedVolume(currentVolume: number): number | null {
  const nextTier = getNextTier(currentVolume)
  if (!nextTier) return null
  
  // Suggest the minimum of the next tier
  return nextTier.min
}

export function VolumeTierAnalysis({ currentVolume, basePricePerTon, onSelectVolume }: VolumeTierAnalysisProps) {
  const currentTier = getCurrentTier(currentVolume)
  const nextTier = getNextTier(currentVolume)
  const suggestedVolume = getSuggestedVolume(currentVolume)
  
  const currentDiscount = getTierDiscount(currentVolume)
  const currentPricePerTon = basePricePerTon * (1 - currentDiscount)
  const currentTotal = currentPricePerTon * currentVolume
  
  const nextDiscount = nextTier ? getTierDiscount(suggestedVolume || 0) : 0
  const nextPricePerTon = basePricePerTon * (1 - nextDiscount)
  const nextTotal = suggestedVolume ? nextPricePerTon * suggestedVolume : 0
  
  const savings = suggestedVolume ? (currentPricePerTon - nextPricePerTon) * suggestedVolume : 0
  const savingsPercentage = ((currentPricePerTon - nextPricePerTon) / currentPricePerTon) * 100

  if (!nextTier) {
    // Already in the highest tier
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-6 border-2 border-yellow-200">
        <div className="flex items-center mb-4">
          <Sparkles className="w-6 h-6 text-yellow-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-900">
            ¡Felicidades! Estás en el Nivel Máximo
          </h3>
        </div>
        <p className="text-gray-700 mb-2">
          Ya estás obteniendo el <span className="font-bold text-yellow-600">{(currentDiscount * 100).toFixed(0)}% de descuento</span> en tu compra de {currentVolume} toneladas.
        </p>
        <p className="text-gray-600 text-sm">
          Nivel: <span className="font-semibold text-gray-900">{currentTier?.tierName}</span>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border-2 border-orange-200">
        <div className="flex items-center">
          <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
          <p className="text-orange-900 font-semibold">
            Los precios están en tendencia alcista - ¡Compra más ahora y ahorra!
          </p>
        </div>
      </div>

      {/* Tier Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Tier */}
        <div className="bg-white rounded-lg p-6 border-2 border-gray-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Tu Selección Actual</p>
              <h3 className="text-lg font-bold text-gray-900">{currentTier?.tierName}</h3>
            </div>
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Volumen</p>
              <p className="text-2xl font-bold text-gray-900">{currentVolume} Tn</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Precio por Tonelada</p>
              <p className="text-xl font-bold text-gray-900">
                ${currentPricePerTon.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              {currentDiscount > 0 && (
                <p className="text-xs text-green-600">{(currentDiscount * 100).toFixed(0)}% descuento aplicado</p>
              )}
            </div>
            
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-indigo-600">
                ${currentTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Next Tier (Recommended) */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border-2 border-indigo-400 shadow-lg relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              RECOMENDADO
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-indigo-600 uppercase tracking-wide font-semibold">Nivel Siguiente</p>
              <h3 className="text-lg font-bold text-gray-900">{nextTier?.tierName}</h3>
            </div>
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Volumen</p>
              <p className="text-2xl font-bold text-gray-900">{suggestedVolume} Tn</p>
              <p className="text-xs text-indigo-600">+{suggestedVolume ? suggestedVolume - currentVolume : 0} toneladas</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Precio por Tonelada</p>
              <p className="text-xl font-bold text-gray-900">
                ${nextPricePerTon.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-green-600">{(nextDiscount * 100).toFixed(0)}% descuento aplicado</p>
            </div>
            
            <div className="pt-3 border-t border-indigo-200">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-indigo-600">
                ${nextTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            {savings > 0 && (
              <div className="bg-green-100 rounded-lg p-3 mt-3">
                <p className="text-xs text-green-800 font-semibold mb-1">AHORRO POTENCIAL</p>
                <p className="text-lg font-bold text-green-700">
                  ${Math.abs(savings).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-green-600">
                  ({savingsPercentage.toFixed(1)}% menos por tonelada)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Message */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start">
          <ArrowRight className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-900 font-medium">
              Al comprar <span className="font-bold">{suggestedVolume} toneladas</span> en lugar de {currentVolume}, obtendrás:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>• Precio por tonelada reducido en ${(currentPricePerTon - nextPricePerTon).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</li>
              <li>• Protección contra el aumento de precios proyectado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

