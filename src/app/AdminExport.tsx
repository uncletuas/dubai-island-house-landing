import { useMemo, useState } from 'react';
import {
  leadExportUrl,
  leadHealthUrl,
  supabaseAnonKey,
} from '../lib/supabaseEnv';

/**
 * Minimal admin-only export page.
 *
 * Usage:
 *   /admin/export?token=YOUR_ADMIN_EXPORT_TOKEN
 *
 * This token must match the `ADMIN_EXPORT_TOKEN` secret set on the Supabase Edge Function.
 */
export default function AdminExport() {
  // Reduce chance of accidental indexing if someone links it.
  // (Routing also sets meta robots to noindex in main.tsx)
  const initialToken = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('token') || '';
    } catch {
      return '';
    }
  }, []);

  const [token, setToken] = useState(initialToken);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<string | null>(null);

  const exportUrl = useMemo(() => {
    const url = new URL(leadExportUrl);
    if (token) url.searchParams.set('token', token);
    return url.toString();
  }, [token]);

  const download = async () => {
    setError(null);
    setIsDownloading(true);
    try {
      // IMPORTANT:
      // Supabase Edge Functions typically require an Authorization header even for public/anon access.
      // Without this, Supabase returns: {"code":401,"message":"Missing authorization header"}
      const res = await fetch(exportUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(
          `${text || 'Request failed'}\n\nStatus: ${res.status}\nURL: ${exportUrl}`,
        );
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename=([^;]+)/i);
      const filename = match
        ? match[1].replaceAll('"', '').trim()
        : 'leads.csv';

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
    } finally {
      setIsDownloading(false);
    }
  };

  const checkHealth = async () => {
    setHealth('Checking…');
    try {
      const res = await fetch(leadHealthUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });
      const text = await res.text().catch(() => '');
      setHealth(`Status ${res.status}: ${text || '(no body)'}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setHealth(`Error: ${message}`);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Lead submissions export</h1>
        <p className="text-gray-600 mb-6">
          Enter your admin export token, then click Download.
        </p>

        <div className="space-y-3">
          <label className="block text-sm text-gray-700">Admin token</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste ADMIN_EXPORT_TOKEN"
            className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none"
          />

          <button
            type="button"
            onClick={download}
            disabled={isDownloading || !token}
            className="inline-flex items-center justify-center w-full bg-black text-white px-6 py-3 font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? 'Preparing download…' : 'Download Excel (CSV)'}
          </button>

          <button
            type="button"
            onClick={checkHealth}
            className="inline-flex items-center justify-center w-full border border-gray-300 px-6 py-3 font-medium hover:bg-gray-50"
          >
            Check backend health
          </button>

          {health ? (
            <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words bg-gray-50 border border-gray-200 p-3">
              {health}
            </pre>
          ) : null}

          {error ? (
            <pre className="text-xs text-red-600 whitespace-pre-wrap break-words bg-red-50 border border-red-200 p-3">
              {error}
            </pre>
          ) : null}

          <details className="text-xs text-gray-600">
            <summary className="cursor-pointer select-none">Show export URL</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words bg-gray-50 border border-gray-200 p-3">
              {exportUrl}
            </pre>
          </details>

          <p className="text-xs text-gray-500">
            This downloads a <code>.csv</code> file that opens in Excel.
          </p>
        </div>
      </div>
    </div>
  );
}
