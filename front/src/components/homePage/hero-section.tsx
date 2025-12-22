import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-blue-50 text-[#4361ee] rounded-full text-sm font-medium">
              Welcome to your online French school
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance">
              Learn French with Native Teachers
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Connect with experienced French teachers for personalized one-on-one lessons. Book your first lesson today
              and start speaking French with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-[#4361ee] hover:bg-[#3651d4] text-white text-lg h-14 px-8">
                Get a free trial lesson
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              {/* <Button
                size="lg"
                variant="outline"
                className="text-lg h-14 px-8 border-gray-300 hover:bg-gray-50 bg-transparent"
              >
                Become a teacher
              </Button> */}
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Active Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">Expert Teachers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">10k+</div>
                <div className="text-sm text-gray-600">Lessons Completed</div>
              </div>
            </div>
          </div>

          {/* Right Content - Teacher Cards */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Teacher Card 1 */}
              <div className="relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl overflow-hidden aspect-square">
                <Image
                  src="/smiling-woman-with-curly-hair-in-white-shirt.jpg"
                  alt="French teacher"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-[#f72585] p-3 rounded-2xl shadow-lg">
                  <span className="text-2xl">❤️</span>
                </div>
              </div>

              {/* Teacher Card 2 */}
              <div className="relative bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl overflow-hidden aspect-square mt-8">
                <Image
                  src="/man-with-beard-holding-tablet-in-casual-clothes.jpg"
                  alt="French teacher"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 bg-white p-3 rounded-2xl shadow-lg">
                  <span className="text-2xl">☕</span>
                </div>
                <div className="absolute bottom-4 right-4 bg-white p-3 rounded-2xl shadow-lg">
                  <span className="text-2xl">🌿</span>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#4cc9f0] rounded-full opacity-60"></div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-[#f72585] rounded-full opacity-40"></div>
            <div className="absolute top-1/2 -right-8 w-6 h-6 bg-[#f59e0b] rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
