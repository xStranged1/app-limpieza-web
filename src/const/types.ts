export interface ActiveTask {
    sector: string
    data: string[]
}

export interface AssignedTask {
    uid: string
    active_tasks?: ActiveTask[]
    control_marked_tasks?: string[]
    marked_tasks?: string[]
}

export interface User {
    uid: string
    name: string
}

export interface UserSectorAssignment {
    user: User
    assignedSectors: ActiveTask[] | null
}
