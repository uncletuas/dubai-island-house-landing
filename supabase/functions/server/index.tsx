import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-f3bc3770/health", (c) => {
  return c.json({ status: "ok" });
});

// Lead submission endpoint
app.post("/make-server-f3bc3770/submit-lead", async (c) => {
  try {
    const body = await c.req.json();
    const { name, whatsapp, email, timestamp } = body;

    // Validate required fields
    if (!name || !whatsapp || !email) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    console.log("Received lead submission:", { name, whatsapp, email, timestamp });

    // Store lead in KV store
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(leadId, {
      name,
      whatsapp,
      email,
      timestamp: timestamp || new Date().toISOString(),
      source: "dubaiislandhouse.com",
    });

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Dubai Island House <onboarding@resend.dev>",
            to: ["services.opaltech@gmail.com"],
            subject: "🏡 New Lead: Dubai Waterfront Property",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #D4AF37;">New Lead Submission</h2>
                <p style="font-size: 16px;">A new potential buyer has requested details:</p>
                <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0;">
                  <p><strong>Name:</strong> ${name}</p>
                  <p><strong>WhatsApp:</strong> ${whatsapp}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Time:</strong> ${timestamp || new Date().toISOString()}</p>
                </div>
                <p style="color: #666; font-size: 14px;">Source: dubaiislandhouse.com</p>
              </div>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error("Resend email error:", errorText);
        } else {
          console.log("Email sent successfully via Resend");
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    } else {
      console.warn("RESEND_API_KEY not configured");
    }

    // Add to Google Sheets
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
                timestamp || new Date().toISOString(),
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
    });
  } catch (error) {
    console.error("Error processing lead submission:", error);
    return c.json(
      {
        error: "Failed to process lead submission",
        details: error.message,
      },
      500,
    );
  }
});

Deno.serve(app.fetch);
