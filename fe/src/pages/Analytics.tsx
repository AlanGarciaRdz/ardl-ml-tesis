import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, BarChart3, PieChart, Activity, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

// Types for the API response
interface MaterialPrice {
  id: number
  date: string
  varilla_distribuidor: number
  varilla_credito: number
  precio_mercado: number
}

interface ApiResponse {
  data: MaterialPrice[]
  total_count: number
  limit: number
  offset: number
}

// API function to fetch data
const fetchMaterialPrices = async (): Promise<ApiResponse> => {
  const response = await axios.get('http://127.0.0.1:8000/api/v1/data/?table_name=precios_materiales&start_date=2025-01-01&end_date=2025-09-23')
  return response.data
}




export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Advanced data analysis and insights</p>
      </div>

      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Chart Controls</CardTitle>
          <CardDescription>Customize your analysis views</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Time Series
            </Button>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Bar Chart
            </Button>
            <Button variant="outline">
              <PieChart className="h-4 w-4 mr-2" />
              Pie Chart
            </Button>
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Correlation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
          <CardHeader>
            <CardTitle>Price Trends Analysis</CardTitle>
            <CardDescription>Material price movements over time</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const { data, isLoading, error, refetch } = useQuery({
                queryKey: ['materialPrices'],
                queryFn: fetchMaterialPrices,
                refetchInterval: 30000, // Refetch every 30 seconds
              })

              // Transform data for the chart
              const chartData = data?.data?.map(item => ({
                date: new Date(item.date).toLocaleDateString('es-MX', { 
                  month: 'short', 
                  day: 'numeric' 
                }),
                fullDate: item.date,
                'Varilla Distribuidor': item.varilla_distribuidor,
                'Varilla Crédito': item.varilla_credito,
                'Precio Mercado': item.precio_mercado,
              })) || [] // Reverse to show chronological order

              if (isLoading) {
                return (
                  <div className="h-80 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Loading data...</span>
                    </div>
                  </div>
                )
              }

              if (error) {
                return (
                  <div className="h-80 flex items-center justify-center text-red-500">
                    <div className="text-center">
                      <p>Error loading data</p>
                      <Button variant="outline" onClick={() => refetch()} className="mt-2">
                        Try Again
                      </Button>
                    </div>
                  </div>
                )
              }

              return (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
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
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `$${value.toLocaleString()}`, 
                          name
                        ]}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            return `Date: ${payload[0].payload.fullDate}`
                          }
                          return label
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="Varilla Distribuidor" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Varilla Crédito" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Precio Mercado" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volatility Analysis</CardTitle>
            <CardDescription>Price volatility patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-gray-500">
              Chart placeholder - Volatility heatmap or chart
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistical Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Statistical Insights</CardTitle>
          <CardDescription>Key metrics and correlations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0.87</div>
              <p className="text-sm text-gray-600">Correlation Coefficient</p>
              <p className="text-xs text-gray-500">Copper vs. Gold</p>
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
    </div>
  )
}
