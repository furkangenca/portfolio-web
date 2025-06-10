import type React from "react"
import type { Metadata } from "next"
import { Anton, Montserrat } from "next/font/google"
import "./globals.css"
import NavbarWrapper from "@/components/common/navbar-wrapper"

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: "Furkan Gença",
  description: "Yazılım Mühendisi",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body
        className={`${anton.variable} ${montserrat.variable} min-h-screen font-montserrat`}
        style={{
          backgroundImage: "url('/images/wallpaper.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <NavbarWrapper />
        <main>{children}</main>
      </body>
    </html>
  )
}
