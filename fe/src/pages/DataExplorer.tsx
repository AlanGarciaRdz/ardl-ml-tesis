import { useState } from 'react'
import { Card, Text, Heading, Button, TextField, Flex } from '@radix-ui/themes'
import { Search, Filter, Download } from 'lucide-react'

export function DataExplorer() {
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data from your actual JSON - 10 records
  const mockData = [
    {
      id: 272,
      date: "2022-01-02",
      scrap: 467.5,
      gas: 3.92,
      rebar: 715,
      hrcc1: 1415,
      scrap_mxn: 9518.3,
      gas_mxn: 79.8112,
      rebar_mxn: 14557.4,
      hrcc1_mxn: 28809.4,
      tipo_de_cambio: 20.36,
      varilla_distribuidor: 20038.525,
      varilla_credito: 20447.477,
      precio_mercado: 20647.477
    },
    {
      id: 271,
      date: "2022-01-09",
      scrap: 467.5,
      gas: 4.26,
      rebar: 700,
      hrcc1: 1437,
      scrap_mxn: 9485.575,
      gas_mxn: 86.4354,
      rebar_mxn: 14203,
      hrcc1_mxn: 29156.73,
      tipo_de_cambio: 20.29,
      varilla_distribuidor: 19969.63,
      varilla_credito: 20377.176,
      precio_mercado: 20577.176
    },
    {
      id: 270,
      date: "2022-01-16",
      scrap: 474,
      gas: 4,
      rebar: 703.5,
      hrcc1: 1425,
      scrap_mxn: 9693.3,
      gas_mxn: 81.8,
      rebar_mxn: 14386.575,
      hrcc1_mxn: 29141.25,
      tipo_de_cambio: 20.45,
      varilla_distribuidor: 20406.947,
      varilla_credito: 20823.416,
      precio_mercado: 21023.416
    },
    {
      id: 269,
      date: "2022-01-23",
      scrap: 470,
      gas: 4.64,
      rebar: 702,
      hrcc1: 1170,
      scrap_mxn: 9771.3,
      gas_mxn: 96.4656,
      rebar_mxn: 14594.58,
      hrcc1_mxn: 24324.3,
      tipo_de_cambio: 20.79,
      varilla_distribuidor: 20571.158,
      varilla_credito: 20990.977,
      precio_mercado: 21190.977
    },
    {
      id: 268,
      date: "2022-01-30",
      scrap: 502.5,
      gas: 4.57,
      rebar: 737,
      hrcc1: 1190,
      scrap_mxn: 10381.65,
      gas_mxn: 94.4162,
      rebar_mxn: 15226.42,
      hrcc1_mxn: 24585.4,
      tipo_de_cambio: 20.66,
      varilla_distribuidor: 21856.105,
      varilla_credito: 22302.148,
      precio_mercado: 22502.148
    },
    {
      id: 267,
      date: "2022-02-06",
      scrap: 515,
      gas: 3.94,
      rebar: 745.5,
      hrcc1: 1131,
      scrap_mxn: 10572.95,
      gas_mxn: 80.8882,
      rebar_mxn: 15305.115,
      hrcc1_mxn: 23219.43,
      tipo_de_cambio: 20.53,
      varilla_distribuidor: 22258.842,
      varilla_credito: 22713.104,
      precio_mercado: 22913.104
    },
    {
      id: 266,
      date: "2022-02-13",
      scrap: 505.5,
      gas: 4.43,
      rebar: 742.5,
      hrcc1: 1117,
      scrap_mxn: 10251.54,
      gas_mxn: 89.8404,
      rebar_mxn: 15057.9,
      hrcc1_mxn: 22652.76,
      tipo_de_cambio: 20.28,
      varilla_distribuidor: 21582.19,
      varilla_credito: 22022.643,
      precio_mercado: 22222.643
    },
    {
      id: 265,
      date: "2022-02-20",
      scrap: 504.5,
      gas: 4.47,
      rebar: 739,
      hrcc1: 1010,
      scrap_mxn: 10261.53,
      gas_mxn: 90.9198,
      rebar_mxn: 15031.26,
      hrcc1_mxn: 20543.4,
      tipo_de_cambio: 20.34,
      varilla_distribuidor: 21603.22,
      varilla_credito: 22044.104,
      precio_mercado: 22244.104
    },
    {
      id: 264,
      date: "2022-02-27",
      scrap: 645,
      gas: 5.02,
      rebar: 837.5,
      hrcc1: 1175,
      scrap_mxn: 13506.3,
      gas_mxn: 105.1188,
      rebar_mxn: 17537.25,
      hrcc1_mxn: 24604.5,
      tipo_de_cambio: 20.94,
      varilla_distribuidor: 28434.316,
      varilla_credito: 29014.607,
      precio_mercado: 29214.607
    },
    {
      id: 263,
      date: "2022-03-06",
      scrap: 629,
      gas: 4.73,
      rebar: 925.5,
      hrcc1: 1125,
      scrap_mxn: 13146.1,
      gas_mxn: 98.857,
      rebar_mxn: 19342.95,
      hrcc1_mxn: 23512.5,
      tipo_de_cambio: 20.9,
      varilla_distribuidor: 27676,
      varilla_credito: 28240.816,
      precio_mercado: 28440.816
    }
  ]

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
        <Flex gap="4" className="mt-4" direction={{ initial: 'column', sm: 'row' }}>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <TextField.Root 
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </Flex>
      </Card>

      {/* Data Table */}
      <Card size="2">
        <Heading size="4">Material Prices</Heading>
        <Text size="2" color="gray">Current prices and recent changes</Text>
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Scrap (USD)</th>
                <th className="text-left py-3 px-4 font-medium">Gas (USD)</th>
                <th className="text-left py-3 px-4 font-medium">Rebar (USD)</th>
                <th className="text-left py-3 px-4 font-medium">HRCC1 (USD)</th>
                <th className="text-left py-3 px-4 font-medium">Exchange Rate</th>
                <th className="text-left py-3 px-4 font-medium">Market Price (MXN)</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.date}</td>
                  <td className="py-3 px-4">${item.scrap.toFixed(2)}</td>
                  <td className="py-3 px-4">${item.gas.toFixed(2)}</td>
                  <td className="py-3 px-4">${item.rebar.toFixed(2)}</td>
                  <td className="py-3 px-4">${item.hrcc1.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-600">${item.tipo_de_cambio.toFixed(2)}</td>
                  <td className="py-3 px-4 font-semibold">${item.precio_mercado.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="1">
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card size="2" className="custom-card">
          <Heading size="3">Total Records</Heading>
          <div className="text-2xl font-bold mt-2">190</div>
          <Text size="1" color="gray">Historical records available</Text>
        </Card>

        <Card size="2" className="custom-card">
          <Heading size="3">Date Range</Heading>
          <div className="text-2xl font-bold mt-2">2022-2023</div>
          <Text size="1" color="gray">Data coverage period</Text>
        </Card>

        <Card size="2" className="custom-card">
          <Heading size="3">Last Updated</Heading>
          <div className="text-2xl font-bold mt-2">2022-01-02</div>
          <Text size="1" color="gray">Most recent data</Text>
        </Card>
      </div>
    </div>
  )
}
