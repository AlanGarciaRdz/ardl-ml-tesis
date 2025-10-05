import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Landing } from '@/pages/Landing'
import { Dashboard } from '@/pages/Dashboard'
import { DataExplorer } from '@/pages/DataExplorer'
import { Analytics } from '@/pages/Analytics'
import { Settings } from '@/pages/Settings'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Landing page route */}
        <Route path="/" element={<Landing />} />
        
        {/* Dashboard routes with layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="data" element={<DataExplorer />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
