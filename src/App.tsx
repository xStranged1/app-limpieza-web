import { Routes, Route } from 'react-router-dom'
import Home from './app/home'
import PrivacyPolicy from './app/privacy'
import Support from './app/support'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/privacidad" element={<PrivacyPolicy />} />
      <Route path="/soporte" element={<Support />} />
    </Routes>
  )
}

export default App