# Supabase backend (Edge Function)

This repo includes the Supabase Edge Function source used by the landing page form.

## Function name

The deployed function is expected to be named:

`make-server-f3bc3770`

Public endpoints (under your Supabase project):

- `GET /functions/v1/make-server-f3bc3770/health`
- `POST /functions/v1/make-server-f3bc3770/submit-lead`

## Database

Leads are stored in the Postgres table:

`kv_store_f3bc3770`

as JSON values with keys like `lead_...`.

## Deployment (requires Supabase CLI)

1. Install CLI: https://supabase.com/docs/guides/cli
2. Authenticate and link your project:
   - `supabase login`
   - `supabase link --project-ref johlmkidiuxxbsgximdu`
3. Set secrets (in Supabase):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - optional: `RESEND_API_KEY` (email notifications)
   - optional: `GOOGLE_API_KEY`, `GOOGLE_SHEET_ID` (Google Sheets append)
4. Deploy:
   - `supabase functions deploy make-server-f3bc3770 --no-verify-jwt=false`

## Notes

- The web app sends the request with `Authorization: Bearer <anon key>` and `apikey: <anon key>`.
- If you disable JWT verification for the function, the Authorization header is not required.
