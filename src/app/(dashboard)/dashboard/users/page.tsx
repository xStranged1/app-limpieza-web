"use client"
import { useState, useCallback, useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { listUsersForHouse, setUserInHome } from "@/services/users"
import { getAssignmentsForHouse } from "@/services/assignments"
import { listSectors } from "@/services/sectors"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { RefreshCw, Home, LogOut, Crown } from "lucide-react"
import type { Assignment } from "@/services/types"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"

type EnrichedUser = { id: string; uid: string; displayName: string; inHome: boolean; role: string; canControl: boolean; sectors: string[]; state: "active" | "completed" | "finished" | "none" }

function deriveState(a: Assignment | undefined): EnrichedUser["state"] {
  if (!a || !a.tasks || a.tasks.length === 0) return "none"
  const statuses = Object.values(a.statusByTask ?? {})
  if (statuses.length === 0) return "active"
  if (statuses.every(s => s === "completed" || s === "verified")) return "finished"
  if (statuses.some(s => s === "completed" || s === "verified")) return "completed"
  return "active"
}

const STATE_CONFIG = {
  finished: { label: "Completo", cls: "bg-green-500/15 text-green-700 border-green-500/30" },
  completed: { label: "En progreso", cls: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  active: { label: "Pendiente", cls: "bg-yellow-400/15 text-yellow-700 border-yellow-500/30" },
  none: { label: "Sin tareas", cls: "bg-muted text-muted-foreground border-border" },
}

export default function UsersPage() {
  const navigate = useNavigate()
  const activeHouseId = useAuthStore(s => s.activeHouseId)
  const currentUid = useAuthStore(s => s.user?.uid)
  const role = useAuthStore(s => s.activeHouseRole)
  const canControl = role === "owner" || role === "admin"
  const [rows, setRows] = useState<EnrichedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    if (!activeHouseId) return
    setLoading(true)
    try {
      const [users, assignments, sectors] = await Promise.all([
        listUsersForHouse(activeHouseId),
        getAssignmentsForHouse({ houseId: activeHouseId, periodType: "week" }),
        listSectors(activeHouseId),
      ])
      const sectorNameMap = new Map(sectors.map(s => [s.id, s.name]))
      const latestByUser = new Map<string, Assignment>()
      for (const a of assignments) if (!latestByUser.has(a.userId)) latestByUser.set(a.userId, a)
      setRows(users.map(u => {
        const a = latestByUser.get(u.uid)
        const sectorIds = Array.from(new Set((a?.tasks ?? []).map(t => t.sectorId).filter(Boolean)))
        return { id: u.id, uid: u.uid, displayName: u.displayName, inHome: u.inHome, role: u.role, canControl: u.canControl ?? false, sectors: sectorIds.map(id => sectorNameMap.get(id) ?? id), state: deriveState(a) }
      }))
    } finally { setLoading(false) }
  }, [activeHouseId])

  useEffect(() => { load() }, [load])

  const toggleInHome = async (u: EnrichedUser) => {
    if (!activeHouseId || !canControl) return
    const next = !u.inHome
    setRows(prev => prev.map(r => r.uid === u.uid ? { ...r, inHome: next } : r))
    try { await setUserInHome({ houseId: activeHouseId, uid: u.uid, inHome: next }) }
    catch { setRows(prev => prev.map(r => r.uid === u.uid ? { ...r, inHome: !next } : r)); toast.error("Error al actualizar") }
  }

  const inHome = rows.filter(u => u.inHome)
  const outHome = rows.filter(u => !u.inHome)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Button variant="outline" size="sm" onClick={async () => { setRefreshing(true); await load(); setRefreshing(false) }}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div> : (
        <div className="space-y-8">
          {[{ title: inHome.length > 0 ? "En casa" : "Nadie en casa", users: inHome }, { title: outHome.length > 0 ? "Fuera de casa" : "Todos en casa", users: outHome }].map(({ title, users }) => (
            <div key={title} className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2>
              {users.length === 0 ? <p className="text-sm text-muted-foreground italic">—</p> : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {users.map(u => {
                    const cfg = STATE_CONFIG[u.state]
                    return (
                      <div key={u.id} className="rounded-lg border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => navigate(`/dashboard?userId=${u.uid}`)}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {u.canControl && <Crown className="h-3.5 w-3.5 text-yellow-500 shrink-0" />}
                            <span className="font-semibold text-sm truncate">{u.displayName}</span>
                          </div>
                          <Badge variant="outline" className={`text-xs shrink-0 border ${cfg.cls}`}>{cfg.label}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground capitalize">{u.role}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${u.inHome ? "bg-green-500/15 text-green-700" : "bg-muted text-muted-foreground"}`}>
                            {u.inHome ? <Home className="h-3 w-3" /> : <LogOut className="h-3 w-3" />}
                            {u.inHome ? "En casa" : "Fuera"}
                          </span>
                        </div>
                        {u.sectors.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {u.sectors.map(s => <span key={s} className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{s}</span>)}
                          </div>
                        )}
                        {canControl && (
                          <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={e => { e.stopPropagation(); toggleInHome(u) }}>
                            {u.inHome ? "Marcar fuera" : "Marcar en casa"}
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
