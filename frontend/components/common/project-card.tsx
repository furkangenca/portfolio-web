"use client"

interface ProjectCardProps {
  title: string
  description: string
  onClick: () => void
}

export default function ProjectCard({ title, description, onClick }: ProjectCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-[#404040] text-white p-6 rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#404040] to-[#2a2a2a] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <h3 className="font-anton text-xl uppercase mb-3 tracking-wide">{title}</h3>
        <p className="font-montserrat text-sm text-gray-300 leading-relaxed">{description}</p>
        <div className="mt-4 flex items-center text-sm text-gray-400 group-hover:text-white transition-colors duration-300">
          <span>Detayları Gör</span>
          <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
