require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'mitigation-ai-server' });
});

app.post('/api/generate-summary', async (req, res) => {
  try {
    const job = req.body.job || {};
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
You are a mitigation supervisor with 15+ years of field experience.
You understand IICRC standards and insurance carrier expectations.
Write a professional, insurer-ready summary based on this structured job data:
${JSON.stringify(job, null, 2)}
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You write AI summaries as a seasoned mitigation supervisor for insurance carriers." },
        { role: "user", content: prompt }
      ],
    });
    res.json({ summary: response.choices?.[0]?.message?.content || "No AI response." });
  } catch (error) {
    res.status(500).json({ error: "AI summary failed." });
  }
});

app.post('/api/analyze-psychrometrics', async (req, res) => {
  try {
    const readings = req.body.readings || [];
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Analyze these psychrometric readings as a senior mitigation supervisor:
${JSON.stringify(readings, null, 2)}
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    res.json({ analysis: response.choices?.[0]?.message?.content || "No AI response." });
  } catch (error) {
    res.status(500).json({ error: "AI analysis failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Mitigation AI server running on port ${PORT}`);
});
