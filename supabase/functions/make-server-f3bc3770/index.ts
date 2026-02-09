import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.ts";

const app = new Hono();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey", "x-admin-token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
//
// Note: Depending on the runtime/gateway, the function may receive either:
// - "/health" (expected)
// - "/functions/v1/<function-name>/health" (unrewritten)
//
// To be safe, we register both route forms.
const healthHandler = (c: any) => c.json({ status: "ok" });
app.get("/health", healthHandler);
app.get("/functions/v1/:fn/health", healthHandler);

// Lead submission endpoint
const submitLeadHandler = async (c: any) => {
  try {
    const body = await c.req.json();
    const { name, whatsapp, email, timestamp } = body;

    // Validate required fields
    if (!name || !whatsapp || !email) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    console.log("Received lead submission:", { name, whatsapp, email, timestamp });

    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const submittedAt = timestamp || new Date().toISOString();

    // Store lead in KV store
    try {
      await kv.set(leadId, {
        name,
        whatsapp,
        email,
        timestamp: submittedAt,
        source: "dubaiislandhouse.com",
      });
    } catch (kvError) {
      console.error("KV store error:", kvError);
    }

    // Send email via Resend (optional)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const leadNotificationEmail =
      Deno.env.get("LEAD_NOTIFICATION_EMAIL") || "info@dubaiislandhouse.com";
    const resendFromEmail =
      Deno.env.get("RESEND_FROM_EMAIL") ||
      "Dubai Island House <onboarding@resend.dev>";
    let emailSent = false;
    let emailError: string | null = null;

    if (resendApiKey) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: resendFromEmail,
            to: [leadNotificationEmail],
            subject: "New Lead: Dubai Waterfront Property",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #D4AF37;">New Lead Submission</h2>
                <p style="font-size: 16px;">A new potential buyer has requested details:</p>
                <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0;">
                  <p><strong>Name:</strong> ${name}</p>
                  <p><strong>WhatsApp:</strong> ${whatsapp}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Time:</strong> ${submittedAt}</p>
                </div>
                <p style="color: #666; font-size: 14px;">Source: dubaiislandhouse.com</p>
              </div>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          emailError = errorText || "Resend email failed";
          console.error("Resend email error:", emailError);
        } else {
          console.log("Email sent successfully via Resend");
          emailSent = true;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Error sending email:", message);
        emailError = message;
      }
    } else {
      emailError = "RESEND_API_KEY not configured";
      console.warn(emailError);
    }

    // Add to Google Sheets (optional)
    const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
    const googleSheetId = Deno.env.get("GOOGLE_SHEET_ID");

    if (googleApiKey && googleSheetId) {
      try {
        const sheetsUrl =
          `https://sheets.googleapis.com/v4/spreadsheets/${googleSheetId}/values/Sheet1!A:E:append` +
          `?valueInputOption=USER_ENTERED&key=${googleApiKey}`;

        const sheetsResponse = await fetch(sheetsUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: [
              [
                submittedAt,
                name,
                email,
                whatsapp,
                "dubaiislandhouse.com",
              ],
            ],
          }),
        });

        if (!sheetsResponse.ok) {
          const errorText = await sheetsResponse.text();
          console.error("Google Sheets error:", errorText);
        } else {
          console.log("Lead added to Google Sheets successfully");
        }
      } catch (sheetsError) {
        console.error("Error adding to Google Sheets:", sheetsError);
      }
    } else {
      console.warn("Google Sheets not configured (missing API key or Sheet ID)");
    }

    return c.json({
      success: true,
      message: "Lead submitted successfully",
      leadId,
      emailSent,
      emailError,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error processing lead submission:", message);
    return c.json(
      {
        error: "Failed to process lead submission",
        details: message,
      },
      500,
    );
  }
};

app.post("/submit-lead", submitLeadHandler);
app.post("/functions/v1/:fn/submit-lead", submitLeadHandler);

// Export leads as CSV (Excel-readable)
const exportLeadsHandler = async (c: any) => {
  const requiredToken = Deno.env.get("ADMIN_EXPORT_TOKEN");
  if (!requiredToken) {
    return c.text("Export disabled: ADMIN_EXPORT_TOKEN not configured", 403);
  }

  const authHeader = c.req.header("Authorization") || "";
  const headerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  const adminHeaderToken = (c.req.header("x-admin-token") || "").trim();
  const queryToken = (c.req.query("token") || "").trim();
  const providedToken = adminHeaderToken || queryToken || headerToken;

  if (!providedToken || providedToken !== requiredToken) {
    return c.text("Unauthorized", 401);
  }

  const leads = await kv.getByPrefix("lead_");

  const sorted = [...leads].sort((a, b) => {
    const ta = Date.parse(a?.timestamp ?? "") || 0;
    const tb = Date.parse(b?.timestamp ?? "") || 0;
    return tb - ta;
  });

  const csvEscape = (val: unknown) => {
    const s = val == null ? "" : String(val);
    return `"${s.replaceAll('"', '""')}"`;
  };

  const header = ["submitted_at", "name", "email", "whatsapp", "source"];
  const rows = sorted.map((l) => [
    l?.timestamp ?? "",
    l?.name ?? "",
    l?.email ?? "",
    l?.whatsapp ?? "",
    l?.source ?? "dubaiislandhouse.com",
  ]);

  const csv =
    [
      header.map(csvEscape).join(","),
      ...rows.map((r) => r.map(csvEscape).join(",")),
    ]
      .join("\n") + "\n";

  const date = new Date().toISOString().slice(0, 10);
  c.header("Content-Type", "text/csv; charset=utf-8");
  c.header(
    "Content-Disposition",
    `attachment; filename=leads-${date}.csv`,
  );
  c.header("Cache-Control", "no-store");
  return c.body(csv);
};

app.get("/export-leads.csv", exportLeadsHandler);
app.get("/functions/v1/:fn/export-leads.csv", exportLeadsHandler);

Deno.serve(app.fetch);
