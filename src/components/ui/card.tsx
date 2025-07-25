import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-xl border transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-slate-900 border-slate-800 shadow-lg hover:shadow-xl hover:border-slate-700 card-interactive",
        elevated: "bg-slate-800 border-slate-700 shadow-xl hover:shadow-2xl card-interactive",
        glass: "glass hover:glass-strong card-interactive",
        metric: "bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-slate-800 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 backdrop-blur-sm card-interactive",
        interactive: "bg-slate-900 border-slate-800 shadow-md hover:shadow-lg hover:border-blue-600/50 cursor-pointer card-interactive",
        outline: "bg-transparent border-slate-800 hover:bg-slate-900/50 hover:border-slate-700 card-interactive",
        premium: "bg-gradient-to-br from-slate-900/90 to-slate-800/70 border-blue-600/20 shadow-xl hover:shadow-glow backdrop-blur-sm card-interactive",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, size }), className)}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    gradient?: boolean
  }
>(({ className, gradient, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5",
      gradient && "bg-gradient-primary bg-clip-text text-transparent",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    gradient?: boolean
    size?: "sm" | "default" | "lg" | "xl"
  }
>(({ className, gradient, size = "default", ...props }, ref) => {
  const sizeClasses = {
    sm: "text-sm",
    default: "text-lg",
    lg: "text-xl",
    xl: "text-2xl"
  }

  return (
    <h3
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight text-text-primary",
        sizeClasses[size],
        gradient && "bg-gradient-primary bg-clip-text text-transparent",
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    muted?: boolean
  }
>(({ className, muted = true, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm leading-relaxed",
      muted ? "text-text-muted" : "text-text-secondary",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    noPadding?: boolean
  }
>(({ className, noPadding, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(!noPadding && "pt-0", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    bordered?: boolean
  }
>(({ className, bordered, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center pt-0",
      bordered && "border-t border-border-primary pt-6",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-end space-x-2",
      className
    )}
    {...props}
  />
))
CardAction.displayName = "CardAction"

// Specialized card components for common use cases
const MetricCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string
    value: string | number
    subtitle?: string
    trend?: "up" | "down" | "neutral"
    icon?: React.ReactNode
    loading?: boolean
  }
>(({ className, title, value, subtitle, trend, icon, loading, ...props }, ref) => (
  <Card
    ref={ref}
    variant="metric"
    className={cn("group", className)}
    {...props}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle size="sm" className="text-text-muted uppercase tracking-wide font-medium">
        {title}
      </CardTitle>
      {icon && (
        <div className={cn(
          "p-2 rounded-lg transition-all duration-300 group-hover:scale-110",
          trend === "up" && "bg-green-400/10 text-green-400",
          trend === "down" && "bg-red-400/10 text-red-400",
          trend === "neutral" && "bg-blue-400/10 text-blue-400",
          !trend && "bg-slate-400/10 text-slate-400"
        )}>
          {icon}
        </div>
      )}
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 bg-surface-elevated rounded animate-pulse" />
          <div className="h-4 bg-surface-elevated rounded animate-pulse w-1/2" />
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold text-text-primary">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-text-muted mt-1">
              {subtitle}
            </p>
          )}
        </>
      )}
    </CardContent>
  </Card>
))
MetricCard.displayName = "MetricCard"

const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, size, ...props }, ref) => (
  <Card
    ref={ref}
    variant="glass"
    size={size}
    className={className}
    {...props}
  />
))
GlassCard.displayName = "GlassCard"

const InteractiveCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, size, ...props }, ref) => (
  <Card
    ref={ref}
    variant="interactive"
    size={size}
    className={className}
    {...props}
  />
))
InteractiveCard.displayName = "InteractiveCard"

const PremiumCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, size, ...props }, ref) => (
  <Card
    ref={ref}
    variant="premium"
    size={size}
    className={className}
    {...props}
  />
))
PremiumCard.displayName = "PremiumCard"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  MetricCard,
  GlassCard,
  InteractiveCard,
  PremiumCard,
  cardVariants,
}