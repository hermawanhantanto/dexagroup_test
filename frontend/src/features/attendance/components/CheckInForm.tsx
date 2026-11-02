import * as React from "react"
import { isAxiosError } from "axios"
import { Camera, UploadCloud, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ATTENDANCE_CONSTRAINTS,
  ATTENDANCE_UI_MESSAGES,
} from "@/constants/attendance"
import { attendanceService } from "../services/attendance-service"
import { useCheckInMutation } from "../hooks/use-attendance"

interface CheckInFormProps {
  onCheckInSuccess?: () => void | Promise<unknown>
}

export function CheckInForm({ onCheckInSuccess }: CheckInFormProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const checkInMutation = useCheckInMutation()

  const [notes, setNotes] = React.useState("")
  const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const handleFileChange = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null)
    const files = changeEvent.target.files
    if (!files || files.length === 0) return

    const chosenFile = files[0]

    const isAllowedType = (
      ATTENDANCE_CONSTRAINTS.ALLOWED_IMAGE_TYPES as readonly string[]
    ).includes(chosenFile.type)

    if (!isAllowedType) {
      setErrorMessage(ATTENDANCE_UI_MESSAGES.FILE_TYPE_ERROR)
      return
    }

    if (chosenFile.size > ATTENDANCE_CONSTRAINTS.MAX_FILE_SIZE_BYTES) {
      setErrorMessage(ATTENDANCE_UI_MESSAGES.FILE_SIZE_ERROR)
      return
    }

    setSelectedImageFile(chosenFile)
    const objectUrl = URL.createObjectURL(chosenFile)
    setPreviewImageUrl(objectUrl)
  }

  const handleClearSelectedFile = () => {
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl)
    }
    setSelectedImageFile(null)
    setPreviewImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (submitEvent: React.FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    setErrorMessage(null)

    if (!selectedImageFile) {
      setErrorMessage(ATTENDANCE_UI_MESSAGES.FILE_REQUIRED_ERROR)
      return
    }

    setIsUploading(true)

    try {
      const uploadCredentials =
        await attendanceService.requestPresignedUploadUrl({
          mimeType: selectedImageFile.type as
            | "image/jpeg"
            | "image/png"
            | "image/webp",
          fileSize: selectedImageFile.size,
        })

      await attendanceService.uploadProofImageToStorage(
        uploadCredentials.uploadUrl,
        selectedImageFile,
      )

      await checkInMutation.mutateAsync({
        proofImageUrl: uploadCredentials.publicUrl,
        notes: notes.trim() || undefined,
      })

      if (onCheckInSuccess) {
        await onCheckInSuccess()
      }

      handleClearSelectedFile()
      setNotes("")
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
        setErrorMessage(ATTENDANCE_UI_MESSAGES.UPLOAD_FAILED_ERROR)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const isSubmitting = isUploading || checkInMutation.isPending

  return (
    <Card className="border border-border bg-card shadow-xs">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">
          {ATTENDANCE_UI_MESSAGES.CLOCK_IN_TITLE}
        </CardTitle>
        <CardDescription>
          {ATTENDANCE_UI_MESSAGES.CLOCK_IN_SUBTITLE}
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

          <div className="space-y-2">
            <Label htmlFor="selfie-file-input">
              {ATTENDANCE_UI_MESSAGES.PROOF_IMAGE_LABEL}
            </Label>
            <p className="text-xs text-muted-foreground">
              {ATTENDANCE_UI_MESSAGES.PROOF_IMAGE_HELP}
            </p>

            <input
              ref={fileInputRef}
              id="selfie-file-input"
              type="file"
              accept={ATTENDANCE_CONSTRAINTS.ACCEPTED_FILE_EXTENSIONS}
              capture="user"
              onChange={handleFileChange}
              disabled={isSubmitting}
              className="hidden"
            />

            {!previewImageUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-8 text-center transition hover:bg-muted/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Camera className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  {ATTENDANCE_UI_MESSAGES.CHOOSE_FILE_BUTTON}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click to open camera or browse from device
                </p>
              </div>
            ) : (
              <div className="relative inline-block overflow-hidden rounded-xl border border-border bg-muted/30 p-2">
                <img
                  src={previewImageUrl}
                  alt="Selfie preview"
                  className="h-44 w-auto rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={handleClearSelectedFile}
                  disabled={isSubmitting}
                  className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm hover:bg-background cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mt-2 flex items-center justify-between px-1">
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {selectedImageFile?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="text-xs font-medium text-primary hover:underline cursor-pointer"
                  >
                    {ATTENDANCE_UI_MESSAGES.CHANGE_FILE_BUTTON}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clock-in-notes">
              {ATTENDANCE_UI_MESSAGES.NOTES_LABEL}
            </Label>
            <Textarea
              id="clock-in-notes"
              value={notes}
              onChange={(changeEvent) => setNotes(changeEvent.target.value)}
              placeholder={ATTENDANCE_UI_MESSAGES.NOTES_PLACEHOLDER}
              maxLength={ATTENDANCE_CONSTRAINTS.MAX_NOTES_LENGTH}
              disabled={isSubmitting}
              className="resize-none"
              rows={3}
            />
            <div className="flex justify-end text-xs text-muted-foreground">
              {notes.length} / {ATTENDANCE_CONSTRAINTS.MAX_NOTES_LENGTH}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !selectedImageFile}
            className="w-full font-medium cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {ATTENDANCE_UI_MESSAGES.UPLOADING_BUTTON}
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {ATTENDANCE_UI_MESSAGES.SUBMITTING_BUTTON}
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                {ATTENDANCE_UI_MESSAGES.SUBMIT_CLOCK_IN_BUTTON}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
