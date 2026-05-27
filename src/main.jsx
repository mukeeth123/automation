import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/main.css'
import { AuthProvider } from './hooks/useAuth'
import Notifications from './components/Notifications'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Notifications />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
