"use client"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { getHouseIdByCode } from "@/services/houses"
import { joinHouseByCode } from "@/services/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Suspense } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

function JoinForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const user = useAuthStore(s => s.user)
  const refreshHouses = useAuthStore(s => s.refreshHouses)
  const setPendingJoinCode = useAuthStore(s => s.setPendingJoinCode)

  const [code, setCode] = useState(searchParams.get("code") ?? "")
  const [status, setStatus] = useState<"idle" | "joining" | "invalid">("idle")

  useEffect(() => {
    const paramCode = searchParams.get("code")
    if (paramCode) handleJoin(paramCode)
  }, [])

  const handleJoin = async (inputCode: string) => {
    const normalized = inputCode.trim().toUpperCase()
    if (!normalized) return

    setStatus("joining")

    const houseId = await getHouseIdByCode(normalized)
    if (!houseId) {
      setStatus("invalid")
      toast.error("Código inválido")
      return
    }

    if (!user) {
      setPendingJoinCode(normalized)
      navigate("/register")
      return
    }

    try {
      await joinHouseByCode({
        code: normalized,
        uid: user.uid,
        displayName: user.displayName ?? "Usuario"
      })

      await refreshHouses()
      toast.success("¡Te uniste a la casa!")
      navigate("/dashboard", { replace: true })
    } catch {
      toast.error("Error al unirse")
      setStatus("idle")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Unirse a una casa</CardTitle>
          <CardDescription>Ingresá el código de invitación de 8 caracteres</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Código</Label>
            <Input
              placeholder="ABCD1234"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={8}
              className="font-mono tracking-widest uppercase"
            />
          </div>

          {status === "invalid" && (
            <p className="text-sm text-destructive">
              Código no válido. Verificá e intentá de nuevo.
            </p>
          )}

          <Button
            className="w-full"
            onClick={() => handleJoin(code)}
            disabled={status === "joining" || code.length < 8}
          >
            {status === "joining" ? "Uniéndose…" : "Unirse"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  )
}