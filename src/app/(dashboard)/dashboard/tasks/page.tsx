"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuthStore } from "@/stores/authStore"
import { listSectors } from "@/services/sectors"
import { createTask, updateTask, deleteTask, listTasksBySector } from "@/services/tasks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/index"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/index"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter as ADF, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/index"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"

type Row = { id: string; name: string; description?: string; sectorId: string }

export default function TasksPage() {
  const activeHouseId = useAuthStore(s => s.activeHouseId)
  const role = useAuthStore(s => s.activeHouseRole)
  const canEdit = role === "owner" || role === "admin"
  const [sectors, setSectors] = useState<{ id: string; name: string }[]>([])
  const [sectorId, setSectorId] = useState("")
  const [rows, setRows] = useState<Row[]>([])
  const [name, setName] = useState(""); const [desc, setDesc] = useState("")
  const [editing, setEditing] = useState<Row | null>(null)
  const [editName, setEditName] = useState(""); const [editDesc, setEditDesc] = useState(""); const [editSectorId, setEditSectorId] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!activeHouseId) return
    listSectors(activeHouseId).then(s => { setSectors(s); if (s[0]) setSectorId(s[0].id) })
  }, [activeHouseId])

  const refresh = useCallback(async () => {
    if (!activeHouseId || !sectorId) return
    const tasks = await listTasksBySector({ houseId: activeHouseId, sectorIds: [sectorId] })
    setRows(tasks.map(t => ({ id: t.id, name: t.name, description: t.description, sectorId: t.sectorId })))
  }, [activeHouseId, sectorId])

  useEffect(() => { refresh() }, [refresh])

  const onCreate = async () => {
    if (!activeHouseId || !sectorId || !name.trim()) return
    setLoading(true)
    try { await createTask({ houseId: activeHouseId, sectorId, name, description: desc }); setName(""); setDesc(""); toast.success("Tarea creada"); await refresh() }
    catch { toast.error("Error al crear") } finally { setLoading(false) }
  }

  const onEdit = (r: Row) => { setEditing(r); setEditName(r.name); setEditDesc(r.description ?? ""); setEditSectorId(r.sectorId) }

  const onSaveEdit = async () => {
    if (!activeHouseId || !editing) return
    setLoading(true)
    try { await updateTask({ houseId: activeHouseId, taskId: editing.id, name: editName, description: editDesc, sectorId: editSectorId }); setEditing(null); toast.success("Guardado"); await refresh() }
    catch { toast.error("Error al guardar") } finally { setLoading(false) }
  }

  const onDelete = async () => {
    if (!activeHouseId || !deleting) return
    setLoading(true)
    try { await deleteTask({ houseId: activeHouseId, taskId: deleting }); setDeleting(null); toast.success("Eliminada"); await refresh() }
    catch { toast.error("Error al eliminar") } finally { setLoading(false) }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Tareas</h1>

      {canEdit && (
        <Card>
          <CardHeader><CardTitle className="text-base">Nueva tarea</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Sector</Label>
                <Select value={sectorId} onValueChange={setSectorId}>
                  <SelectTrigger><SelectValue placeholder="Sector" /></SelectTrigger>
                  <SelectContent>{sectors.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Nombre</Label><Input placeholder="Nombre de la tarea" value={name} onChange={e => setName(e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label>Descripción (opcional)</Label><Input placeholder="Descripción…" value={desc} onChange={e => setDesc(e.target.value)} /></div>
            <Button onClick={onCreate} disabled={loading || !sectorId || !name.trim()}><Plus className="h-4 w-4" />Crear</Button>
          </CardContent>
        </Card>
      )}

      {/* Sector filter */}
      <div className="flex items-center gap-3">
        <Label className="shrink-0">Filtrar por sector:</Label>
        <Select value={sectorId} onValueChange={setSectorId}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>{sectors.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {rows.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">No hay tareas en este sector.</p> : rows.map(r => (
          <div key={r.id} className="flex items-center justify-between rounded-lg border bg-card p-3 gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{r.name}</p>
              {r.description && <p className="text-xs text-muted-foreground truncate">{r.description}</p>}
              <p className="text-xs text-muted-foreground">{sectors.find(s => s.id === r.sectorId)?.name}</p>
            </div>
            {canEdit && (
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => onEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="destructive" onClick={() => setDeleting(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={v => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar tarea</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Sector</Label>
              <Select value={editSectorId} onValueChange={setEditSectorId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{sectors.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Nombre</Label><Input value={editName} onChange={e => setEditName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Descripción</Label><Input value={editDesc} onChange={e => setEditDesc(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={onSaveEdit} disabled={loading || !editName.trim()}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={v => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Borrar tarea?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <ADF><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={onDelete}>Borrar</AlertDialogAction></ADF>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
