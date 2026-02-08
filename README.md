
  # Minimalist Landing Page Design

  This is a code bundle for Minimalist Landing Page Design. The original project is available at https://www.figma.com/design/fYKu1RBVTKCOFlF9mL56Vg/Minimalist-Landing-Page-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Supabase (Edge Function)

  The lead capture form posts to a Supabase Edge Function (`make-server-f3bc3770`).
  See `supabase/README.md` for details.

  ## Downloads / Exports

  When deployed to Vercel, this repo provides Edge API endpoints:

  - `GET /api/leads?token=...` → downloads leads from Supabase (`kv_store_f3bc3770`) as CSV
  - `GET /api/sheets?token=...` → downloads a Google Sheet as CSV (requires `GOOGLE_*` env vars)

  