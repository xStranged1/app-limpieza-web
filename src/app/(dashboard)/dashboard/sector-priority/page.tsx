"use client"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { listSectors } from "@/services/sectors"
import { db } from "@/const/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/index"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Plus, Trash2, ArrowUp, ArrowDown, Pencil, X, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/index"
import { Checkbox } from "@/components/ui/index"

type Slot = string | string[]
type PriorityConfig = Record<number, Slot[]>
const SLOT_SEP = "|"
const USER_COUNTS = [4, 5, 6, 7, 8, 9, 10, 11]

function serializeConfig(config: PriorityConfig): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const [n, slots] of Object.entries(config)) {
    out[n] = slots.map(s => Array.isArray(s) ? s.join(SLOT_SEP) : s)
  }
  return out
}

function deserializeConfig(raw: Record<string, string[]>): PriorityConfig {
  const out: PriorityConfig = {}
  for (const [n, slots] of Object.entries(raw)) {
    out[Number(n)] = slots.map(s => s.includes(SLOT_SEP) ? s.split(SLOT_SEP) : s)
  }
  return out
}

export default function SectorPriorityPage() {
  const activeHouseId = useAuthStore(s => s.activeHouseId)
  const role = useAuthStore(s => s.activeHouseRole)
  const canEdit = role === "owner" || role === "admin"
  const [sectors, setSectors] = useState<{ id: string; name: string }[]>([])
  const [config, setConfig] = useState<PriorityConfig>({})
  const [selectedN, setSelectedN] = useState(4)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null)
  const [pickerSelected, setPickerSelected] = useState<string[]>([])

  useEffect(() => {
    if (!activeHouseId) return
    const load = async () => {
      setLoading(true)
      const [sectorList, snap] = await Promise.all([
        listSectors(activeHouseId),
        getDoc(doc(db, "houses", activeHouseId, "config", "sectorPriority")),
      ])
      setSectors(sectorList.map(s => ({ id: s.id, name: s.name })))
      if (snap.exists()) {
        const raw = snap.data()?.config as Record<string, string[]> | undefined
        if (raw) setConfig(deserializeConfig(raw))
      }
      setLoading(false)
    }
    load()
  }, [activeHouseId])

  const currentSlots: Slot[] = config[selectedN] ?? []
  const getSectorName = (id: string) => sectors.find(s => s.id === id)?.name ?? id
  const slotLabel = (slot: Slot) => Array.isArray(slot) ? slot.map(getSectorName).join(" + ") : getSectorName(slot)

  const removeSlot = (i: number) => setConfig(prev => ({ ...prev, [selectedN]: currentSlots.filter((_, idx) => idx !== i) }))
  const moveSlot = (i: number, dir: "up" | "down") => {
    const next = [...currentSlots]
    const swapWith = dir === "up" ? i - 1 : i + 1
    if (swapWith < 0 || swapWith >= next.length) return
      ;[next[i], next[swapWith]] = [next[swapWith], next[i]]
    setConfig(prev => ({ ...prev, [selectedN]: next }))
  }
  const confirmPicker = () => {
    if (pickerSelected.length === 0) return
    const newSlot: Slot = pickerSelected.length === 1 ? pickerSelected[0] : pickerSelected
    const next = [...currentSlots]
    if (editingSlotIndex === -1) next.push(newSlot)
    else if (editingSlotIndex !== null) next[editingSlotIndex] = newSlot
    setConfig(prev => ({ ...prev, [selectedN]: next }))
    setEditingSlotIndex(null); setPickerSelected([])
  }

  const onSave = async () => {
    if (!activeHouseId) return
    setSaving(true)
    try {
      await setDoc(doc(db, "houses", activeHouseId, "config", "sectorPriority"), { config: serializeConfig(config), updatedAt: serverTimestamp() })
      toast.success("Configuración guardada")
    } catch { toast.error("Error al guardar") } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Prioridad de sectores</h1>

      {/* N selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Cantidad de usuarios en casa</p>
        <div className="flex flex-wrap gap-2">
          {USER_COUNTS.map(n => (
            <Button key={n} size="sm" variant={selectedN === n ? "default" : "outline"} onClick={() => setSelectedN(n)}>
              {n === 11 ? "11+" : n}
            </Button>
          ))}
        </div>
      </div>

      {/* Slots */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Slots para {selectedN} usuarios <span className="text-muted-foreground font-normal text-sm">({currentSlots.length} configurados)</span></CardTitle>
            {canEdit && (
              <Button size="sm" onClick={() => { setPickerSelected([]); setEditingSlotIndex(-1) }}>
                <Plus className="h-4 w-4" />Agregar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {currentSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No hay slots configurados.</p>
          ) : currentSlots.map((slot, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{slotLabel(slot)}</p>
                {Array.isArray(slot) && <Badge variant="secondary" className="text-xs mt-0.5">Combinado</Badge>}
              </div>
              {canEdit && (
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={i === 0} onClick={() => moveSlot(i, "up")}><ArrowUp className="h-3 w-3" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={i === currentSlots.length - 1} onClick={() => moveSlot(i, "down")}><ArrowDown className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => { setPickerSelected(Array.isArray(slot) ? slot : [slot]); setEditingSlotIndex(i) }}><Pencil className="h-3 w-3" /></Button>
                  <Button size="sm" variant="destructive" className="h-7 w-7 p-0" onClick={() => removeSlot(i)}><X className="h-3 w-3" /></Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {canEdit && (
        <Button onClick={onSave} disabled={saving}>{saving ? "Guardando…" : "Guardar configuración"}</Button>
      )}

      {/* Picker dialog */}
      <Dialog open={editingSlotIndex !== null} onOpenChange={v => !v && (setEditingSlotIndex(null), setPickerSelected([]))}>
        <DialogContent>
          <DialogHeader><DialogTitle>Seleccionar sector(es)</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Podés combinar múltiples sectores en un slot.</p>
          <div className="space-y-2 max-h-64 overflow-auto">
            {sectors.map(s => (
              <label key={s.id} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                <Checkbox checked={pickerSelected.includes(s.id)} onCheckedChange={v => setPickerSelected(prev => v ? [...prev, s.id] : prev.filter(x => x !== s.id))} />
                <span className="text-sm font-medium">{s.name}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingSlotIndex(null); setPickerSelected([]) }}>Cancelar</Button>
            <Button disabled={pickerSelected.length === 0} onClick={confirmPicker}><Check className="h-4 w-4" />Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
