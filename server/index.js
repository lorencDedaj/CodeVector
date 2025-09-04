const express = require('express');
const cors = require("cors");
const dotenv = require('dotenv');
const { cloneRepoController } = require("../controllers/repoController");


dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/',
  cloneRepoController,
  (req, res) => {
  res.send('Welcome to AskMyRepo 🧠');
});
app.listen(PORT, () => {
  console.log(`Server is runiing on http://localhost:${PORT}`);
});
