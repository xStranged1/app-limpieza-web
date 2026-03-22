import { Routes, Route } from 'react-router-dom'
import Home from './app/home'
import PrivacyPolicy from './app/privacy'

function App() {
  return (
    <Routes>
      <Route path="/app-limpieza-web/" element={<Home />} />
      <Route path="/app-limpieza-web/privacidad/" element={<PrivacyPolicy />} />
    </Routes>
  )
}

export default App