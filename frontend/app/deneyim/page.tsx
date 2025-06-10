"use client"

import { useEffect, useState } from "react"
import ExperienceCard from "@/components/common/experience-card"

interface Experience {
  id: number
  title: string
  description: string
  start_date: string
  end_date: string
  tags: string[]
}

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([])

  useEffect(() => {
    fetch("http://localhost:5000/api/experiences")
      .then((res) => res.json())
      .then((data) => {
        // Deneyimleri en yeniden en eskiye doğru sırala
        const sortedData = data.sort((a: Experience, b: Experience) => {
          const dateA = new Date(a.end_date || a.start_date).getTime()
          const dateB = new Date(b.end_date || b.start_date).getTime()
          return dateB - dateA // Azalan sıra (en yeni en başta)
        })
        setExperiences(sortedData)
      })
      .catch((err) => console.error("Experiences fetch error:", err))
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
    })
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-anton text-6xl text-[#404040] uppercase tracking-wider mb-4">Deneyim</h1>
          <p className="font-montserrat text-black text-lg">Yaşadığım deneyimler.</p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-0.5 w-0.5 h-full bg-[#404040]"></div>

          <div className="space-y-12">
            {experiences.map((experience, index) => (
              <div
                key={experience.id}
                className={`flex items-center ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div className={`w-5/12 ${index % 2 === 0 ? "pr-8" : "pl-8"}`}>
                  <ExperienceCard
                    title={experience.title}
                    description={experience.description}
                    startDate={formatDate(experience.start_date)}
                    endDate={formatDate(experience.end_date)}
                    tags={experience.tags}
                    isLeft={index % 2 === 0}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
