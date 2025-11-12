import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoutes'
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

        {/* Protected Dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
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
