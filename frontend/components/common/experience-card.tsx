import { Briefcase, GraduationCap } from "lucide-react"

interface ExperienceCardProps {
  title: string
  description: string
  startDate: string
  endDate: string
  tags: string[]
  isLeft: boolean
}

export default function ExperienceCard({ title, description, startDate, endDate, tags, isLeft }: ExperienceCardProps) {
  const isInternship = title.toLowerCase().includes("staj")
  const Icon = isInternship ? Briefcase : GraduationCap

  return (
    <div className="bg-[#404040] text-white p-6 rounded-2xl relative overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      {/* Timeline dot */}
      <div
        className={`absolute top-6 w-4 h-4 bg-[#404040] border-4 border-[#fbf5f4] rounded-full z-10 ${isLeft ? "-right-10" : "-left-10"}`}
      ></div>

      <div className="flex items-start space-x-4 mb-4 relative z-10">
        <div className="p-2 rounded-full border border-white/50 flex items-center justify-center flex-shrink-0">
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <h3 className="font-anton text-xl uppercase leading-tight mb-1">{title}</h3>
          <p className="font-montserrat text-sm text-gray-300">
            {startDate} - {endDate}
          </p>
        </div>
      </div>

      <p className="font-montserrat text-sm mb-4 text-gray-200 relative z-10">{description}</p>

      <div className="flex flex-wrap gap-2 relative z-10">
        {tags.map((tag, index) => (
          <span key={index} className="bg-[#2a2a2a] px-3 py-1 rounded-full text-xs font-montserrat text-gray-300 hover:bg-[#333333] transition-colors duration-300">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
