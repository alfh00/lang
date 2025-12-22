import { Video, Calendar, Star, Clock, Globe, Shield } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Video,
    title: "Live Video Lessons",
    description: "Connect face-to-face with native French teachers through high-quality video calls.",
    color: "text-[#4361ee]",
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "Book lessons that fit your schedule. Choose from hundreds of available time slots.",
    color: "text-[#f72585]",
  },
  {
    icon: Star,
    title: "Verified Teachers",
    description: "All teachers are verified native speakers with teaching experience and great reviews.",
    color: "text-[#4cc9f0]",
  },
  {
    icon: Clock,
    title: "Learn at Your Pace",
    description: "No commitments. Book single lessons or create a regular schedule that works for you.",
    color: "text-[#f59e0b]",
  },
  {
    icon: Globe,
    title: "Learn Anywhere",
    description: "Access your lessons from any device. All you need is an internet connection.",
    color: "text-[#10b981]",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Safe and secure payment processing. Get refunds if you need to cancel.",
    color: "text-[#4361ee]",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 text-balance">Why Choose Frenchschool?</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Everything you need to master French, all in one place
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow bg-white border-gray-200">
              <div
                className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 ${feature.color}`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
