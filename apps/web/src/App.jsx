import { Navigate, Route, Routes } from 'react-router-dom'
import InvitationPage from './pages/InvitationPage'
import PrivatePage from './pages/PrivatePage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PrivatePage />} />
      <Route path="/invite/:token" element={<InvitationPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<PrivatePage />} />
    </Routes>
  )
}
