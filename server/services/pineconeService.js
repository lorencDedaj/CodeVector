const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const indexName = process.env.PINECONE_INDEX;
if (!indexName) throw new Error('Missing PINECONE_INDEX name in .env');

const index = pc.index(indexName);

exports.upsertVectors = async (namespace, vectors) => {
  await index.namespace(namespace).upsert(vectors);
};

exports.queryVectors = async (namespace, vector, topK) => {
  const res = await index.namespace(namespace).query({
    vector,
    topK,
    includeMetadata: true,
  });
  return res.matches || [];
};
