import Groq from 'groq-sdk';

const MODEL = 'openai/gpt-oss-20b';

export const ensureGroq = () => {
  if (!process.env.GROQ_API_KEY) {
    const error = new Error('GROQ_API_KEY is not configured');
    error.status = 503;
    throw error;
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

export const askGroq = async (prompt, { json = false } = {}) => {
  const client = ensureGroq();
  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: json ? 0.1 : 0.3,
    messages: [
      {
        role: 'system',
        content: json
          ? 'Return only valid JSON. Do not include markdown or HTML.'
          : 'You are a concise project assistant. Output GitHub-flavored markdown only. Never use HTML tags. Avoid markdown tables unless absolutely necessary. Prefer headings, bullets, and short code blocks. Keep responses professional and readable in dark mode.',
      },
      { role: 'user', content: prompt },
    ],
  });
  return completion.choices?.[0]?.message?.content?.trim() || '';
};

export const parseJsonResponse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) return JSON.parse(match[1]);
    throw new Error('AI response was not valid JSON');
  }
};
