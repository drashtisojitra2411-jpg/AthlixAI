import { Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { CopilotPage } from '@/pages/CopilotPage'
import { HeatmapPage } from '@/pages/HeatmapPage'
import { PredictiveOperationsPage } from '@/pages/PredictiveOperationsPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/copilot"
        element={
          <ProtectedRoute>
            <CopilotPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/heatmap"
        element={
          <ProtectedRoute>
            <HeatmapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/predictive-operations"
        element={
          <ProtectedRoute>
            <PredictiveOperationsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
