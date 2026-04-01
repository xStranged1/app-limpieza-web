"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useTaskStore } from "@/stores/taskStore"
import { getCurrentWeekAssignmentsForUser, updateTaskStatus, deleteAssignmentsForUser } from "@/services/assignments"
import { listUsersForHouse } from "@/services/users"
import { getSectorsForHouse } from "@/services/sectors"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { RefreshCw, CheckCheck, ShieldCheck, Trash2, Info } from "lucide-react"
import type { TaskStatus } from "@/services/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@radix-ui/react-select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

type TaskRow = { assignmentId: string; taskId: string; name: string; sectorId: string; sectorName?: string; status: "pending" | "completed" | "verified" }

function groupBySector(tasks: TaskRow[]) {
  const map = new Map<string, { sectorId: string; sectorName: string; tasks: TaskRow[] }>()
  for (const t of tasks) {
    if (!map.has(t.sectorId)) map.set(t.sectorId, { sectorId: t.sectorId, sectorName: t.sectorName ?? t.sectorId, tasks: [] })
    map.get(t.sectorId)!.tasks.push(t)
  }
  return Array.from(map.values())
}

const STATUS_BADGE: Record<string, string> = {
  verified: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  completed: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  pending: "bg-yellow-400/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
}
const STATUS_LABEL: Record<string, string> = { verified: "Controlada", completed: "Completada", pending: "Pendiente" }

export default function DashboardPage() {
  const activeHouseId = useAuthStore(s => s.activeHouseId)
  const houses = useAuthStore(s => s.houses)
  const user = useAuthStore(s => s.user)
  const role = useAuthStore(s => s.activeHouseRole)
  const isAdmin = role === "owner" || role === "admin"
  const { overrides, setOverride, clearOverride, clearAll } = useTaskStore()

  const [weeklyTasks, setWeeklyTasks] = useState<TaskRow[]>([])
  const [houseUsers, setHouseUsers] = useState<{ uid: string; displayName: string }[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const isOwnTasks = !!user && selectedUserId === user.uid

  const refresh = useCallback(async () => {
    if (!activeHouseId || !user || !selectedUserId) { setWeeklyTasks([]); return }
    const [assignments, users, sectors] = await Promise.all([
      getCurrentWeekAssignmentsForUser({ houseId: activeHouseId, userId: selectedUserId }),
      listUsersForHouse(activeHouseId),
      getSectorsForHouse(activeHouseId),
    ])
    const sectorMap = new Map(sectors.map(s => [s.id, s.name]))
    setHouseUsers(users.map(u => ({ uid: u.uid, displayName: u.displayName })))
    const merged: TaskRow[] = []
    for (const a of assignments) {
      for (const t of a.tasks) {
        merged.push({ assignmentId: a.id, taskId: t.taskId, name: t.name, sectorId: t.sectorId, sectorName: sectorMap.get(t.sectorId) ?? t.sectorId, status: ((a.statusByTask?.[t.taskId] as string) ?? "pending") as TaskRow["status"] })
      }
    }
    setWeeklyTasks(merged)
    clearAll()
  }, [activeHouseId, user, selectedUserId, clearAll])

  useEffect(() => {
    if (user && !selectedUserId) setSelectedUserId(user.uid)
  }, [user, selectedUserId])

  useEffect(() => { void refresh() }, [refresh])

  const onRefresh = async () => { setRefreshing(true); try { await refresh() } finally { setRefreshing(false) } }

  const updateMany = async (taskRows: TaskRow[], nextStatus: "completed" | "verified") => {
    if (!activeHouseId || taskRows.length === 0) return
    setSubmitting(true)
    taskRows.forEach(t => setOverride(`${t.assignmentId}-${t.taskId}`, nextStatus))
    try {
      await Promise.all(taskRows.map(t => updateTaskStatus({ houseId: activeHouseId, assignmentId: t.assignmentId, taskId: t.taskId, newStatus: nextStatus })))
      await refresh()
    } catch { taskRows.forEach(t => clearOverride(`${t.assignmentId}-${t.taskId}`)); toast.error("Error al actualizar") }
    finally { setSubmitting(false) }
  }

  const onToggleTask = async (task: TaskRow, checked: boolean) => {
    if (!activeHouseId) return
    const key = `${task.assignmentId}-${task.taskId}`
    const currentStatus = overrides[key]?.status ?? task.status
    if (!checked && currentStatus === "verified" && !isAdmin) return
    const nextStatus: TaskRow["status"] = checked ? (isOwnTasks ? "completed" : "verified") : "pending"
    setOverride(key, nextStatus)
    try {
      await updateTaskStatus({ houseId: activeHouseId, assignmentId: task.assignmentId, taskId: task.taskId, newStatus: nextStatus })
      setWeeklyTasks(prev => prev.map(t => t.assignmentId === task.assignmentId && t.taskId === task.taskId ? { ...t, status: nextStatus } : t))
      clearOverride(key)
    } catch { clearOverride(key) }
  }

  const onDeleteAll = async () => {
    if (!activeHouseId || !selectedUserId) return
    setShowDeleteAlert(false); setSubmitting(true)
    try { await deleteAssignmentsForUser({ houseId: activeHouseId, userId: selectedUserId }); await refresh(); toast.success("Tareas eliminadas") }
    catch { toast.error("Error al eliminar") } finally { setSubmitting(false) }
  }

  const grouped = useMemo(() => groupBySector(weeklyTasks), [weeklyTasks])
  const canVerifyOthers = !!selectedUserId && !isOwnTasks && isAdmin
  const canCompleteOwn = isOwnTasks
  const canEditTaskStatus = canCompleteOwn || canVerifyOthers

  const selectedUserName = houseUsers.find(u => u.uid === selectedUserId)?.displayName ?? "Usuario"

  return (
    <TooltipProvider>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tareas semanales</h1>
            <p className="text-muted-foreground text-sm">{houses.find(h => h.id === activeHouseId)?.name ?? "—"}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* User selector */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="w-full sm:w-64">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná un usuario" />
              </SelectTrigger>
              <SelectContent>
                {houseUsers.map(u => <SelectItem key={u.uid} value={u.uid}>{u.uid === user?.uid ? `${u.displayName} (yo)` : u.displayName}</SelectItem>)}
                {houseUsers.length === 0 && user && <SelectItem value={user.uid}>{user.displayName ?? "Yo"} (yo)</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 flex-wrap">
            {canCompleteOwn && <Button size="sm" variant="secondary" disabled={submitting || weeklyTasks.length === 0} onClick={() => updateMany(weeklyTasks, "completed")}><CheckCheck className="h-4 w-4" />Marcar todas</Button>}
            {canVerifyOthers && <Button size="sm" variant="secondary" disabled={submitting || weeklyTasks.length === 0} onClick={() => updateMany(weeklyTasks, "verified")}><ShieldCheck className="h-4 w-4" />Controlar todas</Button>}
            {isAdmin && <Button size="sm" variant="destructive" disabled={submitting || weeklyTasks.length === 0} onClick={() => setShowDeleteAlert(true)}><Trash2 className="h-4 w-4" />Eliminar</Button>}
          </div>
        </div>

        {/* Tasks */}
        {weeklyTasks.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">No hay tareas asignadas esta semana.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(group => (
              <div key={group.sectorId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold capitalize">{group.sectorName}</span>
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">{group.tasks.length} {group.tasks.length === 1 ? "tarea" : "tareas"}</span>
                </div>
                <div className="grid gap-2">
                  {group.tasks.map(t => {
                    const key = `${t.assignmentId}-${t.taskId}`
                    const effectiveStatus = overrides[key]?.status ?? t.status
                    const isVerified = effectiveStatus === "verified"
                    const checkboxDisabled = !canEditTaskStatus || submitting || (!isAdmin && isVerified)

                    return (
                      <div key={key} className="flex items-center justify-between rounded-lg border bg-card p-3 gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Checkbox checked={effectiveStatus === "completed" || effectiveStatus === "verified"} disabled={checkboxDisabled} onCheckedChange={checked => { if (canEditTaskStatus) onToggleTask(t, !!checked) }} />
                          <span className={`text-sm font-medium truncate ${effectiveStatus !== "pending" ? "line-through text-muted-foreground" : ""}`}>{t.name}</span>
                        </div>
                        <Badge className={`shrink-0 text-xs border ${STATUS_BADGE[effectiveStatus]}`} variant="outline">
                          {STATUS_LABEL[effectiveStatus]}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar todas las tareas?</AlertDialogTitle>
            <AlertDialogDescription>Se eliminarán todas las tareas de {selectedUserName} esta semana. No se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={onDeleteAll}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}
