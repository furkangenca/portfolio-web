"use client"

import { useEffect, useState } from "react"
import ProjectCard from "@/components/common/project-card"
import ProjectModal from "@/components/common/project-modal"

interface Project {
  id: number
  title: string
  short_desc: string
}

interface ProjectDetail {
  title: string
  long_desc: string
  github_url?: string
  technologies: string[]
  images: string[]
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetch("http://localhost:5000/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Projects fetch error:", err))
  }, [])

  const handleProjectClick = async (projectId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`)
      const projectDetail = await response.json()
      setSelectedProject(projectDetail)
      setIsModalOpen(true)
    } catch (err) {
      console.error("Project detail fetch error:", err)
    }
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-anton text-6xl text-[#404040] uppercase tracking-wider mb-4">Projeler</h1>
          <p className="font-montserrat text-black text-lg">Geliştirdiğim kişisel projelerim</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.short_desc}
              onClick={() => handleProjectClick(project.id)}
            />
          ))}
        </div>
      </div>

      {isModalOpen && selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}
