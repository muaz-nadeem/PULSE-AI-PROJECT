"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  duration: number
  rotation: number
  size: number
}

interface ConfettiProps {
  /** Whether confetti is active */
  active: boolean
  /** Number of confetti pieces */
  count?: number
  /** Duration in milliseconds */
  duration?: number
  /** Custom colors */
  colors?: string[]
  /** Callback when animation ends */
  onComplete?: () => void
  /** Custom class name */
  className?: string
}

const defaultColors = [
  "#667eea", // Primary
  "#764ba2", // Accent
  "#10b981", // Success
  "#f59e0b", // Warning
  "#3b82f6", // Info
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
]

export function Confetti({
  active,
  count = 50,
  duration = 3000,
  colors = defaultColors,
  onComplete,
  className,
}: ConfettiProps) {
  const [pieces, setPieces] = React.useState<ConfettiPiece[]>([])
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    if (active) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        rotation: Math.random() * 720 - 360,
        size: 8 + Math.random() * 8,
      }))
      
      setPieces(newPieces)
      setIsVisible(true)

      // Clean up after animation
      const timeout = setTimeout(() => {
        setIsVisible(false)
        setPieces([])
        onComplete?.()
      }, duration)

      return () => clearTimeout(timeout)
    }
  }, [active, count, colors, duration, onComplete])

  if (!isVisible || pieces.length === 0) return null

  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none z-[9999] overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0"
          style={{
            left: `${piece.x}%`,
            animation: `confetti-fall ${piece.duration}s ease-out ${piece.delay}s forwards`,
          }}
        >
          <div
            style={{
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
              borderRadius: "2px",
              animation: `confetti-shake ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

// Celebration burst effect - radiates from a point
interface CelebrationBurstProps {
  active: boolean
  x?: number
  y?: number
  size?: "sm" | "md" | "lg"
  onComplete?: () => void
}

export function CelebrationBurst({
  active,
  x = 50,
  y = 50,
  size = "md",
  onComplete,
}: CelebrationBurstProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  const sizeConfig = {
    sm: { particles: 8, distance: 40 },
    md: { particles: 12, distance: 60 },
    lg: { particles: 16, distance: 80 },
  }

  React.useEffect(() => {
    if (active) {
      setIsVisible(true)
      const timeout = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 800)
      return () => clearTimeout(timeout)
    }
  }, [active, onComplete])

  if (!isVisible) return null

  const { particles, distance } = sizeConfig[size]

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    >
      <div
        className="absolute"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {Array.from({ length: particles }).map((_, i) => {
          const angle = (i / particles) * 360
          const radians = (angle * Math.PI) / 180
          const endX = Math.cos(radians) * distance
          const endY = Math.sin(radians) * distance
          
          return (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary"
              style={{
                animation: "burstOut 0.6s ease-out forwards",
                "--end-x": `${endX}px`,
                "--end-y": `${endY}px`,
              } as React.CSSProperties}
            />
          )
        })}
      </div>
      
      <style jsx>{`
        @keyframes burstOut {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--end-x), var(--end-y)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// Success checkmark animation
interface SuccessCheckProps {
  show: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function SuccessCheck({ show, size = "md", className }: SuccessCheckProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  const strokeWidths = {
    sm: 3,
    md: 4,
    lg: 5,
  }

  if (!show) return null

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg
        className="w-full h-full"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Circle */}
        <circle
          cx="26"
          cy="26"
          r="23"
          className="stroke-success"
          strokeWidth={strokeWidths[size]}
          fill="none"
          style={{
            strokeDasharray: 145,
            strokeDashoffset: 145,
            animation: "circle-draw 0.4s ease-out forwards",
          }}
        />
        {/* Checkmark */}
        <path
          d="M14 27 L22 35 L38 19"
          className="stroke-success"
          strokeWidth={strokeWidths[size]}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            strokeDasharray: 40,
            strokeDashoffset: 40,
            animation: "check-draw 0.3s ease-out 0.4s forwards",
          }}
        />
      </svg>
      
      <style jsx>{`
        @keyframes circle-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes check-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )
}

// Fireworks effect for major achievements
interface FireworksProps {
  active: boolean
  duration?: number
  onComplete?: () => void
}

export function Fireworks({ active, duration = 2500, onComplete }: FireworksProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [bursts, setBursts] = React.useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  React.useEffect(() => {
    if (active) {
      // Generate random burst positions
      const newBursts = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 40,
        delay: i * 200,
      }))
      
      setBursts(newBursts)
      setIsVisible(true)

      const timeout = setTimeout(() => {
        setIsVisible(false)
        setBursts([])
        onComplete?.()
      }, duration)

      return () => clearTimeout(timeout)
    }
  }, [active, duration, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="absolute"
          style={{
            left: `${burst.x}%`,
            top: `${burst.y}%`,
            animationDelay: `${burst.delay}ms`,
          }}
        >
          {/* Firework particles */}
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * 360
            const distance = 40 + Math.random() * 40
            const radians = (angle * Math.PI) / 180
            
            return (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: defaultColors[i % defaultColors.length],
                  animation: `firework-particle 0.8s ease-out ${burst.delay}ms forwards`,
                  "--angle": `${angle}deg`,
                  "--distance": `${distance}px`,
                } as React.CSSProperties}
              />
            )
          })}
        </div>
      ))}
      
      <style jsx>{`
        @keyframes firework-particle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(cos(var(--angle)) * var(--distance)),
              calc(sin(var(--angle)) * var(--distance))
            ) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// Hook for easy confetti usage
export function useConfetti() {
  const [isActive, setIsActive] = React.useState(false)

  const fire = React.useCallback(() => {
    setIsActive(true)
  }, [])

  const reset = React.useCallback(() => {
    setIsActive(false)
  }, [])

  return {
    isActive,
    fire,
    reset,
    Confetti: (props: Omit<ConfettiProps, "active" | "onComplete">) => (
      <Confetti {...props} active={isActive} onComplete={reset} />
    ),
  }
}
