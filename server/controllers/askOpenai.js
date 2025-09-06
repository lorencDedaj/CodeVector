const fs = require("fs").promises;
const path = require("path");
const OpenAI = require("openai");
require('dotenv').config();

const openai = new OpenAI({
    apikey: process.env.OPENAI_API_KEY,
});

const askEmbedding = async (req, res, next) =>{
    const {question} = req.body;
    if (!question){
        return res.status(400).json({error:"Question is required!"});
    }
        // Generate embeddings using OpenAI
    const embeddingQuestion = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: question,
    });
    res.locals.qEmbedding = embeddingQuestion.data[0].embedding;
    return next();
}

const askQuestion = async (req, res, next) =>{
    const {question} = req.body;
    const {context} = res.locals;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages:[
            {role:'system', content: 'Please answer the ${question} based on the ${context}, and put it in simple way.'},
            {role:'user', content: question+context},
        ],
        temperature: 0.5,
    });
    const text = completion.choices[0].message.content;
    console.log(text);
    // res.locals.result = text;
    console.log(text);
    res.locals.result = text;
    return next();
}



module.exports = { askEmbedding, askQuestion };