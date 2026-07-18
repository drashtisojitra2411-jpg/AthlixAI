import { Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { CopilotPage } from '@/pages/CopilotPage'
import { HeatmapPage } from '@/pages/HeatmapPage'
import { PredictiveOperationsPage } from '@/pages/PredictiveOperationsPage'
import { EmergencyCommandCenterPage } from '@/pages/EmergencyCommandCenterPage'
import { PresentationModePage } from '@/pages/PresentationModePage'
import { ParkingPage } from '@/pages/ParkingPage'
import { RevenuePage } from '@/pages/RevenuePage'
import { TicketingPage } from '@/pages/TicketingPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { VisitorHomePage } from '@/pages/VisitorHomePage'
import { VisitorBrowseEventsPage } from '@/pages/VisitorBrowseEventsPage'
import { VisitorEventDetailPage } from '@/pages/VisitorEventDetailPage'
import { VisitorMyTicketsPage } from '@/pages/VisitorMyTicketsPage'
import { VisitorStadiumPage } from '@/pages/VisitorStadiumPage'
import { VisitorParkingPage } from '@/pages/VisitorParkingPage'
import { VisitorFoodPage } from '@/pages/VisitorFoodPage'
import { VisitorAssistantPage } from '@/pages/VisitorAssistantPage'
import { VisitorEmergencyPage } from '@/pages/VisitorEmergencyPage'
import { VisitorProfilePage } from '@/pages/VisitorProfilePage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

const ORGANIZER_ROLES = ['Admin', 'Organizer'] as const
const VISITOR_ROLES = ['Visitor'] as const

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Organizer / Admin — Operations Command Center (unchanged) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[...ORGANIZER_ROLES]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/copilot"
        element={
          <ProtectedRoute allowedRoles={[...ORGANIZER_ROLES]}>
            <CopilotPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/heatmap"
        element={
          <ProtectedRoute allowedRoles={[...ORGANIZER_ROLES]}>
            <HeatmapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/predictive-operations"
        element={
          <ProtectedRoute allowedRoles={[...ORGANIZER_ROLES]}>
            <PredictiveOperationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/emergency"
        element={
          <ProtectedRoute allowedRoles={[...ORGANIZER_ROLES]}>
            <EmergencyCommandCenterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/demo"
        element={
          <ProtectedRoute allowedRoles={[...ORGANIZER_ROLES]}>
            <PresentationModePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/parking"
        element={
          <ProtectedRoute allowedRoles={[...ORGANIZER_ROLES]}>
            <ParkingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/revenue"
        element={
          <ProtectedRoute allowedRoles={[...ORGANIZER_ROLES]}>
            <RevenuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/ticketing"
        element={
          <ProtectedRoute allowedRoles={[...ORGANIZER_ROLES]}>
            <TicketingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute allowedRoles={[...ORGANIZER_ROLES]}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Visitor — Stadium Experience */}
      <Route
        path="/visitor"
        element={
          <ProtectedRoute allowedRoles={[...VISITOR_ROLES]}>
            <VisitorHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visitor/events"
        element={
          <ProtectedRoute allowedRoles={[...VISITOR_ROLES]}>
            <VisitorBrowseEventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visitor/events/:eventId"
        element={
          <ProtectedRoute allowedRoles={[...VISITOR_ROLES]}>
            <VisitorEventDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visitor/tickets"
        element={
          <ProtectedRoute allowedRoles={[...VISITOR_ROLES]}>
            <VisitorMyTicketsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visitor/stadium"
        element={
          <ProtectedRoute allowedRoles={[...VISITOR_ROLES]}>
            <VisitorStadiumPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visitor/parking"
        element={
          <ProtectedRoute allowedRoles={[...VISITOR_ROLES]}>
            <VisitorParkingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visitor/food"
        element={
          <ProtectedRoute allowedRoles={[...VISITOR_ROLES]}>
            <VisitorFoodPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visitor/assistant"
        element={
          <ProtectedRoute allowedRoles={[...VISITOR_ROLES]}>
            <VisitorAssistantPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visitor/emergency"
        element={
          <ProtectedRoute allowedRoles={[...VISITOR_ROLES]}>
            <VisitorEmergencyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visitor/profile"
        element={
          <ProtectedRoute allowedRoles={[...VISITOR_ROLES]}>
            <VisitorProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
