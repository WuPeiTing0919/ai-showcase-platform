"use client"

import { useState } from "react"
import { AdminLayout } from "./admin-layout"
import { AdminDashboard } from "./dashboard"
import { UserManagement } from "./user-management"
import { AppManagement } from "./app-management"
import { CompetitionManagement } from "./competition-management"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { SystemSettings } from "./system-settings"

export function AdminPanel() {
  const [currentPage, setCurrentPage] = useState("dashboard")

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <AdminDashboard onPageChange={setCurrentPage} />
      case "users":
        return <UserManagement />
      case "apps":
        return <AppManagement />
      case "competitions":
        return <CompetitionManagement />
      case "analytics":
        return <AnalyticsDashboard />
      case "settings":
        return <SystemSettings />
      default:
        return <AdminDashboard onPageChange={setCurrentPage} />
    }
  }

  return (
    <AdminLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </AdminLayout>
  )
}
