const fs = require("fs").promises;
const path = require("path");
const OpenAI = require("openai");
const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Pinecone client once
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

// Middleware: process all code files into vectors using OpenAI embeddings
const processFiles = async (req, res, next) => {
    try {
        const allFiles = res.locals.allFiles || [];

        // Filter only code files (.js, .ts, .jsx, .tsx)
        const codeFiles = allFiles.filter(file =>
            [".js", ".ts", ".jsx", ".tsx"].includes(path.extname(file))
        );

        const vectors = [];
        const embeddings = [];

        // Process each file
        for (const file of codeFiles) {
            const content = await fs.readFile(file, "utf-8");
            console.log("print length:",content.length);
            if (!content.trim()) continue;

            // Generate embeddings using OpenAI
            const embeddingResponse = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: content,
            });
            console.log("call openai get embedding:",embeddingResponse);
            const vector = embeddingResponse.data[0].embedding;

            // Keep local record of vectors
            vectors.push({
                filePath: file,
                embedding: vector,
            });

            // Prepare embeddings for Pinecone
            embeddings.push({
                id: file, // unique identifier
                values: vector,
                metadata: {
                    filePath: file,
                    length: content.length,
                },
            });

        }

        // Check if Pinecone index exists, create if not
        const indexName = 'askmyrepo-ca';
        // const existingIndexesResponse = await pinecone.listIndexes();
        // const existingIndexes = Array.isArray(existingIndexesResponse)
        //     ? existingIndexesResponse
        //     : existingIndexesResponse.indexes || [];

        // if (!existingIndexes.includes(indexName)) {
        //     console.log(`Creating index ${indexName}...`);
        //     await pinecone.createIndex({
        //         name: indexName,
        //         dimension: 1536, // dimension for text-embedding-3-small
        //         metric: "cosine", 
        //         spec: {
        //             serverless: {
        //                 cloud: "aws",      
        //                 region: "us-east1" 
        //             } 
        //         }
        //     });

        //     // Wait until index is ready
        //     let status = 'Creating';
        //     while (status !== 'Ready') {
        //         const description = await pinecone.describeIndex({ indexName });
        //         status = description.status?.ready ? 'Ready' : 'Creating';
        //         if (status !== 'Ready') await new Promise(r => setTimeout(r, 2000));
        //     }
        //     console.log(`Index ${indexName} is ready.`);
        // }

        // Get index handle
        const index = pinecone.index(indexName);

        // Upsert all embeddings at once
        if (embeddings.length > 0) {
            await index.upsert(embeddings);
            console.log(`Upserted ${embeddings.length} embeddings to ${indexName}`);
        }

        // Store vectors in res.locals for downstream middleware
        res.locals.vectors = vectors;
        next();

    } catch (e) {
        console.error("Error processing files: ", e);
        res.status(500).json({ error: "Failed to process files" });
    }
};

module.exports = { processFiles };