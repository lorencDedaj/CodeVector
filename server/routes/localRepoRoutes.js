const express = require('express');
const {
  uploadLocalRepo,
  queryRepo,
} = require('../controllers/localRepoController');

const router = express.Router();

// POST /api/repo/upload-local
router.post('/upload-local', uploadLocalRepo);
router.post('/query', queryRepo);

module.exports = router;
