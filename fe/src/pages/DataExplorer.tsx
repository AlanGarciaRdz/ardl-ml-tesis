import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Card, Text, Heading, Button, TextField, Flex } from '@radix-ui/themes'
import { Loader2 } from 'lucide-react'

// Types for the API response
interface MaterialPrice {
  id: number
  date: string
  scrap: number
  gas: number
  rebar: number
  hrcc1: number
  scrap_mxn: number
  gas_mxn: number
  rebar_mxn: number
  hrcc1_mxn: number
  tipo_de_cambio: number
  varilla_distribuidor: number
  varilla_credito: number
  precio_mercado: number
}

interface ApiResponse {
  data: MaterialPrice[]
  total_count: number
  table_name: string
  limit: number
  offset: number
  message: string
}

// API function to fetch data
const fetchMaterialPrices = async (params: {
  table_name: string
  limit: number
  offset: number
  start_date?: string
  end_date?: string
}): Promise<ApiResponse> => {
  const searchParams = new URLSearchParams({
    table_name: params.table_name,
    limit: params.limit.toString(),
    offset: params.offset.toString(),
    ...(params.start_date && { start_date: params.start_date }),
    ...(params.end_date && { end_date: params.end_date })
  })

  const response = await axios.get(`/api/v1/data/?${searchParams}`)
  return response.data
}

export function DataExplorer() {
  const [searchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [startDate, setStartDate] = useState('2025-06-01')
  const [endDate, setEndDate] = useState('2025-09-23')
  const pageSize = 50 

  // Fetch data using React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['materialPrices', currentPage, startDate, endDate],
    queryFn: () => fetchMaterialPrices({
      table_name: 'precios_materiales',
      limit: pageSize,
      offset: currentPage * pageSize,
      start_date: startDate || undefined,
      end_date: endDate || undefined
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  })

  // Filter data based on search term
  const filteredData = data?.data?.filter(item => 
    item.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.scrap.toString().includes(searchTerm) ||
    item.gas.toString().includes(searchTerm) ||
    item.rebar.toString().includes(searchTerm) ||
    item.hrcc1.toString().includes(searchTerm)
  ) || []

  // const handleDateFilter = () => {
  //   setCurrentPage(0) // Reset to first page when filtering
  //   refetch()
  // }

  // const handleClearFilters = () => {
  //   setStartDate('')
  //   setEndDate('')
  //   setSearchTerm('')
  //   setCurrentPage(0)
  //   refetch()
  // }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Explorer</h1>
          <p className="text-gray-600">Explore and analyze material price data</p>
        </div>
        
        <Card size="2" className="custom-card">
          <div className="text-center py-8">
            <Text size="4" color="red">Error loading data</Text>
            <Text size="2" color="gray" className="mt-2">
              {error instanceof Error ? error.message : 'An error occurred while fetching data'}
            </Text>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Explorer</h1>
        <p className="text-gray-600">Explore and analyze material price data</p>
      </div>

      {/* Search and Filters */}
      <Card size="2">
        <Heading size="4">Search & Filters</Heading>
        <Text size="2" color="gray">Find specific materials or filter by criteria</Text>
        
        {/* Date Filters */}
        <Flex gap="4" className="mt-4" direction={{ initial: 'column', sm: 'row' }}>
          <div className="flex-1">
            <Text size="2" weight="medium" className="mb-2 block">Start Date</Text>
            <TextField.Root 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </div>
          <div className="flex-1">
            <Text size="2" weight="medium" className="mb-2 block">End Date</Text>
            <TextField.Root 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </div>
          {/* <div className="flex items-end gap-2">
            <Button onClick={handleDateFilter} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
              Apply Filter
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
          </div> */}
        </Flex>

        {/* Search */}
        {/* <Flex gap="4" className="mt-4" direction={{ initial: 'column', sm: 'row' }}>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <TextField.Root 
              placeholder="Search by date, scrap, gas, rebar, or hrcc1..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </Flex> */}
      </Card>

      {/* Data Table */}
      <Card size="2">
        <Heading size="4">Material Prices</Heading>
        <Text size="2" color="gray">
          {isLoading ? 'Loading data...' : `Showing ${filteredData.length} of ${data?.total_count || 0} records`}
        </Text>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <Text className="ml-2">Loading data...</Text>
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Date (YYYY-MM-DD)</th>
                  <th className="text-left py-3 px-4 font-medium">Scrap (MXN)</th>
                  <th className="text-left py-3 px-4 font-medium">Gas (MXN)</th>
                  <th className="text-left py-3 px-4 font-medium">Rebar (MXN)</th>
                  <th className="text-left py-3 px-4 font-medium">HRCC1 (MXN)</th>
                  <th className="text-left py-3 px-4 font-medium">Varilla Credito (MXN)</th>
                  <th className="text-left py-3 px-4 font-medium">Varilla Distribuidor (MXN)</th>
                  <th className="text-left py-3 px-4 font-medium">Precio Mercado (MXN)</th>
                  {/* <th className="text-left py-3 px-4 font-medium">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.date}</td>
                    <td className="py-3 px-4">${item.scrap_mxn.toFixed(2)}</td>
                    <td className="py-3 px-4">${item.gas_mxn.toFixed(2)}</td>
                    <td className="py-3 px-4">${item.rebar_mxn.toFixed(2)}</td>
                    <td className="py-3 px-4">${item.hrcc1_mxn.toFixed(2)}</td>
                    <td className="py-3 px-4 font-semibold">${item.varilla_credito.toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold">${item.varilla_distribuidor.toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold">${item.precio_mercado.toLocaleString()}</td>
                    
                    {/* <td className="py-3 px-4">
                      <Button variant="ghost" size="1">
                        View Details
                      </Button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.total_count > pageSize && (
          <div className="flex justify-between items-center mt-4">
            <Text size="2" color="gray">
              Page {currentPage + 1} of {Math.ceil(data.total_count / pageSize)}
            </Text>
            <Flex gap="2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0 || isLoading}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(data.total_count / pageSize) - 1 || isLoading}
              >
                Next
              </Button>
            </Flex>
          </div>
        )}
      </Card>

      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card size="2" className="custom-card">
          <Heading size="3">Total Records</Heading>

          <div className="text-2xl font-bold mt-2">{data?.total_count || 0}</div>
          <Text size="1" color="gray">Historical records available</Text>
        </Card>

        <Card size="2" className="custom-card">
          <Heading size="3">Date Range</Heading>
          <div className="text-2xl font-bold mt-2">
            {data?.data?.[0]?.date || 'N/A'} – {data?.data?.[data?.data?.length - 1]?.date || 'N/A'}
          </div>
          <Text size="1" color="gray">Data coverage period</Text>
        </Card>

        <Card size="2" className="custom-card">
          <Heading size="3">Last Updated</Heading>
          <div className="text-2xl font-bold mt-2">{data?.data?.[data?.data?.length - 1]?.date || 'N/A'}</div>
          <Text size="1" color="gray">Most recent data</Text>
        </Card>
      </div>
    </div>
  )
}
