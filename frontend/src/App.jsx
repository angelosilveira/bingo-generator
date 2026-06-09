import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import NewBingoPage from './pages/NewBingoPage'
import TemplatePage from './pages/TemplatePage'
import EditBingoPage from './pages/EditBingoPage'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/novo" element={<PrivateRoute><NewBingoPage /></PrivateRoute>} />
      <Route path="/editar/:id" element={<PrivateRoute><EditBingoPage /></PrivateRoute>} />
      <Route path="/template" element={<PrivateRoute><TemplatePage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
