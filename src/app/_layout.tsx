import "./globals.css"
import { Toaster } from "sonner"
import { AuthProvider } from "@/components/domain/AuthProvider"

export const metadata = {
  title: "LimpiezaON",
  description: "Gestión de tareas de limpieza",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthProvider>
        {children}
      </AuthProvider>
      <Toaster richColors position="top-right" />
    </>
  )
}
