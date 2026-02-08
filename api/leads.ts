export const config = {
  runtime: "edge",
};

const jsonToCsv = (rows: Record<string, any>[]) => {
  const header = ["key", "timestamp", "name", "email", "whatsapp", "source"];
  const escape = (v: any) => {
    const s = v == null ? "" : String(v);
    // Escape quotes and wrap in quotes if needed
    if (/[\n\r,\"]/g.test(s)) return `"${s.replace(/\"/g, '""')}"`;
    return s;
  };

  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(header.map((k) => escape(r[k])).join(","));
  }
  return lines.join("\n");
};

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const expectedToken = process.env.DOWNLOAD_TOKEN;
  if (!expectedToken) {
    return new Response(
      "DOWNLOAD_TOKEN env var is not configured on Vercel.",
      { status: 500 },
    );
  }

  const providedToken = url.searchParams.get("token") || "";
  if (providedToken !== expectedToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return new Response(
      "SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY not configured on Vercel.",
      { status: 500 },
    );
  }

  // Fetch leads stored in Supabase KV table
  const endpoint =
    `${supabaseUrl}/rest/v1/kv_store_f3bc3770` +
    `?select=key,value` +
    `&key=like.lead_%25` +
    `&order=key.desc`;

  const res = await fetch(endpoint, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(`Failed to fetch leads: ${text}`, { status: 500 });
  }

  const data = (await res.json()) as { key: string; value: any }[];
  const rows = data.map((r) => ({
    key: r.key,
    timestamp: r.value?.timestamp,
    name: r.value?.name,
    email: r.value?.email,
    whatsapp: r.value?.whatsapp,
    source: r.value?.source,
  }));

  const csv = jsonToCsv(rows);
  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=leads.csv",
      "cache-control": "no-store",
    },
  });
}
