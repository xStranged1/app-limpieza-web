"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuthStore } from "@/stores/authStore"
import { listUsersForHouse } from "@/services/users"
import { setUserRole } from "@/services/houses"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/index"
import { toast } from "sonner"
import type { HouseRole } from "@/services/types"
import { Crown, Shield, User } from "lucide-react"

type Row = { id: string; uid: string; displayName: string; role: HouseRole; canControl: boolean }

const ROLE_LABELS: Record<HouseRole, string> = { owner: "Owner", admin: "Admin", member: "Miembro" }
const ROLE_ICON: Record<HouseRole, React.ElementType> = { owner: Crown, admin: Shield, member: User }
const ROLE_BADGE: Record<HouseRole, string> = {
  owner: "bg-yellow-400/15 text-yellow-700 border-yellow-400/30",
  admin: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  member: "bg-muted text-muted-foreground border-border",
}

export default function RolesPage() {
  const activeHouseId = useAuthStore(s => s.activeHouseId)
  const currentUid = useAuthStore(s => s.user?.uid)
  const activeHouseRole = useAuthStore(s => s.activeHouseRole)
  const isOwner = activeHouseRole === "owner"
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!activeHouseId) return
    const users = await listUsersForHouse(activeHouseId)
    setRows(users.map(u => ({ id: u.id, uid: u.uid, displayName: u.displayName, role: u.role as HouseRole, canControl: u.canControl })))
  }, [activeHouseId])

  useEffect(() => { refresh() }, [refresh])

  const changeRole = async (u: Row, newRole: HouseRole) => {
    if (!activeHouseId || u.uid === currentUid || u.role === "owner") return
    setLoading(true)
    try { await setUserRole({ houseId: activeHouseId, uid: u.uid, role: newRole }); await refresh(); toast.success(`Rol actualizado a ${ROLE_LABELS[newRole]}`) }
    catch { toast.error("Error al cambiar rol") } finally { setLoading(false) }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Roles</h1>
        {!isOwner && <p className="text-sm text-muted-foreground mt-1">Solo el owner puede modificar roles.</p>}
      </div>
      <div className="space-y-2">
        {rows.map(u => {
          const isSelf = u.uid === currentUid
          const isProtected = u.role === "owner" || isSelf
          const RoleIcon = ROLE_ICON[u.role]
          return (
            <div key={u.uid} className="flex items-center gap-4 rounded-lg border bg-card p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{u.displayName}</span>
                  {isSelf && <span className="text-xs text-muted-foreground">(vos)</span>}
                </div>
                <Badge variant="outline" className={`mt-1 text-xs border ${ROLE_BADGE[u.role]}`}>
                  <RoleIcon className="h-3 w-3 mr-1" />{ROLE_LABELS[u.role]}
                </Badge>
              </div>
              {isOwner && !isProtected && (
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant={u.role === "admin" ? "default" : "outline"} disabled={loading || u.role === "admin"} onClick={() => changeRole(u, "admin")}>Admin</Button>
                  <Button size="sm" variant={u.role === "member" ? "default" : "outline"} disabled={loading || u.role === "member"} onClick={() => changeRole(u, "member")}>Miembro</Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
