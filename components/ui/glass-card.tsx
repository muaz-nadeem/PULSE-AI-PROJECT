"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const glassCardVariants = cva(
  "relative rounded-2xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--glass-bg)]",
          "backdrop-blur-xl",
          "border border-[var(--glass-border)]",
          "shadow-[var(--shadow-card)]",
        ].join(" "),
        frosted: [
          "bg-white/10 dark:bg-white/5",
          "backdrop-blur-2xl",
          "border border-white/20 dark:border-white/10",
          "shadow-xl",
        ].join(" "),
        gradient: [
          "bg-gradient-to-br from-white/20 to-white/5 dark:from-white/10 dark:to-white/5",
          "backdrop-blur-xl",
          "border border-white/30 dark:border-white/10",
          "shadow-lg",
        ].join(" "),
        solid: [
          "bg-card/95",
          "backdrop-blur-sm",
          "border border-border",
          "shadow-lg",
        ].join(" "),
        vibrant: [
          "bg-gradient-to-br from-primary/10 via-[var(--glass-bg)] to-accent/10",
          "backdrop-blur-xl",
          "border border-primary/20",
          "shadow-[var(--shadow-glow)]",
        ].join(" "),
        subtle: [
          "bg-card/80",
          "backdrop-blur-sm",
          "border border-border/50",
          "shadow-sm",
        ].join(" "),
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      hover: {
        lift: "hover:-translate-y-1 hover:shadow-2xl cursor-pointer",
        glow: "hover:shadow-[var(--shadow-glow)] cursor-pointer",
        scale: "hover:scale-[1.02] cursor-pointer",
        none: "",
      },
      glow: {
        true: "shadow-[var(--shadow-glow)]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      hover: "none",
      glow: false,
    },
  }
)

interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  /** Optional gradient border effect */
  gradientBorder?: boolean
  /** Animated entrance effect */
  animate?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, hover, glow, gradientBorder, animate, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          glassCardVariants({ variant, size, hover, glow }),
          gradientBorder && "gradient-border",
          animate && "fade-slide-in",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

// Glass Card Header
const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
))
GlassCardHeader.displayName = "GlassCardHeader"

// Glass Card Title
const GlassCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
GlassCardTitle.displayName = "GlassCardTitle"

// Glass Card Description
const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
GlassCardDescription.displayName = "GlassCardDescription"

// Glass Card Content
const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
GlassCardContent.displayName = "GlassCardContent"

// Glass Card Footer
const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
))
GlassCardFooter.displayName = "GlassCardFooter"

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
  glassCardVariants,
}
