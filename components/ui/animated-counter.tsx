"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  /** Target value to count to */
  value: number
  /** Duration of animation in milliseconds */
  duration?: number
  /** Number of decimal places */
  decimals?: number
  /** Prefix (e.g., "$") */
  prefix?: string
  /** Suffix (e.g., "%", "hrs") */
  suffix?: string
  /** Whether to animate on mount */
  animateOnMount?: boolean
  /** Custom formatter function */
  formatter?: (value: number) => string
  /** Custom class name */
  className?: string
  /** Text size variant */
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
}

export function AnimatedCounter({
  value,
  duration = 1000,
  decimals = 0,
  prefix = "",
  suffix = "",
  animateOnMount = true,
  formatter,
  className,
  size = "md",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(animateOnMount ? 0 : value)
  const previousValue = React.useRef(animateOnMount ? 0 : value)
  const animationRef = React.useRef<number | undefined>(undefined)

  const sizeClasses = {
    sm: "text-lg font-semibold",
    md: "text-2xl font-bold",
    lg: "text-3xl font-bold",
    xl: "text-4xl font-bold",
    "2xl": "text-5xl font-bold",
  }

  React.useEffect(() => {
    const startValue = previousValue.current
    const endValue = value
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      const currentValue = startValue + (endValue - startValue) * easeOut
      setDisplayValue(currentValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        previousValue.current = endValue
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration])

  const formattedValue = formatter
    ? formatter(displayValue)
    : displayValue.toFixed(decimals)

  return (
    <span className={cn("font-mono tabular-nums", sizeClasses[size], className)}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  )
}

// Animated percentage with optional ring
interface AnimatedPercentageProps {
  value: number
  size?: "sm" | "md" | "lg"
  showRing?: boolean
  ringColor?: string
  className?: string
}

export function AnimatedPercentage({
  value,
  size = "md",
  showRing = true,
  ringColor,
  className,
}: AnimatedPercentageProps) {
  const [displayValue, setDisplayValue] = React.useState(0)
  const circumference = 2 * Math.PI * 45 // r=45

  const sizeConfig = {
    sm: { container: "w-16 h-16", text: "text-sm", strokeWidth: 4 },
    md: { container: "w-24 h-24", text: "text-xl", strokeWidth: 6 },
    lg: { container: "w-32 h-32", text: "text-2xl", strokeWidth: 8 },
  }

  React.useEffect(() => {
    const duration = 1000
    const startTime = performance.now()
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      setDisplayValue(value * easeOut)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  const config = sizeConfig[size]
  const strokeDashoffset = circumference - (displayValue / 100) * circumference

  return (
    <div className={cn("relative", config.container, className)}>
      {showRing && (
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className="stroke-muted"
            strokeWidth={config.strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className={ringColor || "stroke-primary"}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
          />
        </svg>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("font-mono font-bold", config.text)}>
          {Math.round(displayValue)}%
        </span>
      </div>
    </div>
  )
}

// Animated stat card
interface AnimatedStatProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  trend?: {
    value: number
    direction: "up" | "down" | "neutral"
  }
  icon?: React.ReactNode
  className?: string
}

export function AnimatedStat({
  label,
  value,
  prefix,
  suffix,
  decimals = 0,
  trend,
  icon,
  className,
}: AnimatedStatProps) {
  const trendColors = {
    up: "text-success",
    down: "text-error",
    neutral: "text-muted-foreground",
  }

  const trendIcons = {
    up: "↑",
    down: "↓",
    neutral: "→",
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          size="lg"
        />
        {trend && (
          <span className={cn("text-sm font-medium", trendColors[trend.direction])}>
            {trendIcons[trend.direction]} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  )
}

// Timer display with animated digits
interface AnimatedTimerProps {
  seconds: number
  className?: string
}

export function AnimatedTimer({ seconds, className }: AnimatedTimerProps) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const formatNumber = (num: number) => num.toString().padStart(2, "0")

  return (
    <span className={cn("font-mono text-4xl font-bold tabular-nums", className)}>
      {hours > 0 && (
        <>
          <span className="transition-all duration-150">{formatNumber(hours)}</span>
          <span className="text-muted-foreground mx-1">:</span>
        </>
      )}
      <span className="transition-all duration-150">{formatNumber(minutes)}</span>
      <span className="text-muted-foreground mx-1">:</span>
      <span className="transition-all duration-150">{formatNumber(secs)}</span>
    </span>
  )
}

// Streak counter with flame animation
interface StreakCounterProps {
  count: number
  label?: string
  className?: string
}

export function StreakCounter({ count, label = "day streak", className }: StreakCounterProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-2xl animate-pulse">🔥</span>
      <div className="flex items-baseline gap-1">
        <AnimatedCounter value={count} size="lg" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

// Animated Progress Ring
interface AnimatedProgressRingProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  showValue?: boolean
  className?: string
}

export function AnimatedProgressRing({
  value,
  size = 80,
  strokeWidth = 6,
  showValue = true,
  className,
}: AnimatedProgressRingProps) {
  const [displayValue, setDisplayValue] = React.useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (displayValue / 100) * circumference

  React.useEffect(() => {
    const duration = 1000
    const startTime = performance.now()
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      setDisplayValue(value * easeOut)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  return (
    <div 
      className={cn("relative", className)} 
      style={{ width: size, height: size }}
    >
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-primary"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold font-mono">
            {Math.round(displayValue)}%
          </span>
        </div>
      )}
    </div>
  )
}

// Energy level indicator
interface EnergyIndicatorProps {
  level: number // 1-5
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export function EnergyIndicator({ 
  level, 
  size = "md", 
  showLabel = true,
  className 
}: EnergyIndicatorProps) {
  const clampedLevel = Math.max(1, Math.min(5, Math.round(level)))
  
  const sizeConfig = {
    sm: { bar: "h-2 w-4", gap: "gap-0.5", text: "text-xs" },
    md: { bar: "h-3 w-5", gap: "gap-1", text: "text-sm" },
    lg: { bar: "h-4 w-6", gap: "gap-1.5", text: "text-base" },
  }
  
  const labels = ["Very Low", "Low", "Medium", "High", "Very High"]
  const colors = [
    "bg-red-500",
    "bg-orange-500", 
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ]
  
  const config = sizeConfig[size]

  return (
    <div className={cn("flex items-center", config.gap, className)}>
      <div className={cn("flex", config.gap)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              config.bar,
              "rounded-sm transition-all duration-300",
              i <= clampedLevel ? colors[clampedLevel - 1] : "bg-muted"
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className={cn(config.text, "text-muted-foreground ml-2")}>
          {labels[clampedLevel - 1]}
        </span>
      )}
    </div>
  )
}
