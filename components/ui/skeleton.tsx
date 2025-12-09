"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Basic Skeleton component with shimmer effect
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shape variant */
  variant?: "default" | "circular" | "rounded"
  /** Animation type */
  animation?: "shimmer" | "pulse" | "none"
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", animation = "shimmer", ...props }, ref) => {
    const variantClasses = {
      default: "rounded-md",
      circular: "rounded-full",
      rounded: "rounded-xl",
    }

    const animationClasses = {
      shimmer: "skeleton",
      pulse: "animate-pulse bg-muted",
      none: "bg-muted",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "bg-muted",
          variantClasses[variant],
          animationClasses[animation],
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

// Skeleton Card for loading card states
const SkeletonCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { lines?: number }
>(({ className, lines = 3, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border bg-card p-6 space-y-4",
      className
    )}
    {...props}
  >
    {/* Header */}
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-10" variant="circular" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    {/* Content lines */}
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  </div>
))
SkeletonCard.displayName = "SkeletonCard"

// Skeleton for list items
const SkeletonListItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-4 p-4 rounded-lg border border-border bg-card",
      className
    )}
    {...props}
  >
    <Skeleton className="h-5 w-5" variant="rounded" />
    <div className="space-y-2 flex-1">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
    <Skeleton className="h-8 w-16" variant="rounded" />
  </div>
))
SkeletonListItem.displayName = "SkeletonListItem"

// Skeleton for stat cards
const SkeletonStat = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border bg-card p-4 space-y-3",
      className
    )}
    {...props}
  >
    <Skeleton className="h-3 w-20" />
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-2 w-24" />
  </div>
))
SkeletonStat.displayName = "SkeletonStat"

// Skeleton for charts
const SkeletonChart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border bg-card p-6 space-y-4",
      className
    )}
    {...props}
  >
    <div className="flex justify-between items-center">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-8 w-24" variant="rounded" />
    </div>
    <div className="flex items-end gap-2 h-32">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1"
          style={{ height: `${Math.random() * 60 + 40}%` }}
          variant="rounded"
        />
      ))}
    </div>
  </div>
))
SkeletonChart.displayName = "SkeletonChart"

// AI Thinking Indicator with animated dots
interface ThinkingDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Text to show alongside dots */
  text?: string
  /** Size variant */
  size?: "sm" | "md" | "lg"
}

const ThinkingDots = React.forwardRef<HTMLDivElement, ThinkingDotsProps>(
  ({ className, text = "AI is thinking", size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    }

    const dotSizes = {
      sm: "w-1 h-1",
      md: "w-1.5 h-1.5",
      lg: "w-2 h-2",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 text-muted-foreground",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <span>{text}</span>
        <span className="thinking-dots">
          <span className={cn("rounded-full bg-primary", dotSizes[size])} />
          <span className={cn("rounded-full bg-primary", dotSizes[size])} />
          <span className={cn("rounded-full bg-primary", dotSizes[size])} />
        </span>
      </div>
    )
  }
)
ThinkingDots.displayName = "ThinkingDots"

// AI Processing Card - shows when AI is working
interface AIProcessingProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

const AIProcessing = React.forwardRef<HTMLDivElement, AIProcessingProps>(
  ({ className, title = "Processing", description = "AI is analyzing your data...", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center gap-4 min-h-[200px]",
        className
      )}
      {...props}
    >
      {/* Animated ring */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
      
      <div className="text-center space-y-1">
        <h4 className="font-semibold text-foreground">{title}</h4>
        <ThinkingDots text={description} size="sm" />
      </div>
    </div>
  )
)
AIProcessing.displayName = "AIProcessing"

// Pulsing dot indicator
interface PulsingDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: "primary" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md" | "lg"
}

const PulsingDot = React.forwardRef<HTMLSpanElement, PulsingDotProps>(
  ({ className, color = "primary", size = "md", ...props }, ref) => {
    const colorClasses = {
      primary: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      error: "bg-error",
      info: "bg-info",
    }

    const sizeClasses = {
      sm: "w-2 h-2",
      md: "w-3 h-3",
      lg: "w-4 h-4",
    }

    return (
      <span
        ref={ref}
        className={cn(
          "relative inline-flex rounded-full",
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
            colorClasses[color]
          )}
        />
      </span>
    )
  }
)
PulsingDot.displayName = "PulsingDot"

// Loading Spinner
interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4 border-2",
      md: "w-6 h-6 border-2",
      lg: "w-10 h-10 border-3",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-full border-muted border-t-primary animate-spin",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
Spinner.displayName = "Spinner"

export {
  Skeleton,
  SkeletonCard,
  SkeletonListItem,
  SkeletonStat,
  SkeletonChart,
  ThinkingDots,
  AIProcessing,
  PulsingDot,
  Spinner,
}
