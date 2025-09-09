const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RAG_MODEL = process.env.RAG_MODEL || 'gpt-4o-mini';
const RAG_TEMPERATURE = Number(process.env.RAG_TEMPERATURE ?? 0.2);

exports.answerWithContext = async (
  question,
  context,
  { style = 'concise' } = {}
) => {
  // const system = [
  //   'You are a careful code assistant.',
  //   'Answer ONLY using the provided Context.',
  //   'If the Context is insufficient, say so briefly.',
  //   'Cite Sources at the end as file paths with chunk indices.',
  //   style === 'verbose'
  //     ? 'Provide fuller explanations when helpful.'
  //     : 'Keep answers concise.',
  // ].join(' ');

  const system = [
    'You are a careful code assistant answering questions about a specific repository.',
    '',
    'Grounding & sources',
    '- Answer ONLY using the provided Context. Do not rely on outside knowledge.',
    '- If the Context is insufficient or ambiguous, say so briefly and stop.',
    '- Always include a short "Sources:" list of file paths with chunk indices (e.g., src/app.ts (chunk 1)).',
    '- Prefer citing source files over lockfiles or generated artifacts. Avoid citing:',
    '  - package-lock.json, yarn.lock, pnpm-lock.yaml',
    '  - build/, dist/, node_modules/, .git/, *.map',
    '  unless the user explicitly asks about dependencies or build output.',
    '',
    'Style & structure',
    '- Be concise and direct. Use plain English.',
    '- When showing code, use fenced code blocks with the correct language (```ts, ```js, ```py, etc.).',
    '- Do NOT reveal chain-of-thought. Provide conclusions and brief evidence only.',
    '- If multiple files disagree, call that out and pick the best-supported interpretation from the Context.',
    '',
    'Safety & correctness',
    '- Do not invent APIs, file paths, or line numbers that are not present in the Context.',
    '- If an instruction would be unsafe or destructive, warn the user and propose a safer alternative.',
    '- If secrets or credentials appear in Context, do not print them verbatim; redact sensitive values (e.g., •••).',
    '',
    'Formatting',
    '- Final output MUST end with:',
    '  Sources:',
    '  - <path> (chunk N)',
    '  - <path> (chunk M)',
    '',
    style === 'verbose'
      ? 'Answer length: provide fuller explanations when helpful.'
      : 'Answer length: keep answers concise.',
  ].join('\n');

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: `Question:\n${question}\n\nContext:\n${context}` },
  ];

  const resp = await client.chat.completions.create({
    model: RAG_MODEL,
    temperature: RAG_TEMPERATURE,
    messages,
  });

  return resp?.choices?.[0]?.message?.content || '';
};
