import React from 'react'
import { AdminPanel } from './AdminPanel'
import { Dashboard } from './Dashboard'

const AdminDashboard = () => {
  return (
    <AdminPanel currentPath="/admin/dashboard">
      <Dashboard />
    </AdminPanel>
  )
}

export default AdminDashboard