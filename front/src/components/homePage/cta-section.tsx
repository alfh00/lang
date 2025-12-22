import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="bg-gradient-to-br from-[#4361ee] to-[#3651d4] rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 text-balance">
              Ready to Start Your French Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join Frenchschool today and get your first lesson at 50% off. No commitments, cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#4361ee] hover:bg-white/90 text-lg h-14 px-8">
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg h-14 px-8 bg-transparent"
              >
                Browse Teachers
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
