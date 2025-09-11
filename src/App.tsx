import { collection, onSnapshot, query } from "firebase/firestore"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { User, AssignedTask, UserSectorAssignment } from "./const/types"
import { UserSectorCard } from "./components/user-sector-card"
import { db } from "./const/config"

export default function App() {
  const [searchTerm, setSearchTerm] = useState("")
  const [assignments, setAssignments] = useState<UserSectorAssignment[]>([])

  useEffect(() => {
    const assignedTasksRef = collection(db, "assigned_tasks")
    const usersRef = collection(db, "user")

    let tasks: AssignedTask[] = []
    let users: User[] = []

    const mergeData = () => {
      const merged: UserSectorAssignment[] = users.map((u) => ({
        user: u,
        // ahora es array de sectores con data (no null)
        assignedSectors: tasks.find((t) => t.uid === u.uid)?.active_tasks ?? [],
      }))
      setAssignments(merged)
    }

    const unsubscribeTasks = onSnapshot(query(assignedTasksRef), (tasksSnap) => {
      tasks = tasksSnap.docs.map((doc) => ({
        uid: doc.data().uid,
        active_tasks: doc.data().active_tasks ?? [],
        control_marked_tasks: doc.data().control_marked_tasks ?? [],
        marked_tasks: doc.data().marked_tasks ?? [],
      }))
      mergeData()
    })

    const unsubscribeUsers = onSnapshot(query(usersRef), (usersSnap) => {
      users = usersSnap.docs.map((doc) => ({
        uid: doc.id,
        name: doc.data().username,
      }))
      mergeData()
    })

    return () => {
      unsubscribeTasks()
      unsubscribeUsers()
    }
  }, [])


  console.log("assignments");
  console.log(assignments);

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  console.log("filteredAssignments");
  console.log(filteredAssignments);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Asignación de Sectores</h1>
          </div>

          <div className="mt-4 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssignments.map((assignment) => (
            <UserSectorCard
              key={assignment.user.uid}
              assignment={assignment}
            />
          ))}
        </div>

        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No se encontraron usuarios que coincidan con la búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
