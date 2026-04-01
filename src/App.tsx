import { Routes, Route } from 'react-router-dom'
import Home from './app/home'
import PrivacyPolicy from './app/privacy'
import Support from './app/support'
import LoginPage from './app/(auth)/login/page'
import DashboardPage from './app/(dashboard)/dashboard/page'


export const metadata = {
  title: "LimpiezaON",
  description: "Gestión de tareas de limpieza",
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/privacidad" element={<PrivacyPolicy />} />
      <Route path="/soporte" element={<Support />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  )
}

export default App