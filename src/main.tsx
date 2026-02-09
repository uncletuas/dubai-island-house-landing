
import { createRoot } from "react-dom/client";
import App from "./app/App";
import AdminExport from "./app/AdminExport";
import PrivacyPolicy from "./app/PrivacyPolicy";
import "./styles/index.css";

const pathname = window.location.pathname;

// Minimal client-side routing (no react-router dependency).
// Vercel is configured to serve index.html for all routes (see vercel.json).
const Page =
  pathname === "/admin/export"
    ? AdminExport
    : pathname === "/privacy-policy"
      ? PrivacyPolicy
      : App;

createRoot(document.getElementById("root")!).render(<Page />);
  