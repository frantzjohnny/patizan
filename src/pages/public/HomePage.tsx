import Hero from '../../components/public/home/Hero'
import StudioIntro from '../../components/public/home/StudioIntro'
import ServicesSection from '../../components/public/home/ServicesSection'
import PricingSection from '../../components/public/home/PricingSection'
import BeatsSection from '../../components/public/home/BeatsSection'
import WhyPatizanSection from '../../components/public/home/WhyPatizanSection'
import StudioShowcase from '../../components/public/home/StudioShowcase'
import TestimonialsSection from '../../components/public/home/TestimonialsSection'
import PromoBanner from '../../components/public/home/PromoBanner'
import SEO from '../../components/common/SEO'

export default function HomePage() {
  return (
    <>
      <SEO
        title="Patizan Records | Recording Studio in Tamarac, FL"
        description="Premier professional recording studio in Tamarac, South Florida. Vocal recording, beat production, podcast studio, mixing and mastering services."
        canonicalPath="/"
      />
      <Hero />
      <StudioIntro />
      <PromoBanner />
      <ServicesSection />
      <PricingSection />
      <BeatsSection />
      <WhyPatizanSection />
      <StudioShowcase />
      <TestimonialsSection />
    </>
  )
}
