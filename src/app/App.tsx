import { useEffect, useMemo, useState } from 'react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import {
  CheckCircle2,
  Waves,
  TrendingUp,
  Building2,
  CalendarDays,
  Quote,
  ShieldCheck,
  Star,
  MessageCircle,
} from 'lucide-react';
import { formspreeEndpoint, leadSubmitUrl, supabaseAnonKey } from '../lib/supabaseEnv';

type LeadFormProps = {
  id?: string;
  title?: string;
  subtitle?: string;
  variant?: 'card' | 'plain';
};

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUsingFormspree = Boolean(formspreeEndpoint);

  const redirectUrl = useMemo(() => {
    // After Formspree submission, redirect back to the same page and show the success state.
    try {
      return `${window.location.origin}/?submitted=1#lead-form`;
    } catch {
      return '/?submitted=1#lead-form';
    }
  }, []);

  useEffect(() => {
    // If we were redirected back by Formspree, show the thank you state.
    try {
      const url = new URL(window.location.href);
      const submitted = url.searchParams.get('submitted') === '1';
      if (submitted) {
        setIsSubmitted(true);
        // Clean URL (remove submitted=1) without reloading.
        url.searchParams.delete('submitted');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
    } catch {
      // ignore
    }
  }, []);

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

  const LeadForm = ({
    id,
    title = 'Get Full Project Details',
    subtitle = 'Receive pricing, floor plans, and availability — shared privately.',
    variant = 'card',
  }: LeadFormProps) => {
    const containerClass =
      variant === 'card'
        ? 'bg-white/95 backdrop-blur border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.25)] rounded-sm'
        : 'bg-white border border-gray-200 rounded-sm';

    return (
      <div id={id} className={containerClass}>
        <div className={variant === 'card' ? 'p-8 md:p-10' : 'p-8 md:p-10'}>
          <h2 className={variant === 'card' ? 'text-2xl md:text-3xl mb-2' : 'text-3xl md:text-4xl mb-3'}>
            {title}
          </h2>
          <p className={variant === 'card' ? 'text-gray-700 mb-6' : 'text-gray-600 mb-8'}>{subtitle}</p>

          {isSubmitted ? (
            <div className="bg-green-50 border-2 border-green-500 p-8 rounded-sm text-center">
              <CheckCircle2 className="w-14 h-14 mx-auto mb-4 text-green-600" />
              <h3 className="text-2xl mb-2">Thank You!</h3>
              <p className="text-gray-700">Our team will contact you shortly.</p>
            </div>
          ) : (
            <form
              onSubmit={isUsingFormspree ? undefined : handleSubmit}
              action={isUsingFormspree ? formspreeEndpoint : undefined}
              method={isUsingFormspree ? 'POST' : undefined}
              className="space-y-4"
            >
              {isUsingFormspree && (
                <>
                  {/* Redirect back to this page after successful submission */}
                  <input type="hidden" name="_redirect" value={redirectUrl} />
                  <input type="hidden" name="_next" value={redirectUrl} />
                  <input type="hidden" name="source" value="dubaiislandhouse.com" />
                  <input type="hidden" name="timestamp" value={new Date().toISOString()} />
                </>
              )}

              <label className="sr-only" htmlFor={`${id ?? 'lead-form'}-name`}>
                Full Name
              </label>
              <input
                id={`${id ?? 'lead-form'}-name`}
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-5 py-3.5 border border-gray-300 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              />

              <label className="sr-only" htmlFor={`${id ?? 'lead-form'}-email`}>
                Email
              </label>
              <input
                id={`${id ?? 'lead-form'}-email`}
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-5 py-3.5 border border-gray-300 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              />

              <label className="sr-only" htmlFor={`${id ?? 'lead-form'}-whatsapp`}>
                WhatsApp / Phone
              </label>
              <input
                id={`${id ?? 'lead-form'}-whatsapp`}
                type="tel"
                name="whatsapp"
                placeholder="WhatsApp / Phone"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                required
                className="w-full px-5 py-3.5 border border-gray-300 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              />

              <button
                type="submit"
                disabled={!isUsingFormspree && isSubmitting}
                className="w-full bg-[#D4AF37] hover:bg-[#C5A028] text-black px-8 py-4 text-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isUsingFormspree && isSubmitting ? 'Submitting…' : 'Get Full Project Details'}
              </button>

              <p className="text-xs text-gray-600 leading-relaxed">
                Your details are kept private and solely used to share project information.
              </p>
            </form>
          )}
        </div>
      </div>
    );
  };

  // NOTE: Gallery images are local (fast + controllable).
  // The hero image can be local or a remote URL.
  const heroImageSrc =
    'https://image2url.com/r2/default/images/1770879225976-57c5bb4d-65f2-4b11-8f26-5b5d20c1080d.jpg';
  const whatsappMessage =
    'Hi, I’m interested in the Dubai Islands waterfront properties. Please share the full project details, prices, and current availability.';
  const whatsappLink = `https://wa.me/971585574022?text=${encodeURIComponent(whatsappMessage)}`;

  const gallery = [
    {
      src: '/images/dubai-islands/gallery-01-aerial-panorama.png',
      alt: 'Dubai Islands aerial panorama',
      caption: 'Aerial Dubai Islands panorama',
    },
    {
      src: '/images/dubai-islands/gallery-02-marina-waterfront.png',
      alt: 'Marina waterfront at Dubai Islands',
      caption: 'Marina waterfront',
    },
    {
      src: '/images/dubai-islands/gallery-06-amenities.png',
      alt: 'Premium interiors',
      caption: 'Premium interiors',
    },
    {
      src: '/images/dubai-islands/gallery-04-balcony-water-views.png',
      alt: 'Balcony with water views',
      caption: 'Balcony water views',
    },
    {
      src: '/images/dubai-islands/gallery-05-beach-lifestyle.png',
      alt: 'Beach lifestyle',
      caption: 'Beach & leisure lifestyle',
    },
    {
      src: '/images/dubai-islands/gallery-03-premium-interiors.png',
      alt: 'Lifestyle amenities',
      caption: 'Resort-style amenities',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={heroImageSrc}
            alt="Dubai Islands waterfront aerial view"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>

        <div className="relative z-10 w-full px-4 py-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/90 px-4 py-2 text-sm mb-6">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Dubai Islands • Waterfront address • Limited allocation</span>
              </div>

              <h1 className="text-4xl md:text-6xl text-white mb-5 tracking-tight leading-[1.05]">
                Dubai Islands Waterfront Properties —{' '}
                <span className="text-[#D4AF37]">Limited Availability</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
                Premium units in Dubai’s most anticipated coastal address — investment and ownership opportunities
                available.
              </p>


            </div>

            <div className="lg:col-span-5">
              <LeadForm
                id="lead-form"
                variant="card"
                title="Request Full Details"
                subtitle="Get the brochure, pricing, and unit availability." 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl text-center mb-12">
            Why <span className="text-[#D4AF37]">Dubai Islands</span>?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-gray-200 p-6 text-center">
              <Waves className="w-10 h-10 mx-auto mb-4 text-[#D4AF37]" strokeWidth={1.5} />
              <p className="text-gray-900 font-medium">Rare waterfront property</p>
            </div>
            <div className="border border-gray-200 p-6 text-center">
              <TrendingUp className="w-10 h-10 mx-auto mb-4 text-[#D4AF37]" strokeWidth={1.5} />
              <p className="text-gray-900 font-medium">Strong investment demand</p>
            </div>
            <div className="border border-gray-200 p-6 text-center">
              <Building2 className="w-10 h-10 mx-auto mb-4 text-[#D4AF37]" strokeWidth={1.5} />
              <p className="text-gray-900 font-medium">Prime Dubai location</p>
            </div>
            <div className="border border-gray-200 p-6 text-center">
              <CalendarDays className="w-10 h-10 mx-auto mb-4 text-[#D4AF37]" strokeWidth={1.5} />
              <p className="text-gray-900 font-medium">Flexible payment options</p>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunity Overview Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl text-center mb-12">
            Opportunity <span className="text-[#D4AF37]">Overview</span>
          </h2>

          <p className="text-gray-700 text-lg leading-relaxed text-center max-w-3xl mx-auto">
            Dubai Islands offers one of the rarest waterfront real estate opportunities in Dubai, combining modern
            design, future growth potential and lifestyle appeal. Whether you’re securing long-term value or a luxury
            residence, limited units make early access essential.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="border border-gray-200 p-7">
              <h3 className="text-xl font-semibold mb-2">For Investors</h3>
              <p className="text-gray-700">
                High-demand coastal inventory, strong upside potential, and priority allocation for early requests.
              </p>
            </div>
            <div className="border border-gray-200 p-7">
              <h3 className="text-xl font-semibold mb-2">For End-Users</h3>
              <p className="text-gray-700">
                A premium waterfront lifestyle — beach, marina, and modern residences designed for everyday living.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-6 mb-10">
            <h2 className="text-3xl md:text-4xl">
              Dubai Islands <span className="text-[#D4AF37]">Gallery</span>
            </h2>
            <button
              onClick={scrollToForm}
              className="hidden md:inline-flex bg-[#D4AF37] hover:bg-[#C5A028] text-black px-6 py-3 font-semibold transition"
            >
              Get Full Project Details
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((img) => (
              <figure key={img.src} className="bg-white border border-gray-200 overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <figcaption className="p-4 text-sm text-gray-700">{img.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Social Proof */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl text-center mb-12">
            Trust & <span className="text-[#D4AF37]">Social Proof</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 p-7">
              <div className="flex items-center justify-between mb-4">
                <Quote className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
                <div className="flex gap-1" aria-label="5 star rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#D4AF37]" fill="#D4AF37" strokeWidth={1.5} />
                  ))}
                </div>
              </div>
              <p className="text-gray-900 text-lg leading-relaxed mb-4">
                “Professional support and real pricing info — great experience!”
              </p>
              <p className="text-sm text-gray-600">— A.T., UK investor</p>
            </div>
            <div className="border border-gray-200 p-7">
              <div className="flex items-center justify-between mb-4">
                <Quote className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
                <div className="flex gap-1" aria-label="5 star rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#D4AF37]" fill="#D4AF37" strokeWidth={1.5} />
                  ))}
                </div>
              </div>
              <p className="text-gray-900 text-lg leading-relaxed mb-4">
                “Fast response and clear unit availability. Helped us shortlist quickly.”
              </p>
              <p className="text-sm text-gray-600">— M.K., GCC buyer</p>
            </div>
            <div className="border border-gray-200 p-7">
              <div className="flex items-center justify-between mb-4">
                <Quote className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
                <div className="flex gap-1" aria-label="5 star rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#D4AF37]" fill="#D4AF37" strokeWidth={1.5} />
                  ))}
                </div>
              </div>
              <p className="text-gray-900 text-lg leading-relaxed mb-4">
                “Transparent process and helpful guidance from start to finish.”
              </p>
              <p className="text-sm text-gray-600">— S.R., overseas buyer</p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mt-10">
            We share pricing and availability privately after request. No spam.
          </p>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-16 px-4 bg-gray-50 border-t border-b border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl mb-4">
            <span className="text-[#D4AF37]">Limited Waterfront Inventory</span>
          </h2>
          <p className="text-gray-700 text-lg mb-6">
            Units are limited due to strong demand — secure priority access before prices rise.
          </p>
          <button
            onClick={scrollToForm}
            className="bg-[#D4AF37] hover:bg-[#C5A028] text-black px-10 py-4 text-lg font-semibold transition-all duration-300"
          >
            Get Full Project Details
          </button>
        </div>
      </section>

      {/* Bottom Lead Form (repeat) */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-6">
            <h2 className="text-3xl md:text-4xl mb-4">
              Request full details before availability tightens
            </h2>
            <p className="text-gray-700 text-lg mb-6">
              Get the latest brochure, pricing, floor plans, and unit availability. Same-day response where possible.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] mt-1">•</span>
                <span>Updated inventory & payment options</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] mt-1">•</span>
                <span>Best available views (marina / beach / skyline)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] mt-1">•</span>
                <span>Priority allocation for early enquiries</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6">
            <LeadForm
              id="lead-form-bottom"
              variant="plain"
              title="Get Full Project Details"
              subtitle="Your details are kept private and used only to share project information." 
            />
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 px-4 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-800 font-medium">Contact</p>
          <div className="mt-2 space-y-2 text-sm">
            <div>
              <a href="mailto:info@dubaiislandhouse.com" className="text-gray-700 hover:underline">
                info@dubaiislandhouse.com
              </a>
            </div>
            <div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="text-gray-700 hover:underline"
              >
                WhatsApp: Message us for details
              </a>
            </div>
          </div>

          <p className="text-gray-500 text-xs mt-6">© 2026 DubaiIslandHouse.com</p>
        </div>
      </footer>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        aria-label="Contact us on WhatsApp"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        <MessageCircle className="w-5 h-5" />
        WhatsApp
      </a>
    </div>
  );
}
