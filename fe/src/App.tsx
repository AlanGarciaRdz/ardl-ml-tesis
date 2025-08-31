import { Routes, Route } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Dashboard } from '@/pages/Dashboard'
import { DataExplorer } from '@/pages/DataExplorer'
import { Analytics } from '@/pages/Analytics'
import { Settings } from '@/pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="data" element={<DataExplorer />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
