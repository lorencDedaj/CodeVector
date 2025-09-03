# Welcome to your organization's demo respository

This code repository (or "repo") is designed to demonstrate the best GitHub has to offer with the least amount of noise.

The repo includes an `index.html` file (so it can render a web page), two GitHub Actions workflows, and a CSS stylesheet dependency.

```
*** Added by Lorenc:
This is a basic backend file structure. NOTE it is not final, this is just a means to give us an overview and an idea of how the backend might look like.

AskMyRepo/
├── package.json
├── .env
├── README.md
├── server/
│   ├── index.js                  # Entry point for Express app
│   ├── routes/
│   │   ├── chatRoutes.js         # Route to handle chat with LLM
│   │   ├── embedRoutes.js        # Route to embed codebase
│   │   └── repoRoutes.js         # Route to handle local repo ingestion
│   ├── controllers/
│   │   ├── openaiController.js   # Talk to OpenAI API
│   │   ├── pineconeController.js # Interact with Pinecone
│   │   └── repoController.js     # Read + parse local repo
│   ├── services/
│   │   ├── embeddingService.js   # Handles text embedding
│   │   ├── fileService.js        # Read files, tokenize, etc.
│   │   └── pineconeService.js    # Upsert/query Pinecone
│   ├── utils/
│   │   ├── chunkCode.js          # Chunk large files for embedding
│   │   ├── logger.js             # Logger helper
│   │   └── validate.js           # Input/format validators
└── scripts/
    └── ingestLocalRepo.js        # CLI script to parse & embed repo

```
