import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'

export default function ProtectedRoute() {
  const { isAdmin, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange/30 border-t-orange rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
