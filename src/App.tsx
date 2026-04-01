import { Routes, Route } from 'react-router-dom'
import Home from './app/home'
import PrivacyPolicy from './app/privacy'
import Support from './app/support'
import LoginPage from './app/(auth)/login/page'
import DashboardPage from './app/(dashboard)/dashboard/page'
import DashboardLayout from './app/(dashboard)/_layout'
import HousesPage from './app/(dashboard)/dashboard/houses/page'
import UsersPage from './app/(dashboard)/dashboard/users/page'
import SectorsPage from './app/(dashboard)/dashboard/sectors/page'
import TasksPage from './app/(dashboard)/dashboard/tasks/page'
import ProfilePage from './app/(dashboard)/dashboard/profile/page'
import AssignPage from './app/(dashboard)/dashboard/assign/page'


export const metadata = {
  title: "LimpiezaON",
  description: "Gestión de tareas de limpieza",
}

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <DashboardLayout>
          <DashboardPage />
        </DashboardLayout>
      } />
      <Route path="/privacidad" element={<PrivacyPolicy />} />
      <Route path="/soporte" element={<Support />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <DashboardLayout>
          <DashboardPage />
        </DashboardLayout>
      } />
      <Route path="/dashboard/houses" element={
        <DashboardLayout>
          <HousesPage />
        </DashboardLayout>
      } />
      <Route path="/dashboard/users" element={
        <DashboardLayout>
          <UsersPage />
        </DashboardLayout>
      } />
      <Route path="/dashboard/sectors" element={
        <DashboardLayout>
          <SectorsPage />
        </DashboardLayout>
      } />
      <Route path="/dashboard/tasks" element={
        <DashboardLayout>
          <TasksPage />
        </DashboardLayout>
      } />
      <Route path="/dashboard/profile" element={
        <DashboardLayout>
          <ProfilePage />
        </DashboardLayout>
      } />
      <Route path="/dashboard/assign" element={
        <DashboardLayout>
          <AssignPage />
        </DashboardLayout>
      } />
    </Routes>
  )
}

export default App