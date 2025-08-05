import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { CompetitionProvider } from "@/contexts/competition-context"
import { Toaster } from "@/components/ui/toaster"
import { ChatBot } from "@/components/chat-bot"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <AuthProvider>
          <CompetitionProvider>
            {children}
            <Toaster />
            <ChatBot />
          </CompetitionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
