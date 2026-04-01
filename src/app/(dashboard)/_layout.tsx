"use client"
import { useEffect, useState } from "react"
import { signOut } from "firebase/auth"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import { Home, Users, Settings, ClipboardList, Layers, History, Crown, UserCheck, CalendarRange, Star, LogOut, ChevronRight, Menu, X, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link, useNavigate } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { auth } from "@/const/config"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const navItems = [
  { href: "/dashboard", label: "Tareas", icon: Home },
  { href: "/dashboard/users", label: "Usuarios", icon: Users },
  { href: "/dashboard/history", label: "Historial", icon: History },
  { href: "/dashboard/tasks", label: "CRUD Tareas", icon: ClipboardList },
  { href: "/dashboard/sectors", label: "Sectores", icon: Layers },
  { href: "/dashboard/profile", label: "Mi Perfil", icon: UserCheck },
  { href: "/dashboard/houses", label: "Casas", icon: Building2 },
]

const adminItems = [
  { href: "/dashboard/admin", label: "Panel Admin", icon: Crown },
  { href: "/dashboard/assign", label: "Asignar tareas", icon: ClipboardList },
  { href: "/dashboard/pass-week", label: "Pasar semana", icon: CalendarRange },
  { href: "/dashboard/sector-priority", label: "Prioridad sectores", icon: Star },
  { href: "/dashboard/roles", label: "Roles", icon: Crown },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const pathname = window.location.pathname
  const user = useAuthStore(s => s.user)
  const isBootstrapping = useAuthStore(s => s.isBootstrapping)
  const houses = useAuthStore(s => s.houses)
  const activeHouseId = useAuthStore(s => s.activeHouseId)
  const setActiveHouseId = useAuthStore(s => s.setActiveHouseId)
  const activeHouseRole = useAuthStore(s => s.activeHouseRole)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAdmin = activeHouseRole === "owner" || activeHouseRole === "admin"
  const activeHouse = houses.find(h => h.id === activeHouseId)

  useEffect(() => {
    if (!isBootstrapping && !user) navigate("/login")
  }, [user, isBootstrapping])

  if (isBootstrapping) return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
  if (!user) return null

  const initials = (user.displayName ?? user.email ?? "U").slice(0, 2).toUpperCase()

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4 gap-2">
        <div className="rounded-md bg-primary p-1.5"><Home className="h-4 w-4 text-primary-foreground" /></div>
        <span className="font-semibold text-sm">LimpiezaON</span>
      </div>

      {/* House selector */}
      {houses.length > 0 && (
        <div className="px-3 py-3 border-b">
          <p className="text-xs text-muted-foreground mb-1.5 px-1">Casa activa</p>
          <Select value={activeHouseId ?? ""} onValueChange={setActiveHouseId}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Seleccionar casa" />
            </SelectTrigger>
            <SelectContent>
              {houses.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-auto py-2 px-2">
        <div className="space-y-0.5">
          {navItems.map(item => (
            <Link key={item.href} to={item.href} onClick={() => setSidebarOpen(false)}
              className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground")}>
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
        {isAdmin && (
          <>
            <Separator className="my-3" />
            <p className="px-3 text-xs font-medium text-muted-foreground mb-1">Administración</p>
            <div className="space-y-0.5">
              {adminItems.map(item => (
                <Link key={item.href} to={item.href} onClick={() => setSidebarOpen(false)}
                  className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground")}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left flex-1 min-w-0">
                <span className="text-xs font-medium truncate">{user.displayName ?? "Usuario"}</span>
                <span className="text-xs text-muted-foreground truncate capitalize">{activeHouseRole ?? "—"}</span>
              </div>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/dashboard/profile">Mi Perfil</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/dashboard/settings">Configuración</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => { signOut(auth); navigate("/login") }}>
              <LogOut className="mr-2 h-4 w-4" />Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r bg-card">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-56 bg-card border-r shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex h-14 items-center border-b px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="shrink-0">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold truncate">{activeHouse?.name ?? "LimpiezaON"}</span>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
