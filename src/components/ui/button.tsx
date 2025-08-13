import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 relative overflow-hidden touch-manipulation shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] border-0",
        destructive:
          "bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] border-0",
        outline:
          "border border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 active:scale-[0.98] backdrop-blur-sm",
        secondary:
          "bg-slate-800 text-slate-300 shadow-sm hover:bg-slate-700 hover:text-white hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border-0",
        ghost:
          "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 active:scale-[0.98] border-0 shadow-none",
        link: 
          "text-blue-400 underline-offset-4 hover:underline active:scale-[0.98] border-0 shadow-none",
        gradient:
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 hover:-translate-y-0.5 active:scale-[0.98] border-0",
        success:
          "bg-emerald-600 text-white shadow-md hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] border-0",
        warning:
          "bg-amber-600 text-white shadow-md hover:bg-amber-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] border-0",
        glass:
          "bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:border-slate-600/50 hover:text-white active:scale-[0.98]",
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
  haptic?: boolean // For potential future haptic feedback
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
    haptic = false,
    onClick,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const isDisabled = disabled || loading

    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      // Add subtle haptic feedback on supported devices
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate(10); // Very short vibration
      }
      
      // Add visual feedback class temporarily
      const target = e.currentTarget;
      target.classList.add('feedback-success');
      setTimeout(() => {
        target.classList.remove('feedback-success');
      }, 600);
      
      onClick?.(e);
    }, [onClick, haptic]);

    // Add btn-pulse for primary and gradient variants
    const shouldPulse = variant === 'gradient' || variant === 'default';

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && "w-full",
          shouldPulse && "btn-pulse",
          // Mobile-specific optimizations
          "touch-manipulation select-none"
        )}
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <span className={cn("flex items-center gap-2", loading && "invisible")}>
          {icon && iconPosition === "left" && (
            <span className="flex-shrink-0 icon-interactive">{icon}</span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className="flex-shrink-0 icon-interactive">{icon}</span>
          )}
        </span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

// Specialized button components for common use cases
const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="gradient" haptic {...props} />
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