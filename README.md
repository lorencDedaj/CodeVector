# CodeVector

CodeVector is a full-stack app for asking questions about a codebase using RAG (retrieval augmented generation).
You can either upload a local `.zip` repo or import a GitHub repo URL, then chat with the app about the code.

## Features

- Upload a local repository as a `.zip`
- Import a repository from a GitHub URL
- Chunk and embed source files with OpenAI embeddings
- Store vectors in Pinecone (namespaced by job ID)
- Ask questions and get grounded answers from retrieved code context
- Save query history to Supabase (for uploaded zip jobs)

## Tech Stack

- Frontend: React 19, TypeScript, Vite, React Router
- Backend: Node.js, Express
- AI: OpenAI (`text-embedding-3-small`, `gpt-4o-mini` by default)
- Vector DB: Pinecone
- Data logging: Supabase

## Repo Structure

```text
CodeVector/
├── client/                # React + Vite frontend
├── server/                # Express API + RAG pipeline
├── README.md
├── package.json           # Placeholder/demo package file (root)
└── index.html             # Legacy/demo file at repo root
```

## How It Works

1. A repo is uploaded as `.zip` (`/api/repo/upload-local`) or cloned/imported from GitHub (frontend supports this flow).
2. Server extracts and scans files (skipping `node_modules`, `.git`, `dist`, `build`).
3. Files are chunked and embedded with OpenAI.
4. Embeddings are upserted to Pinecone under a namespace (`jobId`).
5. User asks a question (`/api/repo/query`).
6. Relevant chunks are retrieved from Pinecone and passed to the LLM to generate an answer.

## Getting Started

### Prerequisites

- Node.js 18+ (reccomended)
- npm
- OpenAI API key
- Pinecone index/API key
- Supabase project (optional in concept, but current server code expects env vars for logging)

### 1. Install dependancies

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd client
npm install
```

### 2. Configure enviroment variables (server)

Create `server/.env` with values similar to:

```env
PORT=3001
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=your_index_name
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# Optional model tuning
RAG_MODEL=gpt-4o-mini
RAG_TEMPERATURE=0.2
```

Notes:

- `PINECONE_INDEX` is required at startup.
- Current `supabaseService` initializes immediately, so missing Supabase vars may cause runtime issues.

### 3. Run the app

Backend (from `server/`):

```bash
npm run dev
```

Frontend (from `client/`):

```bash
npm run dev
```

Default local endpoints:

- Frontend: Vite dev server (usually `http://localhost:5173`)
- Backend: `http://localhost:3001`

## Main Routes

### Frontend routes

- `/` -> Upload page
- `/chat/:projectId` -> Chat for uploaded zip job
- `/chat/repo/:repoName` -> Chat for imported/cloned repo flow

### Backend routes

Mounted under `/api/repo`:

- `POST /upload-local` -> upload `.zip` file (`repoZip` form field)
- `POST /query` -> ask a question about a previously indexed job
- `GET /history/job/:jobId` -> fetch query history for a job

## Example API Usage

Upload a zip:

```bash
curl -X POST http://localhost:3001/api/repo/upload-local \
  -F "repoZip=@/path/to/repo.zip"
```

Query a job:

```bash
curl -X POST http://localhost:3001/api/repo/query \
  -H "Content-Type: application/json" \
  -d '{"jobId":"YOUR_JOB_ID","question":"What does the upload route do?","topK":5}'
```

## Current Notes / Gaps

- Root `package.json` is mostly demo/placeholder metadata and not the main app runner.
- Some legacy files and alternate routes/controllers exist in `server/` and are not all actively wired.
- The frontend GitHub import flow posts to a `/repo` endpoint and chat fallback uses `/ask`; depending on your backend wiring, you may need to align these endpoints.

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes
4. Test locally
5. Open a pull request

## License

No explicit project license is defined for the main app folders yet (the root `package.json` lists `MIT`, but verify before publishing).
