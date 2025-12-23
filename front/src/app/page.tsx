import { Navigation } from "@/components/homePage/navigation"
import { HeroSection } from "@/components/homePage/hero-section"
import { FeaturesSection } from "@/components/homePage/features-section"
import { HowItWorksSection } from "@/components/homePage/how-it-works-section"
import { TestimonialsSection } from "@/components/homePage/testimonials-section"
import { CTASection } from "@/components/homePage/cta-section"
import { Footer } from "@/components/homePage/footer"

export default function Home() {

  let user = null


  return (
    <div className="min-h-screen bg-white">
      <Navigation user={user} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
