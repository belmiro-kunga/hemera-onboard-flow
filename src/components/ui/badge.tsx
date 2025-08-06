import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Standard semantic variants
        primary: "ds-badge ds-badge-primary",
        success: "ds-badge ds-badge-success",
        warning: "ds-badge ds-badge-warning",
        danger: "ds-badge ds-badge-danger",
        info: "ds-badge ds-badge-info",
        secondary: "ds-badge ds-badge-secondary",
        neutral: "ds-badge ds-badge-neutral",
        
        // Solid variants (higher contrast)
        "solid-primary": "ds-badge ds-badge-solid-primary",
        "solid-success": "ds-badge ds-badge-solid-success",
        "solid-warning": "ds-badge ds-badge-solid-warning",
        "solid-danger": "ds-badge ds-badge-solid-danger",
        "solid-info": "ds-badge ds-badge-solid-info",
        "solid-secondary": "ds-badge ds-badge-solid-secondary",
        
        // Legacy variants for compatibility
        default: "ds-badge ds-badge-primary",
        destructive: "ds-badge ds-badge-danger",
        outline: "border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "ds-badge-sm",
        md: "ds-badge-md",
        lg: "ds-badge-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const statusVariants = cva(
  "ds-status",
  {
    variants: {
      status: {
        active: "ds-status-active",
        inactive: "ds-status-inactive",
        pending: "ds-status-pending",
        error: "ds-status-error",
        processing: "ds-status-processing",
      },
    },
    defaultVariants: {
      status: "active",
    },
  }
)

const trendVariants = cva(
  "ds-trend",
  {
    variants: {
      trend: {
        positive: "ds-trend-positive",
        negative: "ds-trend-negative",
        neutral: "ds-trend-neutral",
      },
    },
    defaultVariants: {
      trend: "neutral",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusVariants> {}

export interface TrendIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof trendVariants> {
  value?: string | number
  showIcon?: boolean
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  const hasIcon = icon || React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.type === 'svg'
  )
  
  return (
    <div 
      className={cn(
        badgeVariants({ variant, size }), 
        hasIcon && "ds-badge-with-icon",
        className
      )} 
      {...props}
    >
      {icon}
      {children}
    </div>
  )
}

function StatusIndicator({ className, status, children, ...props }: StatusIndicatorProps) {
  return (
    <div className={cn(statusVariants({ status }), className)} {...props}>
      {children}
    </div>
  )
}

function TrendIndicator({ 
  className, 
  trend, 
  value, 
  showIcon = true, 
  children, 
  ...props 
}: TrendIndicatorProps) {
  const getTrendIcon = () => {
    if (!showIcon) return null
    
    switch (trend) {
      case 'positive':
        return <TrendingUp className="w-3 h-3" />
      case 'negative':
        return <TrendingDown className="w-3 h-3" />
      case 'neutral':
        return <Minus className="w-3 h-3" />
      default:
        return null
    }
  }
  
  return (
    <div className={cn("inline-flex items-center gap-1", className)} {...props}>
      <div className={cn(trendVariants({ trend }))}>
        {getTrendIcon()}
        {value && <span>{value}</span>}
      </div>
      {children}
    </div>
  )
}

export { Badge, StatusIndicator, TrendIndicator, badgeVariants, statusVariants, trendVariants }
