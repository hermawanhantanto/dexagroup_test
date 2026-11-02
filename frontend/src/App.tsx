import { APP_MESSAGES } from "@/constants/messages"

export function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <h1 className="text-4xl font-bold tracking-tight">
        {APP_MESSAGES.HELLO_WORLD}
      </h1>
    </div>
  )
}

export default App
