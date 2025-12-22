import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Business Professional",
    image: "/professional-woman-smiling.png",
    rating: 5,
    text: "I went from zero French to having conversations in just 3 months! The teachers are patient and the flexible scheduling fits my busy life perfectly.",
  },
  {
    name: "Michael Chen",
    role: "University Student",
    image: "/smiling-man-glasses.png",
    rating: 5,
    text: "The best investment in my education. My teacher tailors every lesson to my needs and the video quality is excellent.",
  },
  {
    name: "Emma Williams",
    role: "Retired Teacher",
    image: "/older-woman-smiling-warmly.jpg",
    rating: 5,
    text: "I've tried many language apps, but nothing compares to real conversations with native speakers. Highly recommend!",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 text-balance">What Our Students Say</h2>
          <p className="text-xl text-gray-600 leading-relaxed">Join thousands of happy students learning French</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-white border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#f59e0b] text-[#f59e0b]" />
                ))}
              </div>

              <p className="text-gray-900 leading-relaxed mb-6 italic">"{testimonial.text}"</p>

              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
