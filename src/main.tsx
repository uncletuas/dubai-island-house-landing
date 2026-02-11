
import { createRoot } from "react-dom/client";
import App from "./app/App";
import AdminExport from "./app/AdminExport";
import PrivacyPolicy from "./app/PrivacyPolicy";
import "./styles/index.css";

const pathname = window.location.pathname;

// Basic SEO for SPA routes (Google executes JS, so this helps indexing).
// NOTE: index.html remains the baseline for non-JS crawlers.
const setMeta = (opts: {
  title: string;
  description?: string;
  canonical?: string;
  robots?: string;
}) => {
  document.title = opts.title;

  if (opts.description) {
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute('content', opts.description);
  }

  if (opts.robots) {
    const el = document.querySelector('meta[name="robots"]');
    if (el) el.setAttribute('content', opts.robots);
  }

  if (opts.canonical) {
    const el = document.querySelector('link[rel="canonical"]');
    if (el) el.setAttribute('href', opts.canonical);
  }
};

if (pathname === "/privacy-policy") {
  setMeta({
    title: "Privacy Policy | Dubai Island House",
    description:
      "Read how Dubai Island House collects, uses, and protects your information when you request property details.",
    canonical: "https://dubaiislandhouse.com/privacy-policy",
    robots: "index,follow",
  });
} else if (pathname === "/admin/export") {
  // Admin-only page: do not index
  setMeta({
    title: "Admin Export | Dubai Island House",
    canonical: "https://dubaiislandhouse.com/admin/export",
    robots: "noindex,nofollow",
  });
} else {
  setMeta({
    title: "Dubai Islands Waterfront Properties — Limited Availability",
    description:
      "Premium units in Dubai’s most anticipated coastal address — investment and ownership opportunities available. Request full project details.",
    canonical: "https://dubaiislandhouse.com/",
    robots: "index,follow",
  });
}

// Minimal client-side routing (no react-router dependency).
// Vercel is configured to serve index.html for all routes (see vercel.json).
const Page =
  pathname === "/admin/export"
    ? AdminExport
    : pathname === "/privacy-policy"
      ? PrivacyPolicy
      : App;

createRoot(document.getElementById("root")!).render(<Page />);
  