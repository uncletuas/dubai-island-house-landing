import { useState } from 'react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { CheckCircle2, MapPin, Sparkles, Shield, TrendingUp, Home, Clock } from 'lucide-react';
import { leadSubmitUrl, supabaseAnonKey } from '../lib/supabaseEnv';

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send to Supabase backend endpoint
      const response = await fetch(leadSubmitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Supabase Edge Functions require Authorization header when JWT verification is enabled.
          // NOTE: Avoid sending an `apikey` header from the browser.
          // Supabase Edge Functions on supabase.co may not include `apikey` in
          // Access-Control-Allow-Headers, which causes the browser preflight to fail.
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Reset form after 4 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ name: '', whatsapp: '', email: '' });
        }, 4000);
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('Form submission failed:', errorText);
        alert('There was an issue submitting your request. Please email us directly at info@dubaiislandhouse.com');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('There was an issue submitting your request. Please email us directly at info@dubaiislandhouse.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1728970381470-21d81c2b05b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBEdWJhaSUyMHdhdGVyZnJvbnQlMjBza3lsaW5lfGVufDF8fHx8MTc3MDM1ODA4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Luxury Dubai Waterfront"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl text-white mb-6 tracking-tight">
            Your Waterfront Villa
            <span className="block text-[#D4AF37]">Awaits in Dubai</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
            Exclusive island living with panoramic views. Limited units available.
          </p>
          <button
            onClick={scrollToForm}
            className="bg-[#D4AF37] hover:bg-[#C5A028] text-black px-12 py-5 text-lg font-medium transition-all duration-300 hover:scale-105"
          >
            Get Full Project Details
          </button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            <div className="text-center">
              <MapPin className="w-10 h-10 mx-auto mb-4 text-[#D4AF37]" strokeWidth={1.5} />
              <h3 className="text-lg mb-2">Prime Island Location</h3>
              <p className="text-gray-600 text-sm">Direct beach access & marina views</p>
            </div>
            <div className="text-center">
              <Sparkles className="w-10 h-10 mx-auto mb-4 text-[#D4AF37]" strokeWidth={1.5} />
              <h3 className="text-lg mb-2">Luxury Finishes</h3>
              <p className="text-gray-600 text-sm">Italian marble & premium fixtures</p>
            </div>
            <div className="text-center">
              <Shield className="w-10 h-10 mx-auto mb-4 text-[#D4AF37]" strokeWidth={1.5} />
              <h3 className="text-lg mb-2">Flexible Payment</h3>
              <p className="text-gray-600 text-sm">Attractive plans for investors</p>
            </div>
            <div className="text-center">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-4 text-[#D4AF37]" strokeWidth={1.5} />
              <h3 className="text-lg mb-2">Ready Q4 2026</h3>
              <p className="text-gray-600 text-sm">Move-in date guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative h-80 md:h-96 overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1682685098665-01419745162e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwd2F0ZXJmcm9udCUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc3MDM1ODA4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Premium Interior"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="relative h-80 md:h-96 overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1650838693474-756df587cc0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBiYWxjb255JTIwdmlld3xlbnwxfHx8fDE3NzAzNTgwODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Balcony View"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="relative h-80 md:h-96 overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1757264119016-7e6b568b810d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjB2aWxsYSUyMHBvb2x8ZW58MXx8fHwxNzcwMjcyMzExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Pool & Villa"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Opportunity Overview Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl text-center mb-12">
            The <span className="text-[#D4AF37]">Opportunity</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Investment Column */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
                <h3 className="text-xl font-medium">Investment Advantages</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>Prime waterfront location with high appreciation potential</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>Strong market demand in Dubai's premium real estate sector</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>Long-term value growth in exclusive island development</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>Flexible payment plans tailored for investors</span>
                </li>
              </ul>
            </div>

            {/* Residential Column */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Home className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
                <h3 className="text-xl font-medium">Residential Benefits</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>Premium finishes with Italian marble and designer fixtures</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>Complete privacy in exclusive gated community</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>Unmatched comfort with smart home technology</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>Quality surroundings with world-class amenities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-16 px-4 bg-gray-50 border-t border-b border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-[#D4AF37]" strokeWidth={1.5} />
          <h2 className="text-2xl md:text-3xl mb-4">
            <span className="text-[#D4AF37]">Limited Time Offer</span> – Don't Miss Out
          </h2>
          <p className="text-gray-700 text-lg mb-6">
            Only <strong>12 waterfront units</strong> remain in this exclusive launch phase. Early reservations receive priority selection and special pricing.
          </p>
          <button
            onClick={scrollToForm}
            className="bg-black hover:bg-[#D4AF37] text-white hover:text-black px-10 py-4 text-lg font-medium transition-all duration-300"
          >
            Secure Your Priority Access
          </button>
        </div>
      </section>

      {/* Lead Capture Form */}
      <section id="lead-form" className="py-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-4xl md:text-5xl mb-4">
            Request <span className="text-[#D4AF37]">Full Details</span>
          </h2>
          <p className="text-gray-600 mb-10">
            Receive floor plans, pricing, and exclusive offers within 24 hours
          </p>

          {isSubmitted ? (
            <div className="bg-green-50 border-2 border-green-500 p-8 rounded-sm">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-2xl mb-2">Thank You!</h3>
              <p className="text-gray-700">Our team will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-6 py-4 border border-gray-300 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              />
              <input
                type="tel"
                placeholder="WhatsApp Number (with country code)"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                required
                className="w-full px-6 py-4 border border-gray-300 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-6 py-4 border border-gray-300 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black hover:bg-[#D4AF37] text-white hover:text-black px-8 py-5 text-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Send Me Full Details'}
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Your information is 100% confidential. No spam, ever.
              </p>
              <p className="text-xs text-gray-600 mt-3">
                Or email us directly at{' '}
                <a href="mailto:info@dubaiislandhouse.com" className="text-[#D4AF37] hover:underline">
                  info@dubaiislandhouse.com
                </a>
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl mb-4">
            Limited Availability. Act Now.
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Only 12 waterfront units remaining in this exclusive launch
          </p>
          <button
            onClick={scrollToForm}
            className="bg-[#D4AF37] hover:bg-white text-black px-12 py-5 text-lg font-medium transition-all duration-300 hover:scale-105"
          >
            Reserve Your Unit Today
          </button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 px-4 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600 text-sm">
            © 2026 DubaiIslandHouse.com · Premium Waterfront Living
          </p>
          <div className="mt-2">
            <a
              href="/privacy-policy"
              className="text-xs text-gray-500 hover:text-black underline underline-offset-4"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
