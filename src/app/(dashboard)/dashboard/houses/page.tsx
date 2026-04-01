"use client"
import { useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createHouse } from "@/services/houses"
import { joinHouseByCode } from "@/services/users"
import { toast } from "sonner"
import { Home, Plus, Copy, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function HousesPage() {
  const user = useAuthStore(s => s.user)
  const houses = useAuthStore(s => s.houses)
  const activeHouseId = useAuthStore(s => s.activeHouseId)
  const setActiveHouseId = useAuthStore(s => s.setActiveHouseId)
  const refreshHouses = useAuthStore(s => s.refreshHouses)
  const [newHouseName, setNewHouseName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const onCreate = async () => {
    if (!user || !newHouseName.trim()) return
    setLoading(true)
    try { await createHouse({ name: newHouseName.trim(), ownerUid: user.uid, ownerDisplayName: user.displayName ?? "Owner" }); await refreshHouses(); setNewHouseName(""); toast.success("Casa creada") }
    catch { toast.error("Error al crear la casa") } finally { setLoading(false) }
  }

  const onJoin = async () => {
    if (!user || joinCode.trim().length !== 8) return
    setLoading(true)
    try { await joinHouseByCode({ code: joinCode.trim(), uid: user.uid, displayName: user.displayName ?? "Usuario" }); await refreshHouses(); setJoinCode(""); toast.success("¡Te uniste a la casa!") }
    catch { toast.error("Código inválido o error al unirse") } finally { setLoading(false) }
  }

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/join?code=${code}`)
    setCopied(code); setTimeout(() => setCopied(null), 1500)
    toast.success("Link copiado")
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Casas</h1>

      {/* My houses */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Tus casas</h2>
        {houses.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground"><Home className="mx-auto h-8 w-8 mb-2" />No tenés casas.</div>
        ) : houses.map(h => (
          <div key={h.id} className={`rounded-lg border p-4 flex items-center gap-4 ${h.id === activeHouseId ? "border-primary bg-primary/5" : "bg-card"}`}>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{h.name}</p>
              {h.code && <p className="text-xs text-muted-foreground font-mono">{h.code}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {h.id === activeHouseId && <Badge className="text-xs">Activa</Badge>}
              {h.code && (
                <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => copyCode(h.code!)}>
                  {copied === h.code ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              )}
              {h.id !== activeHouseId && <Button size="sm" variant="outline" onClick={() => setActiveHouseId(h.id)}>Activar</Button>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" />Crear casa</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>Nombre</Label><Input placeholder="Casa de los García" value={newHouseName} onChange={e => setNewHouseName(e.target.value)} /></div>
            <Button className="w-full" onClick={onCreate} disabled={loading || !newHouseName.trim()}>Crear</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Home className="h-4 w-4" />Unirse con código</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>Código de invitación</Label><Input placeholder="ABCD1234" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={8} className="font-mono tracking-widest uppercase" /></div>
            <Button className="w-full" onClick={onJoin} disabled={loading || joinCode.trim().length !== 8}>Unirse</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
