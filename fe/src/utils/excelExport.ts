import * as XLSX from 'xlsx'
import { MaterialPrice, ForecastPrice } from '@/components/charts/ForecastChart'

export interface ExportData {
  historicalData: MaterialPrice[]
  forecastData: ForecastPrice[]
  startDate: string
  endDate: string
}

export interface TranslationKeys {
  date: string
  type: string
  typeHistorical: string
  typeForecast: string
  varillaDistribuidor: string
  varillaCredito: string
  precioMercado: string
  scrapMxn: string
  scrap: string
  gasMxn: string
  gas: string
  rebarMxn: string
  rebar: string
  hrcc1Mxn: string
  hrcc1: string
  tipoDeCambio: string
  predictedBajista: string
  predictedConservador: string
  predictedAlza: string
  confidenceLower: string
  confidenceUpper: string
}

export const exportToExcel = (
  data: ExportData,
  translations: TranslationKeys,
  fileName?: string
) => {
  const { historicalData, forecastData, startDate, endDate } = data

  // Preparar datos históricos
  const historicalRows = historicalData.map(item => ({
    [translations.date]: item.date,
    [translations.type]: translations.typeHistorical,
    [translations.varillaDistribuidor]: item.varilla_distribuidor,
    [translations.varillaCredito]: item.varilla_credito,
    [translations.precioMercado]: item.precio_mercado,
    [translations.scrapMxn]: item.scrap_mxn,
    [translations.scrap]: item.scrap,
    [translations.gasMxn]: item.gas_mxn,
    [translations.gas]: item.gas,
    [translations.rebarMxn]: item.rebar_mxn,
    [translations.rebar]: item.rebar,
    [translations.hrcc1Mxn]: item.hrcc1_mxn,
    [translations.hrcc1]: item.hrcc1,
    [translations.tipoDeCambio]: item.tipo_de_cambio,
    [translations.predictedBajista]: null,
    [translations.predictedConservador]: null,
    [translations.predictedAlza]: null,
    [translations.confidenceLower]: null,
    [translations.confidenceUpper]: null,
  }))

  // Preparar datos de pronóstico
  const forecastRows = forecastData.map(item => ({
    [translations.date]: item.date,
    [translations.type]: translations.typeForecast,
    [translations.varillaDistribuidor]: null,
    [translations.varillaCredito]: null,
    [translations.precioMercado]: null,
    [translations.scrapMxn]: null,
    [translations.scrap]: null,
    [translations.gasMxn]: null,
    [translations.gas]: null,
    [translations.rebarMxn]: null,
    [translations.rebar]: null,
    [translations.hrcc1Mxn]: null,
    [translations.hrcc1]: null,
    [translations.tipoDeCambio]: null,
    [translations.predictedBajista]: item.predicted_value_bajista,
    [translations.predictedConservador]: item.predicted_value_conservador,
    [translations.predictedAlza]: item.predicted_value_alza,
    [translations.confidenceLower]: item.confidence_interval.lower,
    [translations.confidenceUpper]: item.confidence_interval.upper,
  }))

  // Combinar datos
  const combinedRows = [...historicalRows, ...forecastRows]

  // Crear workbook y worksheet
  const worksheet = XLSX.utils.json_to_sheet(combinedRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Combinados')

  // Ajustar ancho de columnas automáticamente
  const maxWidth = 20
  const colWidths = Object.keys(combinedRows[0] || {}).map(() => ({ wch: maxWidth }))
  worksheet['!cols'] = colWidths

  // Generar nombre de archivo
  const defaultFileName = `analisis_materiales_${startDate}_${endDate}.xlsx`
  const finalFileName = fileName || defaultFileName

  // Descargar archivo
  XLSX.writeFile(workbook, finalFileName)
}