"use client"

import { useState } from "react"
import SignupPage from "./signup-page"
import LoginPage from "./login-page"

export default function AuthWelcome() {
  const [isLogin, setIsLogin] = useState(false)

  return isLogin ? (
    <LoginPage onSwitchToSignup={() => setIsLogin(false)} />
  ) : (
    <SignupPage onSwitchToLogin={() => setIsLogin(true)} />
  )
}
