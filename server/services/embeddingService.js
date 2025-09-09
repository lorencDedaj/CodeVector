const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBED_MODEL = 'text-embedding-3-small';

exports.embedBatch = async (texts) => {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  const res = await client.embeddings.create({
    model: EMBED_MODEL,
    input: texts,
  });
  return res.data.map((d) => d.embedding);
};

// exports.answerWithContext = async (question, context) => {
//   const messages = [
//     {
//       role: 'system',
//       content:
//         'You are a careful code assistant. Answer ONLY using the provided context. If the context is insufficient, say so briefly. Include a short "Sources:" list referencing file paths.',
//     },
//     {
//       role: 'user',
//       content: `Question:\n${question}\n\nContext:\n${context}`,
//     },
//   ];
//   const resp = await client.chat.completions.create({
//     model: 'gpt-4o-mini',
//     messages,
//     temperature: 0.2,
//   });
//   return resp.choices?.[0]?.message?.content || '';
// };

//JOB ID "09b2ade3-aa7c-4e49-84e3-f1bb01ff78ec"

// PARAMETERS HERE
