"use client"

import { X, Github, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"

interface ProjectDetail {
  title: string
  long_desc: string
  github_url?: string
  technologies: string[]
  images: string[]
}

interface ProjectModalProps {
  project: ProjectDetail
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const openImage = (index: number) => {
    setSelectedImageIndex(index)
  }

  const closeImage = () => {
    setSelectedImageIndex(null)
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return

    let newIndex = selectedImageIndex
    if (direction === 'next') {
      newIndex = (selectedImageIndex + 1) % project.images.length
    } else {
      newIndex = (selectedImageIndex - 1 + project.images.length) % project.images.length
    }
    setSelectedImageIndex(newIndex)
  }

  useEffect(() => {
    document.body.classList.add('overflow-hidden')
    document.documentElement.classList.add('overflow-hidden')
    return () => {
      document.body.classList.remove('overflow-hidden')
      document.documentElement.classList.remove('overflow-hidden')
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#404040] text-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors duration-300 z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="flex items-center space-x-4 mb-8">
            <h2 className="font-anton text-3xl uppercase tracking-wide">{project.title}</h2>
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white transition-colors duration-300 transform hover:scale-125"
              >
                <div className="p-2 rounded-full border border-white/50 flex items-center justify-center">
                  <Github size={28} />
                </div>
              </a>
            )}
          </div>

          <div className="bg-[#2a2a2a] rounded-xl p-6 mb-8">
            <p className="font-montserrat text-gray-200 leading-relaxed">{project.long_desc}</p>
          </div>

          <div className="mb-8">
            <h3 className="font-anton text-xl uppercase tracking-wide mb-4">Kullanılan Teknolojiler</h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <span 
                  key={index} 
                  className="bg-[#2a2a2a] px-4 py-2 rounded-full text-sm font-montserrat text-gray-200 hover:bg-[#333333] transition-colors duration-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {project.images.length > 0 && (
            <div>
              <h3 className="font-anton text-xl uppercase tracking-wide mb-4">Arayüz Fotoğrafları</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.images.map((image, index) => (
                  <div 
                    key={index} 
                    className="relative h-64 w-full group overflow-hidden rounded-xl shadow-lg cursor-pointer"
                    onClick={() => openImage(index)}
                  >
                    <Image
                      src={image ? `http://localhost:5000${image}` : "/placeholder.svg?height=192&width=192"}
                      alt={`${project.title} - ${index + 1}`}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white font-montserrat text-sm">Büyütmek için tıklayın</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <button 
            onClick={closeImage} 
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-300 z-50"
          >
            <X size={32} />
          </button>
          
          <button
            onClick={() => navigateImage('prev')}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors duration-300 z-50 p-2 rounded-full bg-black/30 hover:bg-black/50"
          >
            <ChevronLeft size={32} />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={project.images[selectedImageIndex] ? `http://localhost:5000${project.images[selectedImageIndex]}` : "/placeholder.svg?height=192&width=192"}
              alt={`${project.title} - ${selectedImageIndex + 1}`}
              fill
              className="object-contain rounded-lg shadow-xl"
            />
          </div>

          <button
            onClick={() => navigateImage('next')}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors duration-300 z-50 p-2 rounded-full bg-black/30 hover:bg-black/50"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </div>
  )
}
