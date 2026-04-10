"use client"
import { useAuthStore } from "@/stores/authStore"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, CalendarRange, Star, Users, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Link, useNavigate } from "react-router-dom"

export default function AdminPage() {
  const role = useAuthStore(s => s.activeHouseRole)
  const houses = useAuthStore(s => s.houses)
  const activeHouseId = useAuthStore(s => s.activeHouseId)
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const isAdmin = role === "owner" || role === "admin"
  useEffect(() => { if (role && !isAdmin) navigate("/dashboard") }, [role, isAdmin])

  const activeHouse = houses.find(h => h.id === activeHouseId)
  const inviteLink = activeHouse?.code ? `${typeof window !== "undefined" ? window.location.origin : ""}/join?code=${activeHouse.code}` : null

  const copyLink = async () => {
    if (!inviteLink) return
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
    toast.success("Link copiado")
  }

  const adminActions = [
    { href: "/dashboard/assign", icon: ClipboardList, title: "Asignar tareas", description: "Asigná tareas semanales a los usuarios de la casa" },
    { href: "/dashboard/pass-week", icon: CalendarRange, title: "Pasar semana", description: "Rotá las asignaciones para la próxima semana" },
    { href: "/dashboard/sector-priority", icon: Star, title: "Prioridad de sectores", description: "Configurá el orden de rotación de sectores" },
    { href: "/dashboard/roles", icon: Users, title: "Roles", description: "Gestioná los roles y permisos de los usuarios" },
  ]

  if (!isAdmin) return null

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Panel de administración</h1>
          <p className="text-muted-foreground text-sm">{activeHouse?.name}</p>
        </div>
        <Badge className="ml-auto capitalize">{role}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {adminActions.map(action => (
          <Link key={action.href} to={action.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{action.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {inviteLink && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Link de invitación</CardTitle>
            <CardDescription>Compartí este link para que otros se unan a la casa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
              <code className="flex-1 text-xs text-muted-foreground truncate">{inviteLink}</code>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Código: <span className="font-mono font-semibold">{activeHouse?.code}</span></p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
