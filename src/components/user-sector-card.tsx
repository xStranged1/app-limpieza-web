import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"
import { Badge } from "./ui/badge"
import type { UserSectorAssignment } from "@/const/types"

interface UserSectorCardProps {
    assignment: UserSectorAssignment
}

export function UserSectorCard({ assignment }: UserSectorCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                    </div>

                    {/* Nombre + Sectores */}
                    <div className="flex-1">
                        <h3 className="font-medium text-foreground">{assignment.user.name}</h3>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {assignment.assignedSectors && assignment.assignedSectors.length > 0 ? (
                                assignment.assignedSectors.map((sectorObj, idx) => (
                                    <Badge key={idx} variant="default" className="flex items-center gap-1">
                                        {sectorObj.sector}
                                    </Badge>
                                ))
                            ) : (
                                <Badge variant="secondary" className="text-muted-foreground">
                                    Sin asignar
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
