import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import NewBingoPage from './pages/NewBingoPage'
import TemplatePage from './pages/TemplatePage'
import EditBingoPage from './pages/EditBingoPage'
import ConferenciaPage from './pages/ConferenciaPage'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Página pública — tabela de conferência */}
      <Route path="/" element={<ConferenciaPage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin (protegidas) */}
      <Route path="/admin" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/novo" element={<PrivateRoute><NewBingoPage /></PrivateRoute>} />
      <Route path="/editar/:id" element={<PrivateRoute><EditBingoPage /></PrivateRoute>} />
      <Route path="/template" element={<PrivateRoute><TemplatePage /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
