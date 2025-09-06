const fs = require("fs").promises;
const path = require("path");
const OpenAI = require("openai");
require('dotenv').config();

const openai = new OpenAI({
    apikey: process.env.OPENAI_API_KEY,
});

const askEmbedding = async (req, res, next) =>{
    
}