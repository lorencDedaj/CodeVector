console.log('process.argv:', process.argv);

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// NOT THE ROUTE BELOW IS UNUSED
// const localOpenaiRoutes = require('./routes/localOpenaiRoutes');
// app.use('/api/openai', localOpenaiRoutes);

const localRepoRoutes = require('./routes/localRepoRoutes');
app.use('/api/repo', localRepoRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to AskMyRepo 🧠');
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Central error handler
app.use((err, _req, res, _next) => {
  const status = err?.status || err?.response?.status || 500;
  const message =
    err?.message || err?.response?.data || 'Internal Server Error';
  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is runiing on http://localhost:${PORT}`);
});
