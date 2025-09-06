const express = require('express');
const cors = require("cors");
const dotenv = require('dotenv');
const { cloneRepoController } = require("./controllers/repoController");
const { processFiles } = require("./controllers/fileController");


dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/',
  (req, res) => {
  res.send('Welcome to AskMyRepo 🧠');
});

app.post('/repo',
  cloneRepoController,
  processFiles,
  (req, res) => {
  res.send('this is post!');
});

app.post('/ask',
  queryPinecone,
  askOpenai,
  (req, res) => {
  res.send('this is post!');
});
app.listen(PORT, () => {
  console.log(`Server is runiing on http://localhost:${PORT}`);
});
