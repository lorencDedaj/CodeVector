require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function main() {
  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = client.Index(process.env.PINECONE_INDEX);

  // 1. 查看索引统计信息
  const stats = await index.describeIndexStats();
  console.log("=== Index Stats ===");
  console.log(stats);

  // 2. 根据 ID 取出数据（示例：换成你实际的 ID）
  try {
    const record = await index.fetch(["your-vector-id"]);
    console.log("=== Fetch Record ===");
    console.log(JSON.stringify(record, null, 2));
  } catch (err) {
    console.log("Fetch error:", err.message);
  }

  // 3. 随机 query 一个向量（假设你知道维度 1536）
  try {
    const queryResponse = await index.query({
      vector: Array(1536).fill(0.01), // 示例：全 0.01 的向量
      topK: 3,
      includeValues: true,
      includeMetadata: true,
    });
    console.log("=== Query Response ===");
    console.log(JSON.stringify(queryResponse, null, 2));
  } catch (err) {
    console.log("Query error:", err.message);
  }
}

main();
