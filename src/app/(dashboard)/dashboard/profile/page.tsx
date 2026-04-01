"use client"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { updateProfile, deleteUser } from "firebase/auth"
import { setDoc, serverTimestamp, deleteDoc } from "firebase/firestore"
import { refs } from "@/services/refs"
import { getHouseUser } from "@/services/users"
import { listHousesForUser } from "@/services/houses"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { signOut } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { auth } from "@/const/config"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function ProfilePage() {
  const navigation = useNavigate()
  const user = useAuthStore(s => s.user)
  const myUser = useAuthStore(s => s.myUser)
  const activeHouseId = useAuthStore(s => s.activeHouseId)
  const activeHouseRole = useAuthStore(s => s.activeHouseRole)
  const houses = useAuthStore(s => s.houses)
  const refreshMyUser = useAuthStore(s => s.refreshMyUser)
  const [displayName, setDisplayName] = useState(user?.displayName ?? "")
  const [savingName, setSavingName] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [inHome, setInHome] = useState<boolean | null>(null)

  useEffect(() => { if (user?.displayName) setDisplayName(user.displayName) }, [user?.displayName])

  useEffect(() => {
    if (!activeHouseId || !user) return
    getHouseUser(activeHouseId, user.uid).then(hu => setInHome(hu?.inHome ?? null))
  }, [activeHouseId, user])

  const onSaveName = async () => {
    if (!user || !auth.currentUser || !displayName.trim()) return
    setSavingName(true)
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() })
      await setDoc(refs.user(user.uid), { displayName: displayName.trim(), updatedAt: serverTimestamp() }, { merge: true })
      if (activeHouseId) await setDoc(refs.houseUser(activeHouseId, user.uid), { displayName: displayName.trim(), updatedAt: serverTimestamp() }, { merge: true })
      await refreshMyUser()
      toast.success("Nombre actualizado")
    } catch { toast.error("Error al guardar") } finally { setSavingName(false) }
  }

  const onDeleteAccount = async () => {
    if (!user || !auth.currentUser) return
    setDeleting(true)
    try {
      const userHouses = await listHousesForUser(user.uid)
      await Promise.all(userHouses.map(async h => { await deleteDoc(refs.houseUser(h.id, user.uid)); await deleteDoc(refs.membership(user.uid, h.id)) }))
      await deleteDoc(refs.user(user.uid))
      await deleteUser(auth.currentUser)
      await signOut(auth)
      navigation("/login")
    } catch { toast.error("Error al eliminar cuenta") } finally { setDeleting(false); setShowDeleteAlert(false) }
  }

  const initials = (displayName || user?.email || "U").slice(0, 2).toUpperCase()
  const activeHouseName = houses.find(h => h.id === activeHouseId)?.name ?? "—"

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 text-xl"><AvatarFallback>{initials}</AvatarFallback></Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user?.displayName ?? "Usuario"}</h1>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Nombre</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Tu nombre" />
          <Button onClick={onSaveName} disabled={savingName || !displayName.trim() || displayName.trim() === user?.displayName}>
            {savingName ? "Guardando…" : "Guardar nombre"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Casa y rol</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Casa activa</span><span className="font-medium">{activeHouseName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Rol</span><span className="font-medium capitalize">{activeHouseRole ?? "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Estado en casa</span>
            <span className={`font-medium ${inHome ? "text-green-600" : "text-muted-foreground"}`}>
              {inHome === null ? "Cargando…" : inHome ? "En casa" : "Fuera de casa"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">El estado en casa solo puede cambiarlo un administrador.</p>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader><CardTitle className="text-base text-destructive">Zona de peligro</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Eliminar tu cuenta es permanente. Serás removido de todas tus casas.</p>
          <Button variant="destructive" onClick={() => setShowDeleteAlert(true)} disabled={deleting}>
            {deleting ? "Eliminando…" : "Eliminar cuenta"}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar cuenta?</AlertDialogTitle><AlertDialogDescription>Esta acción es permanente y no se puede deshacer. Se eliminarán todos tus datos.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={onDeleteAccount}>Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
