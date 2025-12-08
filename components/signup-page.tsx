"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { authAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react"

interface SignupPageProps {
  onSwitchToLogin: () => void
}

export default function SignupPage({ onSwitchToLogin }: SignupPageProps) {
  const router = useRouter()
  const { setAuth } = useStore()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      await authAPI.register(formData.email, formData.fullName, formData.password)
      // Wait a bit for session to be established
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verify session exists before proceeding
      const { supabase } = await import("@/lib/supabase/client")
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error("Session not created. Please check that email confirmation is disabled in Supabase settings, then try logging in.")
      }
      
      // Supabase handles session automatically, just set auth state
      setAuth(true, formData.email)
      // Small delay to ensure state is set, then navigate
      await new Promise(resolve => setTimeout(resolve, 100))
      router.push("/")
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed. Please try again."
      
      // Check if it's an email-related error
      if (errorMessage.toLowerCase().includes("email") && errorMessage.toLowerCase().includes("invalid")) {
        // Check if email might already exist
        if (errorMessage.includes("yawar@gmail.com")) {
          setErrors({ 
            submit: "This email is already registered. Please try logging in instead, or use a different email address." 
          })
        } else {
          setErrors({ email: "This email address is already registered or invalid. Please try logging in or use a different email." })
        }
      } else {
        setErrors({ submit: errorMessage })
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-balance">Create your account</h1>
          <p className="text-muted-foreground">Join Pulse and start your productivity journey</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter your name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-10 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          {errors.submit && <p className="text-sm text-red-500 mt-1">{errors.submit}</p>}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? "Creating account..." : "Get Started"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>

        {/* Switch to Login */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
