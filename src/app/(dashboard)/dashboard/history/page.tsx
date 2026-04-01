"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuthStore } from "@/stores/authStore"
import { getWeeklyHistory } from "@/services/assignments"
import { listUsersForHouse } from "@/services/users"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/index"
import { CheckCircle2, Clock, ShieldCheck } from "lucide-react"

function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-secondary ${className ?? ""}`}>
      <div className="h-full bg-primary transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export default function HistoryPage() {
  const activeHouseId = useAuthStore(s => s.activeHouseId)
  const user = useAuthStore(s => s.user)
  const role = useAuthStore(s => s.activeHouseRole)
  const isAdmin = role === "owner" || role === "admin"
  const [users, setUsers] = useState<{ uid: string; displayName: string }[]>([])
  const [selectedUid, setSelectedUid] = useState<string | null>(null)
  const [rows, setRows] = useState<{ id: string; tasksCount: number; verifiedCount: number; completedCount: number; periodStart?: { toDate?: () => Date } }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeHouseId || !user || !isAdmin) return
    listUsersForHouse(activeHouseId).then(u => {
      setUsers(u.map(x => ({ uid: x.uid, displayName: x.displayName })))
      setSelectedUid(prev => prev ?? user.uid)
    })
  }, [activeHouseId, user, isAdmin])

  useEffect(() => { if (user && !selectedUid) setSelectedUid(user.uid) }, [user, selectedUid])

  const refresh = useCallback(async () => {
    if (!activeHouseId || !user) return
    setLoading(true)
    const targetUid = isAdmin ? (selectedUid ?? user.uid) : user.uid
    const history = await getWeeklyHistory({ houseId: activeHouseId, userId: targetUid, limit: 12 })
    setRows(history.map(a => {
      const statuses = Object.values(a.statusByTask ?? {})
      return { id: a.id, tasksCount: a.tasks.length, verifiedCount: statuses.filter(s => s === "verified").length, completedCount: statuses.filter(s => s === "completed").length, periodStart: a.periodStart as unknown as { toDate?: () => Date } }
    }))
    setLoading(false)
  }, [activeHouseId, user, isAdmin, selectedUid])

  useEffect(() => { refresh() }, [refresh])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Historial semanal</h1>
      {isAdmin && users.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {users.map(u => (
            <Button key={u.uid} size="sm" variant={selectedUid === u.uid ? "default" : "outline"} onClick={() => setSelectedUid(u.uid)}>
              {u.displayName}{u.uid === user?.uid ? " (yo)" : ""}
            </Button>
          ))}
        </div>
      )}
      {loading ? <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div> : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">Sin historial disponible.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(r => {
            const done = r.completedCount + r.verifiedCount
            const pct = r.tasksCount > 0 ? Math.round((done / r.tasksCount) * 100) : 0
            const dateStr = r.periodStart?.toDate?.()?.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" }) ?? "—"
            return (
              <div key={r.id} className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Semana del {dateStr}</span>
                  <Badge variant={pct === 100 ? "default" : "secondary"} className="text-xs">{pct}%</Badge>
                </div>
                <ProgressBar value={pct} />
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.tasksCount} total</div>
                  <div className="flex items-center gap-1 text-blue-600"><CheckCircle2 className="h-3 w-3" />{r.completedCount} hechas</div>
                  <div className="flex items-center gap-1 text-green-600"><ShieldCheck className="h-3 w-3" />{r.verifiedCount} ctrl.</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
