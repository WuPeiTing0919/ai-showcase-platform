"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, BarChart3, Settings, LogOut, Code, Shield, Upload } from "lucide-react"
import { LoginDialog } from "./login-dialog"
import { RegisterDialog } from "./register-dialog"
import { ForgotPasswordDialog } from "./forgot-password-dialog"
import { ProfileDialog } from "./profile-dialog"
import { ActivityRecordsDialog } from "./activity-records-dialog"
import { SettingsDialog } from "./settings-dialog"
import { AppSubmissionDialog } from "../app-submission-dialog"

export function UserMenu() {
  const { user, logout, canAccessAdmin, canSubmitApp } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showAppSubmission, setShowAppSubmission] = useState(false)

  const handleSwitchToRegister = () => {
    setLoginOpen(false)
    setRegisterOpen(true)
  }

  const handleSwitchToLogin = () => {
    setRegisterOpen(false)
    setForgotPasswordOpen(false)
    setLoginOpen(true)
  }

  const handleSwitchToForgotPassword = () => {
    setLoginOpen(false)
    setForgotPasswordOpen(true)
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "管理員"
      case "developer":
        return "開發者"
      case "user":
        return "一般用戶"
      default:
        return role
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-3 h-3" />
      case "developer":
        return <Code className="w-3 h-3" />
      case "user":
        return <User className="w-3 h-3" />
      default:
        return <User className="w-3 h-3" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "developer":
        return "bg-green-100 text-green-800"
      case "user":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) {
    return (
      <>
        <Button
          onClick={() => setLoginOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          登入
        </Button>

        <LoginDialog
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onSwitchToRegister={handleSwitchToRegister}
          onSwitchToForgotPassword={handleSwitchToForgotPassword}
        />

        <RegisterDialog open={registerOpen} onOpenChange={setRegisterOpen} onSwitchToLogin={handleSwitchToLogin} />

        <ForgotPasswordDialog
          open={forgotPasswordOpen}
          onOpenChange={setForgotPasswordOpen}
          onBackToLogin={handleSwitchToLogin}
        />
      </>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {user.department}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleColor(user.role)}`}
                >
                  {getRoleIcon(user.role)}
                  <span className="ml-1">{getRoleText(user.role)}</span>
                </span>
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />
          {canAccessAdmin() && (
            <>
              <DropdownMenuItem onClick={() => window.open("/admin", "_blank")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>管理後台</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {canSubmitApp() && (
            <>
              <DropdownMenuItem onClick={() => setShowAppSubmission(true)}>
                <Upload className="mr-2 h-4 w-4" />
                <span>提交應用</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setProfileOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>個人資料</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActivityOpen(true)}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>活動紀錄</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>設定</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>登出</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <ActivityRecordsDialog open={activityOpen} onOpenChange={setActivityOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AppSubmissionDialog open={showAppSubmission} onOpenChange={setShowAppSubmission} />
    </>
  )
}
