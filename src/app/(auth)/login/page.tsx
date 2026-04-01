"use client"
import { useState, useEffect } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Home } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { auth } from "@/const/config"

export default function LoginPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate("/dashboard")
  }, [user])

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      navigate("/dashboard")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-primary p-3">
              <Home className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">LimpiezaON</CardTitle>
          <CardDescription>Iniciá sesión para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando…" : "Ingresar"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">¿No tenés cuenta? </span>
            <Link to="/register" className="text-primary hover:underline font-medium">Registrarse</Link>
          </div>
          <div className="mt-2 text-center text-sm">
            <Link to="/join" className="text-muted-foreground hover:underline text-xs">Unirse a una casa con código</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
