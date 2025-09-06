const fs = require("fs").promises;
const path = require("path");
const OpenAI = require("openai");
require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

const askPinecone = async (req, res, next) => {
    const {qEmbedding} = res.locals;
    if (!qEmbedding){
        const error ={
            log: "Question didn't convert to embedding!",
            status: 500,
            message: {err: 'An error occurred before querying the database!'},
        };
        return next(error);
    }
    const pc = new Pinecone({ apiKey:process.env.PINECONE_API_KEY});
    const index = pc.index(process.env.PINECONE_INDEX)
    const result = await index.query({
        topK: 5,
        vector:qEmbedding,
        includeMetadata:true,
    });
    const allText = result.matches
        .map(match => match.metadata?.text ?? "") // 提取 metadata.text，如果不存在则用空字符串
        .filter(text => text.length > 0)          // 去掉空的
        .join("\n\n");                            // 用换行拼接

    res.locals.context = allText;
    next();
}
module.exports = { askPinecone };