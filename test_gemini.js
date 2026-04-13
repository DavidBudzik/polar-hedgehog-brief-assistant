import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  console.log("Fetching jina...");
  const fetchRes = await fetch("https://r.jina.ai/https://airbnb.com");
  const websiteText = await fetchRes.text();
  console.log(`Jina returned ${websiteText.length} characters.`);
  
  const prompt = `You are a brand strategist. Based on the content of this website, write a 1–2 sentence Problem Statement describing the core pain point the company solves. Return ONLY the statement, no preamble.`;
  
  const finalPrompt = `Here is the scraped markdown content of the website:\n\n<website_content>\n${websiteText.slice(0, 50000)}\n</website_content>\n\nBased on the website content above, please follow this instruction:\n${prompt}`;
  
  console.log("Calling Gemini...");
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
    });
    console.log("Response text:", res.text);
  } catch (err) {
    console.error("Error from Gemini:", err);
  }
}
test();
