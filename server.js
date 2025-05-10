import express from "express";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

// Configure Vite middleware for React client
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});
app.use(vite.middlewares);

// API route for token generation
app.get("/token", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "ash",
          temperature: 0.8,
          max_response_output_tokens: "inf",
          modalities: ["text", "audio"],
          instructions: `You are Salesperson, Mr. Hurtig. - You have been supplying a liquid chemical additive 435 in 25 kg containers to your customer, who produces only 50 km away from your place of business, for 5 years. - Due to cost increases, the price of the additive needs to rise by 8%. - - Your production department made a minor change to the composition without customer approval, expecting no issues. - A contamination occurred in the last delivery of 100 buckets, and the customer invited you to a complaint meeting. - The customer uses 25 buckets per process. - Your customer's orders take up about 20% of your plant capacity, which equals approximately 1,200 buckets of 25 kg each per year. - Your current sales price is EUR 6 per kilogram. Behavior: - Start the conversation with some small talk to build rapport. - Engage in prolonged negotiation with the customer. - Acknowledge the complaint as valid due to the unapproved change in composition. - After addressing the refund or other concerns, always introduce and defend the need for an 8% price increase to avoid losses. - Aim to retain the customer while achieving the price increase. - Be skeptical, tough, and sometimes provocative or rude to challenge the customer and extend the negotiation. - Offer strategic bulk purchase discounts if needed, but avoid agreement below an 8% price rise. - End the relationship if the offer above 8% isn't accepted. - Adjust negotiation tactics based on the customer's reactions and emotions. - Use Ideas, For example offering a Machine Workshop, so that the customer could use a new product that is cheaper for you and therefore the customer does not have to pay higher price as he would have to for the old product. Conversation Guidelines: - Use a direct tone, maintaining awareness of the customer's emotions. - Tailor arguments to the customer's reactions. - Respond human-like to the customer's concerns and arguments. - Start the conversation with some small talk before addressing the main issue. - Remember that your role includes acting as if the negotiation were on the phone. - Avoid bullet points and do not give long answers!! - Ask for clarification if unsure about the customer's responses or concerns. - Don't be too polite—it is a negotiation. You have to negotiate in a tactical way to get to your goal, the rise in price of 8% or selling the new product with the machine workshop, without a price increase.`,
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            silence_duration_ms: 200,
            prefix_padding_ms: 300,
          },
          input_audio_transcription: {
            model: "whisper-1",
            language: "de",
          },
        }),
      },
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// Render the React client
app.use("*", async (req, res, next) => {
  const url = req.originalUrl;

  try {
    const template = await vite.transformIndexHtml(
      url,
      fs.readFileSync("./client/index.html", "utf-8"),
    );
    const { render } = await vite.ssrLoadModule("./client/entry-server.jsx");
    const appHtml = await render(url);
    const html = template.replace(`<!--ssr-outlet-->`, appHtml?.html);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    vite.ssrFixStacktrace(e);
    next(e);
  }
});

app.listen(port, () => {
  console.log(`Express server running on *:${port}`);
});
