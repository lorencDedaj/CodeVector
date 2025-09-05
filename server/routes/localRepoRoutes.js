const express = require('express');
const { uploadLocalRepo } = require('../controllers/localRepoController');

const router = express.Router();

// POST /api/repo/upload-local
router.post('/upload-local', uploadLocalRepo);

module.exports = router;
