import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './components/domain/AuthProvider.tsx'
const redirect = sessionStorage.redirect;
delete sessionStorage.redirect;

if (redirect) {
  window.history.replaceState(null, "", redirect);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/app-limpieza-web">
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)