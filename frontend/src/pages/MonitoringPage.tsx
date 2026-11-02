import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { AUTH_LABELS } from "@/constants/auth"
import { MONITORING_HEADER_TEXTS } from "@/constants/monitoring"
import { ROUTE_PATHS } from "@/constants/routes"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { EmployeeTable } from "@/features/monitoring/components/EmployeeTable"

export function MonitoringPage() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate(ROUTE_PATHS.AUTH, { replace: true })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="space-y-0.5">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              {AUTH_LABELS.MONITORING_TITLE}
            </h1>
            <p className="text-xs text-muted-foreground">
              {user?.email || MONITORING_HEADER_TEXTS.PORTAL_SUBTITLE}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="cursor-pointer"
          >
            {AUTH_LABELS.SIGN_OUT_BUTTON}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <EmployeeTable />
      </main>
    </div>
  )
}

export default MonitoringPage
