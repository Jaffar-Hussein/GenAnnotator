import Link from 'next/link'
import { FeatureSection } from "@/components/feature-section"
import { HeroSection } from "@/components/hero-section"
import { GridBackground } from "@/components/grid-background"
import { Footer } from "@/components/Footer"
// import { TeamTestimonials } from "@/components/team-testimonials"

export default function Home() {
  return (
    <div className="relative">
      <GridBackground />
      <HeroSection />
      <div className="container mx-auto py-8">
        <FeatureSection />
        {/* <TeamTestimonials /> */}
      </div>
      
      <Footer />
    </div>
  )
}

