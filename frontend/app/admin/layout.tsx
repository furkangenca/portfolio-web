"use client"

import type React from "react"
import { Anton, Montserrat } from "next/font/google"
import "../globals.css"
import AdminLayoutComponent from "@/components/features/admin/admin-layout"

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${anton.variable} ${montserrat.variable} bg-gray-100 min-h-screen font-montserrat`}>
      {children}
    </div>
  )
}
