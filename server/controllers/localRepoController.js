// Minimal "make it work" controller
const path = require('path');
const os = require('os');
const fs = require('fs/promises');
const multer = require('multer');
const extract = require('extract-zip');
const fg = require('fast-glob');

const upload = multer({ dest: os.tmpdir() }).single('repoZip');

// chunker
const CHUNK = 1800;
const OVERLAP = 200;
const chunkText = (s) => {
  const out = [];
  for (let i = 0; i < s.length; i += CHUNK - OVERLAP)
    out.push(s.slice(i, i + CHUNK));
  return out;
};

// POST /api/repo/upload-local  (field: repoZip)
exports.uploadLocalRepo = (req, res, next) => {
  upload(req, res, async (err) => {
    try {
      if (err) throw err;
      if (!req.file?.path)
        return res
          .status(400)
          .json({ error: 'Send a .zip file in field "repoZip"' });

      // workspace
      const workspace = path.join(os.tmpdir(), `repo_ws_${Date.now()}`);
      await fs.mkdir(workspace, { recursive: true });

      // extract uploaded zip to workspace
      await extract(req.file.path, { dir: workspace });

      // find files (keep it simple; skip node_modules/.git)
      const files = await fg(['**/*.*'], {
        cwd: workspace,
        onlyFiles: true,
        ignore: ['**/node_modules/**', '**/.git/**'],
      });

      // keep a small set of text/code extensions
      const codeExt = /\.(js|ts|tsx|jsx|json|md|yml|yaml|sql|sh|html|css)$/i;
      const codeFiles = files.filter((p) => codeExt.test(p));

      // read + chunk
      let chunkCount = 0;
      for (const rel of codeFiles) {
        const full = path.join(workspace, rel);
        let text = '';
        try {
          text = await fs.readFile(full, 'utf8');
        } catch {
          /* skip unreadable */
        }
        if (!text) continue;
        chunkCount += chunkText(text).length;
      }

      // cleanup the uploaded zip (keep workspace for debugging if you want)
      try {
        await fs.unlink(req.file.path);
      } catch {}

      return res.status(202).json({
        message: 'OK',
        fileCount: codeFiles.length,
        chunkCount,
      });
    } catch (e) {
      next(e);
    }
  });
};
