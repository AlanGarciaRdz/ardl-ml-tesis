import { Card, Text, Heading, Flex } from '@radix-ui/themes'
import { TrendingUp, TrendingDown, Database, Activity } from 'lucide-react'

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your Steel project dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card size="2" className="custom-card">
          <Flex justify="between" align="center" className="pb-2">
            <Text size="2" weight="medium">Cotizaciones</Text>
            <Database className="h-4 w-4 text-gray-400" />
          </Flex>
          <div className="text-2xl font-bold">12,847</div>
          <Text size="1" color="gray">
            <span className="text-green-600">+12%</span> from last month
          </Text>
        </Card>

        <Card size="2" className="custom-card">
          <Flex justify="between" align="center" className="pb-2">
            <Text size="2" weight="medium">Active Materials</Text>
            <Activity className="h-4 w-4 text-gray-400" />
          </Flex>
          <div className="text-2xl font-bold">24</div>
          <Text size="1" color="gray">
            <span className="text-green-600">+2</span> new this week
          </Text>
        </Card>

        <Card size="2" className="custom-card">
          <Flex justify="between" align="center" className="pb-2">
            <Text size="2" weight="medium">Price Changes</Text>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </Flex>
          <div className="text-2xl font-bold">+5.2%</div>
          <Text size="1" color="gray">
            <span className="text-green-600">+0.8%</span> from last week
          </Text>
        </Card>

        <Card size="2" className="custom-card">
          <Flex justify="between" align="center" className="pb-2">
            <Text size="2" weight="medium">Forecast Accuracy</Text>
            <TrendingDown className="h-4 w-4 text-gray-400" />
          </Flex>
          <div className="text-2xl font-bold">87.3%</div>
          <Text size="1" color="gray">
            <span className="text-red-600">-2.1%</span> from last month
          </Text>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card size="2">
          <Heading size="4">Price Trends</Heading>
          <Text size="2" color="gray">Material price changes over time</Text>
          <div className="h-64 flex items-center justify-center text-gray-500 mt-4">
            Chart placeholder - Price trends visualization
          </div>
        </Card>

        <Card size="2">
          <Heading size="4">Material Distribution</Heading>
          <Text size="2" color="gray">Breakdown by material type</Text>
          <div className="h-64 flex items-center justify-center text-gray-500 mt-4">
            Chart placeholder - Material distribution pie chart
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card size="2">
        <Heading size="4">Recent Activity</Heading>
        <Text size="2" color="gray">Latest updates and changes</Text>
        <div className="space-y-4 mt-4">
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">New price data imported</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Forecast model updated</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Data validation completed</p>
              <p className="text-xs text-gray-500">3 days ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
