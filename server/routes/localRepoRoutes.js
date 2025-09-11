const express = require('express');
const {
  uploadLocalRepo,
  queryRepo,
} = require('../controllers/localRepoController');
const { getHistoryByJob } = require("../controllers/historyController");

const router = express.Router();

// POST /api/repo/upload-local
router.post('/upload-local', uploadLocalRepo);
router.post('/query', queryRepo);

// History endpoint (by jobId only)
router.get("/history/job/:jobId", getHistoryByJob);


module.exports = router;
