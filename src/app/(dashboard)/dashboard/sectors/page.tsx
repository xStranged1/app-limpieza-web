"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuthStore } from "@/stores/authStore"
import { createSector, updateSector, deleteSector, listSectors } from "@/services/sectors"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/index"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter as ADF, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/index"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Layers } from "lucide-react"

type Row = { id: string; name: string; description?: string }

export default function SectorsPage() {
  const activeHouseId = useAuthStore(s => s.activeHouseId)
  const role = useAuthStore(s => s.activeHouseRole)
  const canEdit = role === "owner" || role === "admin"
  const [rows, setRows] = useState<Row[]>([])
  const [name, setName] = useState(""); const [desc, setDesc] = useState("")
  const [editing, setEditing] = useState<Row | null>(null)
  const [editName, setEditName] = useState(""); const [editDesc, setEditDesc] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!activeHouseId) return
    const s = await listSectors(activeHouseId)
    setRows(s.map(x => ({ id: x.id, name: x.name, description: x.description })))
  }, [activeHouseId])

  useEffect(() => { refresh() }, [refresh])

  const onCreate = async () => {
    if (!activeHouseId || !name.trim()) return
    setLoading(true)
    try { await createSector({ houseId: activeHouseId, name, description: desc }); setName(""); setDesc(""); toast.success("Sector creado"); await refresh() }
    catch { toast.error("Error") } finally { setLoading(false) }
  }

  const onSaveEdit = async () => {
    if (!activeHouseId || !editing) return
    setLoading(true)
    try { await updateSector({ houseId: activeHouseId, sectorId: editing.id, name: editName, description: editDesc }); setEditing(null); toast.success("Guardado"); await refresh() }
    catch { toast.error("Error") } finally { setLoading(false) }
  }

  const onDelete = async () => {
    if (!activeHouseId || !deleting) return
    setLoading(true)
    try { await deleteSector({ houseId: activeHouseId, sectorId: deleting }); setDeleting(null); toast.success("Eliminado"); await refresh() }
    catch { toast.error("Error") } finally { setLoading(false) }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Sectores</h1>

      {canEdit && (
        <Card>
          <CardHeader><CardTitle className="text-base">Nuevo sector</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Nombre</Label><Input placeholder="Ej: Cocina" value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Descripción (opcional)</Label><Input placeholder="Descripción…" value={desc} onChange={e => setDesc(e.target.value)} /></div>
            </div>
            <Button onClick={onCreate} disabled={loading || !name.trim()}><Plus className="h-4 w-4" />Crear</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed p-12 text-center">
            <Layers className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay sectores aún.</p>
          </div>
        ) : rows.map(r => (
          <div key={r.id} className="rounded-lg border bg-card p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{r.name}</p>
                {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
              </div>
              {canEdit && (
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => { setEditing(r); setEditName(r.name); setEditDesc(r.description ?? "") }}><Pencil className="h-3 w-3" /></Button>
                  <Button size="sm" variant="destructive" className="h-7 w-7 p-0" onClick={() => setDeleting(r.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={v => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar sector</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Nombre</Label><Input value={editName} onChange={e => setEditName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Descripción</Label><Input value={editDesc} onChange={e => setEditDesc(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button><Button onClick={onSaveEdit} disabled={loading || !editName.trim()}>Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={v => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Borrar sector?</AlertDialogTitle><AlertDialogDescription>Esto no elimina las tareas asociadas automáticamente.</AlertDialogDescription></AlertDialogHeader>
          <ADF><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={onDelete}>Borrar</AlertDialogAction></ADF>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
