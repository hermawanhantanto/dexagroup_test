import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ROUTE_PATHS } from "@/constants/routes"
import { AuthProvider } from "@/features/auth/context/auth-context"
import { AuthPage } from "@/pages/AuthPage"
import { AttendancePage } from "@/pages/AttendancePage"
import { MonitoringPage } from "@/pages/MonitoringPage"
import "@/index.css"

const queryClient = new QueryClient()

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path={ROUTE_PATHS.ROOT}
              element={<Navigate to={ROUTE_PATHS.AUTH} replace />}
            />
            <Route path={ROUTE_PATHS.AUTH} element={<AuthPage />} />
            <Route
              path={ROUTE_PATHS.ATTENDANCE}
              element={<AttendancePage />}
            />
            <Route
              path={ROUTE_PATHS.MONITORING}
              element={<MonitoringPage />}
            />
            <Route
              path="*"
              element={<Navigate to={ROUTE_PATHS.AUTH} replace />}
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
