import { AUTH_LABELS } from "@/constants/auth"
import { SignInForm } from "@/features/auth/components/SignInForm"

export function AuthPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-sm space-y-6">
        <header className="space-y-1.5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground tracking-wide uppercase">
            Workforce ERP
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {AUTH_LABELS.SIGN_IN_TITLE}
          </h1>
          <p className="text-xs text-muted-foreground">
            {AUTH_LABELS.SIGN_IN_SUBTITLE}
          </p>
        </header>

        <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <SignInForm />
        </section>

        <footer className="text-center text-[11px] text-muted-foreground">
          Dexa Group Attendance & Monitoring Microservice
        </footer>
      </div>
    </main>
  )
}

export default AuthPage
