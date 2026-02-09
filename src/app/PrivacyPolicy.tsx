import { useMemo } from 'react';

export default function PrivacyPolicy() {
  const lastUpdated = useMemo(() => {
    // Keep it deterministic for builds; update manually when policy changes.
    return '2026-02-09';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <a href="/" className="text-sm text-gray-600 hover:text-black">
            ← Back to website
          </a>
          <h1 className="text-4xl md:text-5xl mt-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-gray-600 mt-3">
            Last updated: <span className="font-medium">{lastUpdated}</span>
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-gray max-w-none">
          <p>
            This Privacy Policy explains how <strong>DubaiIslandHouse.com</strong>{' '}
            ("we", "us", "our") collects, uses, and protects your information when
            you visit our website and submit the request form.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>Contact details</strong> you provide through the form (for
              example: name, WhatsApp number, email).
            </li>
            <li>
              <strong>Submission metadata</strong> such as the time of submission and
              the page/source.
            </li>
            <li>
              <strong>Basic technical data</strong> your browser may send (e.g. IP
              address, device/browser type) through standard server logs.
            </li>
          </ul>

          <h2>How we use your information</h2>
          <ul>
            <li>To respond to your request and provide the information you asked for.</li>
            <li>To contact you via email or WhatsApp regarding the enquiry.</li>
            <li>To improve our website and user experience.</li>
            <li>To protect our website against spam, abuse, and security threats.</li>
          </ul>

          <h2>Where your data is stored</h2>
          <p>
            Form submissions are stored in our database (hosted on Supabase/PostgreSQL)
            so our team can follow up on your request.
          </p>

          <h2>Sharing and disclosure</h2>
          <p>
            We do not sell your personal information. We may share your information
            only when necessary to:
          </p>
          <ul>
            <li>Deliver requested services (for example, emailing you the requested details).</li>
            <li>Comply with legal obligations or lawful requests.</li>
            <li>Protect our rights, users, and systems (fraud/spam prevention).</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We may use cookies or similar technologies for essential site functionality
            and basic analytics. You can control cookies through your browser settings.
          </p>

          <h2>Data retention</h2>
          <p>
            We keep your information only as long as needed to respond to your request,
            maintain business records, and comply with legal requirements.
          </p>

          <h2>Security</h2>
          <p>
            We use reasonable technical and organizational measures to protect your
            information. However, no method of transmission or storage is 100% secure.
          </p>

          <h2>Your rights</h2>
          <p>
            Depending on your location, you may have rights to request access,
            correction, or deletion of your personal information. To make a request,
            contact us using the details below.
          </p>

          <h2>Contact</h2>
          <p>
            If you have questions about this Privacy Policy or your data, contact us
            at:{' '}
            <a href="mailto:info@dubaiislandhouse.com">info@dubaiislandhouse.com</a>
          </p>

          <hr />
          <p className="text-sm text-gray-500">
            This page is provided for general informational purposes and does not
            constitute legal advice.
          </p>
        </div>
      </main>

      <footer className="py-8 px-4 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600 text-sm">
            © 2026 DubaiIslandHouse.com · Premium Waterfront Living
          </p>
        </div>
      </footer>
    </div>
  );
}
