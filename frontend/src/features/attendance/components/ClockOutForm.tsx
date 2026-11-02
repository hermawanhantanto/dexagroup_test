import * as React from "react"
import { isAxiosError } from "axios"
import { LogOut, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ATTENDANCE_CONSTRAINTS,
  ATTENDANCE_UI_MESSAGES,
} from "@/constants/attendance"
import { useClockOutMutation } from "../hooks/use-attendance"

interface ClockOutFormProps {
  initialNotes?: string | null
  clockInAt?: string | null
}

export function ClockOutForm({ initialNotes, clockInAt }: ClockOutFormProps) {
  const clockOutMutation = useClockOutMutation()

  const [prevInitialNotes, setPrevInitialNotes] = React.useState(initialNotes)
  const [notes, setNotes] = React.useState<string>(initialNotes ?? "")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  if (initialNotes !== prevInitialNotes) {
    setPrevInitialNotes(initialNotes)
    setNotes(initialNotes ?? "")
  }

  const formattedClockInTime = clockInAt
    ? new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(clockInAt))
    : null

  const handleSubmit = async (submitEvent: React.FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    setErrorMessage(null)

    try {
      await clockOutMutation.mutateAsync({
        notes: notes.trim() || undefined,
      })
    } catch (submissionError: unknown) {
      if (isAxiosError(submissionError) && submissionError.response?.data?.message) {
        const backendMessage = submissionError.response.data.message
        setErrorMessage(
          Array.isArray(backendMessage)
            ? backendMessage.join(", ")
            : String(backendMessage),
        )
      } else if (submissionError instanceof Error) {
        setErrorMessage(submissionError.message)
      } else {
        setErrorMessage("An unexpected error occurred during clock out.")
      }
    }
  }

  const isSubmitting = clockOutMutation.isPending

  return (
    <Card className="border border-border bg-card shadow-xs">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">
          {ATTENDANCE_UI_MESSAGES.CLOCK_OUT_TITLE}
        </CardTitle>
        <CardDescription>
          {ATTENDANCE_UI_MESSAGES.CLOCK_OUT_SUBTITLE}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive whitespace-pre-wrap"
            >
              {errorMessage}
            </div>
          )}

          {formattedClockInTime && (
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-xs text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>
                You clocked in today at{" "}
                <strong className="text-foreground">{formattedClockInTime}</strong>
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="clock-out-notes">
              {ATTENDANCE_UI_MESSAGES.CLOCK_OUT_NOTES_LABEL}
            </Label>
            <Textarea
              id="clock-out-notes"
              value={notes}
              onChange={(changeEvent) => setNotes(changeEvent.target.value)}
              placeholder={ATTENDANCE_UI_MESSAGES.CLOCK_OUT_NOTES_PLACEHOLDER}
              maxLength={ATTENDANCE_CONSTRAINTS.MAX_NOTES_LENGTH}
              disabled={isSubmitting}
              className="resize-none"
              rows={4}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Populated from check-in notes (editable)</span>
              <span>
                {notes.length} / {ATTENDANCE_CONSTRAINTS.MAX_NOTES_LENGTH}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            variant="default"
            className="w-full font-medium cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {ATTENDANCE_UI_MESSAGES.SUBMITTING_BUTTON}
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                {ATTENDANCE_UI_MESSAGES.SUBMIT_CLOCK_OUT_BUTTON}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
