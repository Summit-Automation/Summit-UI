import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background relative overflow-hidden touch-manipulation",
  {
    variants: {
      variant: {
        default:
          "bg-brand-primary text-white shadow-md hover:bg-blue-600 hover:shadow-lg active:scale-95 hover:-translate-y-0.5",
        destructive:
          "bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg active:scale-95 hover:-translate-y-0.5",
        outline:
          "border-2 border-border-primary bg-transparent text-text-primary shadow-sm hover:bg-surface-elevated hover:border-border-secondary hover:shadow-md active:scale-95",
        secondary:
          "bg-surface-elevated text-text-primary shadow-sm hover:bg-slate-700 hover:shadow-md active:scale-95 hover:-translate-y-0.5",
        ghost:
          "text-text-secondary hover:bg-surface-elevated hover:text-text-primary active:scale-95",
        link: 
          "text-brand-primary underline-offset-4 hover:underline active:scale-95",
        gradient:
          "bg-gradient-primary text-white shadow-lg hover:shadow-xl active:scale-95 hover:-translate-y-0.5 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500",
        success:
          "bg-green-600 text-white shadow-md hover:bg-green-700 hover:shadow-lg active:scale-95 hover:-translate-y-0.5",
        warning:
          "bg-yellow-600 text-white shadow-md hover:bg-yellow-700 hover:shadow-lg active:scale-95 hover:-translate-y-0.5",
        glass:
          "glass border border-border-primary text-text-primary hover:glass-strong hover:border-border-secondary backdrop-blur-xl active:scale-95",
      },
      size: {
        default: "h-10 px-6 py-2 min-h-[44px] sm:min-h-[40px]", // Mobile-friendly touch target
        sm: "h-8 rounded-md px-4 text-xs min-h-[40px] sm:min-h-[32px]",
        lg: "h-12 rounded-xl px-8 text-base font-semibold min-h-[48px]",
        xl: "h-14 rounded-xl px-10 text-lg font-semibold min-h-[56px]",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px]",
        "icon-sm": "h-8 w-8 min-h-[40px] min-w-[40px] sm:min-h-[32px] sm:min-w-[32px]",
        "icon-lg": "h-12 w-12 min-h-[48px] min-w-[48px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    icon,
    iconPosition = "left",
    children,
    disabled,
    fullWidth = false,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const isDisabled = disabled || loading

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && "w-full",
          // Mobile-specific optimizations
          "touch-manipulation select-none"
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <span className={cn("flex items-center gap-2", loading && "invisible")}>
          {icon && iconPosition === "left" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

// Specialized button components for common use cases
const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="gradient" {...props} />
)
PrimaryButton.displayName = "PrimaryButton"

const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="outline" {...props} />
)
SecondaryButton.displayName = "SecondaryButton"

const DangerButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="destructive" {...props} />
)
DangerButton.displayName = "DangerButton"

const SuccessButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="success" {...props} />
)
SuccessButton.displayName = "SuccessButton"

const GlassButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="glass" {...props} />
)
GlassButton.displayName = "GlassButton"

export { 
  Button, 
  buttonVariants, 
  PrimaryButton,
  SecondaryButton, 
  DangerButton,
  SuccessButton,
  GlassButton 
}