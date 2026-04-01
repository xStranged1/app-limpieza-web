"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/stores/authStore"
import { createUserAccount, joinHouseByCode } from "@/services/users"
import { createHouse } from "@/services/houses"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Home } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const refreshHouses = useAuthStore(s => s.refreshHouses)
  const pendingJoinCode = useAuthStore(s => s.pendingJoinCode)
  const setPendingJoinCode = useAuthStore(s => s.setPendingJoinCode)

  const [displayName, setDisplayName] = useState("")
  const [houseName, setHouseName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) router.replace("/dashboard") }, [user, router])

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { uid } = await createUserAccount({ email, password, displayName })
      if (pendingJoinCode) {
        await joinHouseByCode({ code: pendingJoinCode, uid, displayName: displayName.trim() || "Usuario" })
        setPendingJoinCode(null)
      } else {
        await createHouse({ name: houseName.trim() || "Mi casa", ownerUid: uid, ownerDisplayName: displayName.trim() || "Owner" })
      }
      await refreshHouses()
      router.replace("/dashboard")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al registrarse"
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
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>{pendingJoinCode ? "Completá tu perfil para unirte a la casa" : "Empezá gestionando tu casa"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onRegister} className="space-y-4">
            <div className="space-y-2">
              <Label>Tu nombre</Label>
              <Input placeholder="Juan García" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
            </div>
            {!pendingJoinCode && (
              <div className="space-y-2">
                <Label>Nombre de la casa</Label>
                <Input placeholder="Casa de los García" value={houseName} onChange={e => setHouseName(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">¿Ya tenés cuenta? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">Iniciar sesión</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
