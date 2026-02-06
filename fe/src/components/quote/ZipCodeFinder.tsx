import { useState, useEffect } from 'react'
import { Search, MapPin, X, ChevronRight } from 'lucide-react'
import axios from 'axios'

interface Region {
  id: number
  estado_id: number
  nombre: string
}

interface Municipality {
  id: number
  nombre: string
  cp_inicio: string
  cp_fin: string
}

interface ZipCodeFinderProps {
  isOpen: boolean
  onClose: () => void
  onSelectZipCode: (zipCode: string, municipalityName: string) => void
}

export function ZipCodeFinder({ isOpen, onClose, onSelectZipCode }: ZipCodeFinderProps) {
  const [step, setStep] = useState<'region' | 'municipality'>('region')
  const [regions, setRegions] = useState<Region[]>([])
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load regions when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRegions()
      setStep('region')
      setSelectedRegion(null)
      setSearchQuery('')
    }
  }, [isOpen])

  const loadRegions = async () => {
    setLoading(true)
    setError(null)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await axios.get(`${API_URL}/api/v1/locations/regions`)
      setRegions(response.data)
    } catch (err) {
      setError('Error al cargar regiones')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadMunicipalities = async (regionId: number) => {
    setLoading(true)
    setError(null)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await axios.get(`${API_URL}/api/v1/locations/regions/${regionId}/municipalities`)
      setMunicipalities(response.data)
      setStep('municipality')
    } catch (err) {
      setError('Error al cargar municipios')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region)
    loadMunicipalities(region.id)
  }

  const handleMunicipalitySelect = (municipality: Municipality) => {
    // Use the middle of the range or cp_inicio
    onSelectZipCode(municipality.cp_inicio, municipality.nombre)
    onClose()
  }

  const handleBack = () => {
    setStep('region')
    setSelectedRegion(null)
    setMunicipalities([])
  }

  const filteredRegions = regions.filter(region =>
    region.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMunicipalities = municipalities.filter(municipality =>
    municipality.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-indigo-600" />
              Buscar Código Postal
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-600">
            <span className={step === 'region' ? 'font-semibold text-indigo-600' : ''}>
              Región
            </span>
            {step === 'municipality' && (
              <>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="font-semibold text-indigo-600">
                  {selectedRegion?.nombre}
                </span>
              </>
            )}
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={step === 'region' ? 'Buscar región...' : 'Buscar municipio...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Cargando...</div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : step === 'region' ? (
            <div className="grid grid-cols-1 gap-3">
              {filteredRegions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => handleRegionSelect(region)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left flex items-center justify-between group"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{region.nombre}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                </button>
              ))}
              {filteredRegions.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No se encontraron regiones
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMunicipalities.map((municipality) => (
                <button
                  key={municipality.id}
                  onClick={() => handleMunicipalitySelect(municipality)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{municipality.nombre}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        CP: {municipality.cp_inicio} - {municipality.cp_fin}
                      </p>
                    </div>
                    <div className="text-indigo-600 font-bold text-lg">
                      {municipality.cp_inicio}
                    </div>
                  </div>
                </button>
              ))}
              {filteredMunicipalities.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No se encontraron municipios
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          {step === 'municipality' && (
            <button
              onClick={handleBack}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ← Volver a Regiones
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

