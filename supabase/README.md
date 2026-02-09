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

### Viewing leads

Supabase Dashboard → **Database** → **Tables** → `kv_store_f3bc3770`.

Each row is:
- `key`: like `lead_...`
- `value`: JSON containing `{ name, whatsapp, email, timestamp, source }`

### Exporting to CSV / Excel

**Option A (recommended): SQL export with columns**

Supabase Dashboard → **SQL Editor** → run:

```sql
select
  value->>'timestamp' as submitted_at,
  value->>'name' as name,
  value->>'email' as email,
  value->>'whatsapp' as whatsapp,
  value->>'source' as source
from kv_store_f3bc3770
where key like 'lead_%'
order by submitted_at desc;
```

Then use the UI to **Download CSV** from the results, and open the CSV in Excel.

**Option B: Table export**

Table editor → `kv_store_f3bc3770` → filter `key` starts with `lead_` → Export → CSV.
This export will include the `value` JSON column (you can still open it in Excel, but Option A is cleaner).

## Deployment (requires Supabase CLI)

1. Install CLI: https://supabase.com/docs/guides/cli
2. Authenticate and link your project:
   - `supabase login`
   - `supabase link --project-ref johlmkidiuxxbsgximdu`
3. Set secrets (in Supabase):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - optional: `RESEND_API_KEY` (email notifications)
   - optional: `LEAD_NOTIFICATION_EMAIL` (defaults to `info@dubaiislandhouse.com`)
   - optional: `RESEND_FROM_EMAIL` (defaults to `Dubai Island House <onboarding@resend.dev>`)
   - optional: `GOOGLE_API_KEY`, `GOOGLE_SHEET_ID` (Google Sheets append)
4. Deploy:
   - `supabase functions deploy make-server-f3bc3770 --no-verify-jwt=false`

## Notes

- The web app should send `Authorization: Bearer <anon key>`.
- Do **not** send an `apikey` header from the browser unless your Edge Function preflight explicitly allows it.
- If you disable JWT verification for the function, the Authorization header is not required.

## Google Sheets (optional)

If you want an "Excel-like" live spreadsheet:

1. Create a Google Sheet (ensure the first tab is named **Sheet1** or update the code).
2. In Google Cloud:
   - Enable **Google Sheets API**.
   - Create an **API key**.
3. In Supabase Dashboard → Edge Functions → Secrets, set:
   - `GOOGLE_API_KEY`
   - `GOOGLE_SHEET_ID`

Then each submission will append a row to the sheet. In Google Sheets you can download:
File → Download → **Microsoft Excel (.xlsx)**.

## Admin download link (recommended)

The Edge Function also exposes a protected CSV export endpoint:

- `GET /functions/v1/make-server-f3bc3770/export-leads.csv?token=...`

To enable it, set this secret in Supabase:

- `ADMIN_EXPORT_TOKEN`

Then you can create a private “special link” to download in Excel:

1. Open your website at: `https://<your-domain>/admin/export?token=<ADMIN_EXPORT_TOKEN>`
2. Click **Download Excel (CSV)**

This downloads a `.csv` file (Excel opens it normally).

Note: If your Edge Function is deployed with JWT verification enabled (common default),
requests must include an `Authorization` header. The `/admin/export` page handles this
automatically (it sends `Authorization: Bearer <SUPABASE_ANON_KEY>`).

If you get a 404 when downloading, it usually means the Edge Function code running on Supabase
has not been redeployed after adding the `/export-leads.csv` route.
