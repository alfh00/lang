import { UserPlus, Search, Video } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Create Your Account",
    description: "Sign up in seconds and tell us about your French learning goals.",
  },
  {
    icon: Search,
    number: "02",
    title: "Find Your Teacher",
    description: "Browse teacher profiles, watch intro videos, and read reviews from other students.",
  },
  {
    icon: Video,
    number: "03",
    title: "Start Learning",
    description: "Book your first lesson, meet your teacher, and start speaking French!",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 text-balance">How It Works</h2>
          <p className="text-xl text-gray-600 leading-relaxed">Start learning French in three simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-full h-0.5 bg-gray-200 -z-10"></div>
              )}

              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
                  <div className="absolute inset-0 bg-blue-50 rounded-full"></div>
                  <div className="relative w-20 h-20 bg-[#4361ee] rounded-full flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-[#f72585] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {step.number}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
