import Link from 'next/link'
import { FeatureSection } from "@/components/feature-section"
import { GridBackground } from "@/components/grid-background"
import { Footer } from "@/components/Footer"
// import { TeamTestimonials } from "@/components/team-testimonials"

export default function Home() {
  return (
    <div className="relative">
      <GridBackground />
      <div className="container mx-auto py-8 pt-32">
        <FeatureSection />
        {/* <TeamTestimonials /> */}
      </div>
      
      <Footer />
    </div>
  )
}

