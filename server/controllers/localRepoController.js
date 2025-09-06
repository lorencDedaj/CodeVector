const path = require('path');
const os = require('os');
const fs = require('fs/promises');
const multer = require('multer');
const extract = require('extract-zip');
const fg = require('fast-glob');
const crypto = require('crypto');
const {
  embedBatch,
  answerWithContext,
} = require('../services/embeddingService');
const { upsertVectors, queryVectors } = require('../services/pineconeService');

const upload = multer({ dest: os.tmpdir() }).single('repoZip');

// simple chunker with an overlap to prevent cutting a function
const CHUNK = 1800;
const OVERLAP = 200;
const chunkText = (s) => {
  const out = [];
  for (let i = 0; i < s.length; i += CHUNK - OVERLAP)
    out.push(s.slice(i, i + CHUNK));
  return out;
};
// console.log(`chunkText..${chunkText}`);

const codeExt = /\.(js|ts|tsx|jsx|json|md|yml|yaml|sql|sh|html|css|scss|xml)$/i;
const IGNORE = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
];

exports.uploadLocalRepo = (req, res, next) => {
  upload(req, res, async (err) => {
    try {
      if (err) throw err;
      if (!req.file?.path)
        return res
          .status(400)
          .json({ error: 'Send a .zip file in field "repoZip"' });

      const jobId = crypto.randomUUID();
      // Console log to see data
      console.log(`jobId..${jobId}`);

      // 1) Extract
      const workspace = path.join(os.tmpdir(), `repo_ws_${Date.now()}`);
      console.log(`workspace..${workspace}`);

      await fs.mkdir(workspace, { recursive: true });
      await extract(req.file.path, { dir: workspace });

      // 2) Discover files
      const files = await fg(['**/*.*'], {
        cwd: workspace,
        onlyFiles: true,
        ignore: IGNORE,
      });
      console.log(`files..${files}`);

      const codeFiles = files.filter((p) => codeExt.test(p));

      console.log(`codeFiles..${codeFiles}`);

      // 3) Read + chunk
      const chunks = [];
      for (const rel of codeFiles) {
        const full = path.join(workspace, rel);
        let text = '';
        try {
          text = await fs.readFile(full, 'utf8');
        } catch {}
        if (!text) continue;
        const parts = chunkText(text);
        parts.forEach((t, idx) => chunks.push({ path: rel, idx, text: t }));
      }

      // 4) Embed + upsert (small batches)
      let upserted = 0;
      const BATCH = 64; // keep it small and simple
      for (let i = 0; i < chunks.length; i += BATCH) {
        const slice = chunks.slice(i, i + BATCH);
        const vectors = await embedBatch(slice.map((c) => c.text));
        const payload = vectors.map((values, k) => ({
          id: `${jobId}:${i + k}`,
          values,
          metadata: {
            path: slice[k].path,
            idx: slice[k].idx,
            text: slice[k].text,
          },
        }));
        await upsertVectors(jobId, payload);
        upserted += payload.length;
      }

      // cleanup uploaded zip
      try {
        await fs.unlink(req.file.path);
      } catch {}

      return res.status(200).json({
        message: 'Embedded & upserted',
        jobId,
        fileCount: codeFiles.length,
        chunkCount: chunks.length,
        upserted,
      });
    } catch (e) {
      next(e);
    }
  });
};

// POST /api/repo/query  { jobId, question, topK? }
exports.queryRepo = async (req, res, next) => {
  try {
    const { jobId, question, topK = 5 } = req.body || {};
    if (!jobId || !question) {
      return res
        .status(400)
        .json({ error: 'Missing "jobId" or "question" in body' });
    }

    // 1) Embed the question
    const [qVec] = await embedBatch([question]);

    // 2) Pinecone search
    const matches = await queryVectors(jobId, qVec, Number(topK) || 5);

    // 3) Build context string
    const context = matches
      .map((m) => {
        const meta = m.metadata || {};
        const header = `File: ${meta.path} (chunk ${
          meta.idx
        }) [score ${m.score?.toFixed(3)}]`;
        return `${header}\n${meta.text || ''}`;
      })
      .join('\n\n---\n\n');

    // 4) Ask the LLM using the retrieved context
    const answer = await answerWithContext(question, context);

    // 5) Return answer + sources
    const sources = matches.map((m) => ({
      path: m.metadata?.path,
      idx: m.metadata?.idx,
      score: m.score,
    }));

    return res.status(200).json({ answer, sources });
  } catch (e) {
    next(e);
  }
};
