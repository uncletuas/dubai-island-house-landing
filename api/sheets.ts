export const config = {
  runtime: "edge",
};

const toCsv = (values: any[][]) => {
  const escape = (v: any) => {
    const s = v == null ? "" : String(v);
    if (/[\n\r,\"]/g.test(s)) return `"${s.replace(/\"/g, '""')}"`;
    return s;
  };
  return values.map((row) => row.map(escape).join(",")).join("\n");
};

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const expectedToken = process.env.DOWNLOAD_TOKEN;
  if (!expectedToken) {
    return new Response("DOWNLOAD_TOKEN env var is not configured on Vercel.", {
      status: 500,
    });
  }

  const providedToken = url.searchParams.get("token") || "";
  if (providedToken !== expectedToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const range = process.env.GOOGLE_SHEET_RANGE || "Sheet1!A:Z";
  if (!apiKey || !sheetId) {
    return new Response("GOOGLE_API_KEY and/or GOOGLE_SHEET_ID not configured.", {
      status: 500,
    });
  }

  const endpoint =
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}` +
    `?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(endpoint);
  if (!res.ok) {
    const text = await res.text();
    return new Response(`Failed to fetch sheet values: ${text}`, { status: 500 });
  }

  const json = (await res.json()) as { values?: any[][] };
  const values = json.values || [];
  const csv = toCsv(values);

  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=google-sheet.csv",
      "cache-control": "no-store",
    },
  });
}
