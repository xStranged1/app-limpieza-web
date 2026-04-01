"use client"
import { useState, useEffect, useMemo } from "react"
import { useAuthStore } from "@/stores/authStore"
import { listUsersForHouse } from "@/services/users"
import { listSectors } from "@/services/sectors"
import { listTasksBySector } from "@/services/tasks"
import { assignTasksToUser, getCurrentWeekPeriod } from "@/services/assignments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { CheckSquare, Square } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

export default function AssignPage() {
  const activeHouseId = useAuthStore(s => s.activeHouseId)
  const user = useAuthStore(s => s.user)
  const [users, setUsers] = useState<{ id: string; uid: string; displayName: string }[]>([])
  const [sectors, setSectors] = useState<{ id: string; name: string }[]>([])
  const [tasks, setTasks] = useState<{ id: string; name: string; sectorId: string }[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedSectorIds, setSelectedSectorIds] = useState<Record<string, boolean>>({})
  const [selectedTaskIds, setSelectedTaskIds] = useState<Record<string, boolean>>({})
  const [userSearch, setUserSearch] = useState("")
  const [taskSearch, setTaskSearch] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!activeHouseId) return
    Promise.all([listUsersForHouse(activeHouseId), listSectors(activeHouseId)]).then(([u, s]) => {
      setUsers(u.map(x => ({ id: x.id, uid: x.uid, displayName: x.displayName }))); setSectors(s)
      if (user) setSelectedUserId(user.uid)
    })
  }, [activeHouseId, user])

  const selectedSectorIdList = useMemo(() => Object.entries(selectedSectorIds).filter(([, v]) => v).map(([k]) => k), [selectedSectorIds])

  useEffect(() => {
    if (!activeHouseId || selectedSectorIdList.length === 0) { setTasks([]); setSelectedTaskIds({}); return }
    listTasksBySector({ houseId: activeHouseId, sectorIds: selectedSectorIdList }).then(t => {
      setTasks(t.map(x => ({ id: x.id, name: x.name, sectorId: x.sectorId })))
      setSelectedTaskIds(prev => { const next: Record<string, boolean> = {}; for (const task of t) if (prev[task.id]) next[task.id] = true; return next })
    })
  }, [activeHouseId, selectedSectorIdList])

  const selectedTasksCount = useMemo(() => Object.values(selectedTaskIds).filter(Boolean).length, [selectedTaskIds])

  const toggleAllTasks = () => {
    const allSelected = selectedTasksCount === tasks.length && tasks.length > 0
    const next: Record<string, boolean> = {}
    for (const t of tasks) next[t.id] = !allSelected
    setSelectedTaskIds(next)
  }

  const onAssign = async () => {
    if (!activeHouseId || !user || !selectedUserId) return
    setLoading(true)
    try {
      const selTasks = tasks.filter(t => selectedTaskIds[t.id])
      await assignTasksToUser({ houseId: activeHouseId, userId: selectedUserId, createdBy: user.uid, period: getCurrentWeekPeriod(), tasks: selTasks.map(t => ({ taskId: t.id, sectorId: t.sectorId, name: t.name })) })
      toast.success(`${selTasks.length} tareas asignadas`)
      setSelectedTaskIds({})
    } catch { toast.error("Error al asignar") } finally { setLoading(false) }
  }

  const filteredUsers = users.filter(u => u.displayName.toLowerCase().includes(userSearch.toLowerCase()))
  const filteredTasks = tasks.filter(t => t.name.toLowerCase().includes(taskSearch.toLowerCase()))

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Asignar tareas</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Step 1: User */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">1</span>Usuario</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input placeholder="Buscar…" value={userSearch} onChange={e => setUserSearch(e.target.value)} className="h-8 text-sm" />
            <div className="space-y-1 max-h-48 overflow-auto">
              {filteredUsers.map(u => (
                <button key={u.uid} onClick={() => setSelectedUserId(u.uid)}
                  className={`w-full text-left rounded px-2 py-1.5 text-sm transition-colors ${selectedUserId === u.uid ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                  {u.displayName}{u.uid === user?.uid ? " (yo)" : ""}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Sectors */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">2</span>Sectores</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-auto">
            {sectors.map(s => (
              <label key={s.id} className="flex items-center gap-2 cursor-pointer py-1 hover:bg-accent rounded px-1">
                <Checkbox checked={!!selectedSectorIds[s.id]} onCheckedChange={v => setSelectedSectorIds(prev => ({ ...prev, [s.id]: !!v }))} />
                <span className="text-sm">{s.name}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Step 3: Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">3</span>
              Tareas
              {tasks.length > 0 && <Badge variant="secondary" className="ml-auto text-xs">{selectedTasksCount}/{tasks.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.length === 0 ? <p className="text-xs text-muted-foreground">Seleccioná sectores primero.</p> : (
              <>
                <Input placeholder="Buscar…" value={taskSearch} onChange={e => setTaskSearch(e.target.value)} className="h-8 text-sm" />
                <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={toggleAllTasks}>
                  {selectedTasksCount === tasks.length ? <><Square className="h-3 w-3 mr-1" />Deseleccionar todas</> : <><CheckSquare className="h-3 w-3 mr-1" />Seleccionar todas ({tasks.length})</>}
                </Button>
                <div className="space-y-1 max-h-40 overflow-auto">
                  {filteredTasks.map(t => (
                    <label key={t.id} className="flex items-center gap-2 cursor-pointer py-1 hover:bg-accent rounded px-1">
                      <Checkbox checked={!!selectedTaskIds[t.id]} onCheckedChange={v => setSelectedTaskIds(prev => ({ ...prev, [t.id]: !!v }))} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{sectors.find(s => s.id === t.sectorId)?.name}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Button onClick={onAssign} disabled={loading || !selectedUserId || selectedTasksCount === 0} className="w-full sm:w-auto">
        {loading ? "Asignando…" : `Asignar (${selectedTasksCount} tareas)`}
      </Button>
    </div>
  )
}
