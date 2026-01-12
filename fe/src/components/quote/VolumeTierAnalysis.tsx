import { TrendingUp, Package, ArrowRight, Sparkles } from 'lucide-react'

export interface TierInfo {
  min: number
  max: number | null  // null for 500+
  tierName: string
}

export const VOLUME_TIERS: TierInfo[] = [
  { min: 15, max: 30, tierName: "Básico" },
  { min: 31, max: 100, tierName: "Estándar" },
  { min: 101, max: 200, tierName: "Premium" },
  { min: 201, max: 500, tierName: "Empresarial" },
  { min: 501, max: null, tierName: "Industrial" }
]

interface VolumeTierAnalysisProps {
  currentVolume: number
  currentTotal: number
  currentPricePerTon: number
  suggestedVolume: number | null
  suggestedTotal: number | null
  suggestedPricePerTon: number | null
  onSelectVolume?: (volume: number) => void
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

export function VolumeTierAnalysis({ 
  currentVolume, 
  currentTotal, 
  currentPricePerTon,
  suggestedVolume,
  suggestedTotal,
  suggestedPricePerTon,
}: VolumeTierAnalysisProps) {
  const currentTier = getCurrentTier(currentVolume)
  const nextTier = suggestedVolume ? getNextTier(currentVolume) : null
  
  // Calculate savings if we have suggested prices
  const savings = (suggestedVolume && suggestedTotal && suggestedPricePerTon) 
    ? Math.abs((currentPricePerTon * suggestedVolume) - suggestedTotal) 
    : 0
  const savingsPercentage = (suggestedVolume && suggestedPricePerTon)
    ? ((currentPricePerTon - suggestedPricePerTon) / currentPricePerTon) * 100
    : 0

  if (!nextTier || !suggestedVolume) {
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
          Ya estás obteniendo el mejor precio disponible en tu compra de {currentVolume} toneladas.
        </p>
        <p className="text-gray-600 text-sm">
          Nivel: <span className="font-semibold text-gray-900">{currentTier?.tierName}</span>
        </p>
        <div className="mt-4 pt-4 border-t border-yellow-200">
          <p className="text-sm text-gray-600">Precio por Tonelada:</p>
          <p className="text-2xl font-bold text-yellow-600">
            ${currentPricePerTon.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-600 mt-2">Total:</p>
          <p className="text-3xl font-bold text-yellow-700">
            ${currentTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
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
                ${(suggestedPricePerTon || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              {suggestedPricePerTon && currentPricePerTon > suggestedPricePerTon && (
                <p className="text-xs text-green-600">
                  ${(currentPricePerTon - suggestedPricePerTon).toLocaleString('es-MX', { minimumFractionDigits: 2 })} menos por tonelada
                </p>
              )}
            </div>
            
            <div className="pt-3 border-t border-indigo-200">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-indigo-600">
                ${(suggestedTotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
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
              {suggestedPricePerTon && currentPricePerTon > suggestedPricePerTon && (
                <li>• Precio por tonelada reducido en ${(currentPricePerTon - suggestedPricePerTon).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</li>
              )}
              <li>• Acceso al nivel <span className="font-semibold">{nextTier?.tierName}</span></li>
              <li>• Protección contra el aumento de precios proyectado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

