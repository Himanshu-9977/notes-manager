import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { forwardRef } from "react"
import { type VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/components/ui/button"

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  loadingText?: string
  asChild?: boolean
  children?: React.ReactNode
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, isLoading, loadingText, disabled, variant, size, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        variant={variant}
        size={size}
        className={className}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading && loadingText ? loadingText : children}
      </Button>
    )
  },
)
LoadingButton.displayName = "LoadingButton"

export { LoadingButton }
