"use client"
import { useState, useEffect, useRef } from "react"
import { useAuthStore } from "@/stores/authStore"
import { db } from "@/const/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { listUsersForHouse } from "@/services/users"
import { listSectors } from "@/services/sectors"
import { getAssignmentsForHouse, assignTasksToUser, getCurrentWeekPeriod } from "@/services/assignments"
import { listTasksBySector } from "@/services/tasks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/index"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/index"
import { toast } from "sonner"
import { ArrowUp, Save, CalendarRange } from "lucide-react"
import type { Assignment } from "@/services/types"
import { Link } from "react-router-dom";

type Slot = string | string[]
type PriorityConfig = Record<number, Slot[]>
const SLOT_SEP = "|"

function deserializeConfig(raw: Record<string, string[]>): PriorityConfig {
  const out: PriorityConfig = {}
  for (const [n, slots] of Object.entries(raw)) {
    out[Number(n)] = slots.map(s => s.includes(SLOT_SEP) ? s.split(SLOT_SEP) : s)
  }
  return out
}

function getSlotsForN(config: PriorityConfig, n: number): Slot[] | null {
  if (config[n]) return config[n]
  for (let i = n - 1; i >= 1; i--) if (config[i]) return config[i]
  return null
}

function slotToIds(slot: Slot): string[] { return Array.isArray(slot) ? slot : [slot] }

function rotateRight<T>(arr: T[]): T[] {
  if (arr.length === 0) return arr
  return [arr[arr.length - 1], ...arr.slice(0, arr.length - 1)]
}

function computeNextFromCurrent(orderedUsers: { uid: string }[], latestByUser: Record<string, string[]>, rotationOffset: number): string[][] {
  let current = orderedUsers.map(u => latestByUser[u.uid] ?? [])
  for (let i = 0; i < rotationOffset + 1; i++) current = rotateRight(current)
  return current
}

type UserRow = { id: string; uid: string; displayName: string; inHome: boolean }
type CurrentAssignment = { uid: string; displayName: string; sectorIds: string[] }
type NextAssignment = { uid: string; displayName: string; nextSlot: string[] }

export default function PassWeekPage() {
  const activeHouseId = useAuthStore(s => s.activeHouseId)
  const currentUser = useAuthStore(s => s.user)
  type LoadState = "loading" | "no_config" | "ready" | "error"
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [sectorNames, setSectorNames] = useState<Record<string, string>>({})
  const [currentAssignments, setCurrentAssignments] = useState<CurrentAssignment[]>([])
  const [nextRows, setNextRows] = useState<NextAssignment[]>([])
  const [rotationOffset, setRotationOffset] = useState(0)
  const [assigning, setAssigning] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const orderedUsersRef = useRef<UserRow[]>([])
  const latestByUserRef = useRef<Record<string, string[]>>({})

  const slotDisplay = (ids: string[]) => !ids || ids.length === 0 ? "Sin asignación" : ids.map(id => sectorNames[id] ?? id).join(" + ")

  useEffect(() => {
    if (!activeHouseId) return
    const load = async () => {
      setLoadState("loading")
      try {
        const [allUsers, sectors, configSnap, allAssignments] = await Promise.all([
          listUsersForHouse(activeHouseId),
          listSectors(activeHouseId),
          getDoc(doc(db, "houses", activeHouseId, "config", "sectorPriority")),
          getAssignmentsForHouse({ houseId: activeHouseId, periodType: "week" }),
        ])
        const names: Record<string, string> = {}
        for (const s of sectors) names[s.id] = s.name
        setSectorNames(names)
        const inHome = (allUsers as UserRow[]).filter(u => u.inHome)
        const n = inHome.length
        const latestByUser: Record<string, string[]> = {}
        for (const a of allAssignments) {
          if (!inHome.find(u => u.uid === a.userId)) continue
          if (!latestByUser[a.userId]) latestByUser[a.userId] = Array.from(new Set(a.tasks.map(t => t.sectorId)))
        }
        latestByUserRef.current = latestByUser
        const raw = configSnap.exists() ? configSnap.data()?.config as Record<string, string[]> | undefined : undefined
        const config = raw ? deserializeConfig(raw) : {}
        const slots = getSlotsForN(config, n)
        if (!slots || slots.length < n) { setLoadState("no_config"); return }
        const orderSnap = await getDoc(doc(db, "houses", activeHouseId, "config", "userOrder"))
        const savedOrder = orderSnap.exists() ? (orderSnap.data()?.order as string[]) ?? null : null
        const orderedUsers = savedOrder ? [...inHome].sort((a, b) => { const ia = savedOrder.indexOf(a.uid); const ib = savedOrder.indexOf(b.uid); return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) }) : inHome
        orderedUsersRef.current = orderedUsers
        setCurrentAssignments(orderedUsers.map(u => ({ uid: u.uid, displayName: u.displayName, sectorIds: latestByUser[u.uid] ?? [] })))
        const nextSlots = computeNextFromCurrent(orderedUsers, latestByUser, 0)
        setNextRows(orderedUsers.map((u, i) => ({ uid: u.uid, displayName: u.displayName, nextSlot: nextSlots[i] })))
        setRotationOffset(0)
        setLoadState("ready")
      } catch (e) { console.error(e); setLoadState("error") }
    }
    load()
  }, [activeHouseId])

  useEffect(() => {
    if (loadState !== "ready") return
    const nextSlots = computeNextFromCurrent(orderedUsersRef.current, latestByUserRef.current, rotationOffset)
    setNextRows(prev => prev.map((r, i) => ({ ...r, nextSlot: nextSlots[i] })))
  }, [rotationOffset, loadState])

  const moveUserUp = (index: number) => {
    const n = orderedUsersRef.current.length
    const swapWith = (index - 1 + n) % n
    const newOrdered = [...orderedUsersRef.current];
    [newOrdered[swapWith], newOrdered[index]] = [newOrdered[index], newOrdered[swapWith]]
    orderedUsersRef.current = newOrdered
    const nextSlots = computeNextFromCurrent(newOrdered, latestByUserRef.current, rotationOffset)
    setNextRows(newOrdered.map((u, i) => ({ uid: u.uid, displayName: u.displayName, nextSlot: nextSlots[i] })))
    setCurrentAssignments(newOrdered.map(u => ({ uid: u.uid, displayName: u.displayName, sectorIds: latestByUserRef.current[u.uid] ?? [] })))
  }

  const onSaveOrder = async () => {
    if (!activeHouseId) return
    setSavingOrder(true)
    try { await setDoc(doc(db, "houses", activeHouseId, "config", "userOrder"), { order: orderedUsersRef.current.map(u => u.uid), updatedAt: serverTimestamp() }, { merge: true }); toast.success("Orden guardado") }
    catch { toast.error("Error al guardar orden") } finally { setSavingOrder(false) }
  }

  const onPassWeek = async () => {
    if (!activeHouseId || !currentUser) return
    setShowConfirm(false); setAssigning(true)
    try {
      const period = getCurrentWeekPeriod()
      await Promise.all(nextRows.map(async r => {
        const tasks = await listTasksBySector({ houseId: activeHouseId, sectorIds: r.nextSlot })
        await assignTasksToUser({ houseId: activeHouseId, userId: r.uid, createdBy: currentUser.uid, period, tasks: tasks.map(t => ({ taskId: t.id, sectorId: t.sectorId, name: t.name })) })
      }))
      setRotationOffset(prev => prev + 1)
      toast.success("¡Tareas asignadas correctamente!")
    } catch { toast.error("Error al asignar") } finally { setAssigning(false) }
  }

  if (loadState === "loading") return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  if (loadState === "no_config") return (
    <div className="p-6 max-w-lg mx-auto text-center space-y-4">
      <CalendarRange className="mx-auto h-12 w-12 text-muted-foreground" />
      <h2 className="text-lg font-semibold">Sin configuración de sectores</h2>
      <p className="text-muted-foreground text-sm">Configurá la prioridad de sectores antes de pasar de semana.</p>
      <Button asChild><Link href="/dashboard/sector-priority">Ir a Prioridad de sectores</Link></Button>
    </div>
  )
  if (loadState === "error") return <div className="p-6 text-center text-destructive">Error al cargar los datos.</div>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Pasar de semana</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Asignación actual</h2>
          <div className="space-y-2">
            {currentAssignments.map(r => (
              <div key={r.uid} className="rounded-lg border bg-card p-3">
                <p className="font-medium text-sm">{r.displayName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{slotDisplay(r.sectorIds)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Próxima rotación</h2>
          <p className="text-xs text-muted-foreground">Usá ↑ para ajustar el orden. La lista es circular.</p>
          <div className="space-y-2">
            {nextRows.map((r, i) => (
              <div key={r.uid} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{r.displayName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{slotDisplay(r.nextSlot)}</p>
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => moveUserUp(i)}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t pt-6">
        <Button onClick={() => setShowConfirm(true)} disabled={assigning || nextRows.length === 0}>
          <CalendarRange className="h-4 w-4" />{assigning ? "Asignando…" : "Pasar de semana"}
        </Button>
        <Button variant="outline" onClick={onSaveOrder} disabled={savingOrder}>
          <Save className="h-4 w-4" />{savingOrder ? "Guardando…" : "Guardar orden"}
        </Button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pasar de semana</AlertDialogTitle>
            <AlertDialogDescription>Se asignarán los sectores rotados a {nextRows.length} usuarios. ¿Continuar?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onPassWeek}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
