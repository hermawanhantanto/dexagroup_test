import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { isAxiosError } from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  AUTH_LABELS,
  USER_ROLES,
} from "@/constants/auth"
import { ROUTE_PATHS } from "@/constants/routes"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { RoleSegmentedControl } from "@/features/auth/components/RoleSegmentedControl"
import {
  signInSchema,
  type SignInFormValues,
} from "@/features/auth/schemas/sign-in-schema"

export function SignInForm() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [serverErrorMessage, setServerErrorMessage] = React.useState<string | null>(null)

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      role: USER_ROLES.EMPLOYEE,
    },
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async (values: SignInFormValues): Promise<void> => {
    setServerErrorMessage(null)

    try {
      const authenticatedUser = await signIn(values)

      if (authenticatedUser.role === USER_ROLES.HR_ADMIN) {
        navigate(ROUTE_PATHS.MONITORING, { replace: true })
      } else {
        navigate(ROUTE_PATHS.ATTENDANCE, { replace: true })
      }
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data?.message) {
        const errorDetail = error.response.data.message
        const formattedMessage = Array.isArray(errorDetail)
          ? errorDetail.join(", ")
          : String(errorDetail)
        setServerErrorMessage(formattedMessage)
      } else if (error instanceof Error) {
        setServerErrorMessage(error.message)
      } else {
        setServerErrorMessage("An unexpected error occurred during sign in.")
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {serverErrorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive"
          >
            {serverErrorMessage}
          </div>
        )}

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{AUTH_LABELS.ROLE_LABEL}</FormLabel>
              <FormControl>
                <RoleSegmentedControl
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{AUTH_LABELS.EMAIL_LABEL}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder={AUTH_LABELS.EMAIL_PLACEHOLDER}
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{AUTH_LABELS.PASSWORD_LABEL}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder={AUTH_LABELS.PASSWORD_PLACEHOLDER}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full mt-2 font-medium cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? AUTH_LABELS.SUBMITTING_BUTTON
            : AUTH_LABELS.SUBMIT_BUTTON}
        </Button>
      </form>
    </Form>
  )
}
