const express = require('express');
const router = express.Router();
const { getCloudinarySignature } = require('../../controllers/settings/upload.controller');
const { authorize } = require('../../middleware/authorize');
const { authenticate } = require('../../middleware/authMiddleware');

router.post('/signature', authenticate, authorize('tours.manage'), getCloudinarySignature);

module.exports = router;