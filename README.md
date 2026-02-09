
  # Minimalist Landing Page Design

  This is a code bundle for Minimalist Landing Page Design. The original project is available at https://www.figma.com/design/fYKu1RBVTKCOFlF9mL56Vg/Minimalist-Landing-Page-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Supabase (Edge Function)

  The lead capture form posts to a Supabase Edge Function (`make-server-f3bc3770`).
  See `supabase/README.md` for details.

  ## Formspree (simple submissions inbox)

  If you want to receive submissions inside Formspree (and get email notifications),
  create a form on https://formspree.io and copy your endpoint URL.

  Then set the Vercel (or local) environment variable:

  - `VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/<yourFormId>`

  When `VITE_FORMSPREE_ENDPOINT` is set, the website form will submit directly
  to Formspree and redirect back to the landing page showing the “Thank You”
  message.

  ## Admin lead export (download as Excel)

  Visit:
  - `/admin/export`

  You must set the Supabase Edge Function secret `ADMIN_EXPORT_TOKEN`.
  Then you can use a “special link” like:
  - `/admin/export?token=YOUR_TOKEN`

  The download button will fetch:
  - `.../functions/v1/make-server-f3bc3770/export-leads.csv`

  If you tried to open the CSV URL directly and saw:
  - `{ "code": 401, "message": "Missing authorization header" }`

  That’s expected when the Supabase Function requires an Authorization header.
  Use the `/admin/export` page download button (it includes the header automatically).

  ## Google Sheets

  The Supabase Edge Function can append leads to a Google Sheet (recommended via a Google Service Account).
  See `supabase/README.md`.

  