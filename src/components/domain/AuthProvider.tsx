"use client"
import { useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const bootstrap = useAuthStore(s => s.bootstrap)

  useEffect(() => {
    const unsub = bootstrap()
    return unsub
  }, [bootstrap])

  return <>{children}</>
}
