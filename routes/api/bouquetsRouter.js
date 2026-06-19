const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/bouquetsController');
const validateBody = require('../../middlewares/validateBody');
const upload = require('../../middlewares/upload');
const isValidId = require('../../middlewares/isValidId');
const schemas = require('../../schemas/bouquetsSchemas');

router.get('/', ctrl.getAllBouquets);

router.get('/:id', isValidId, ctrl.getBouquetById);
router.post('/', validateBody(schemas.createBouquetSchema), ctrl.createBouquet);
router.put('/:id', isValidId, validateBody(schemas.updateBouquetSchema), ctrl.updateBouquet);
router.patch('/:id/favorite', isValidId, validateBody(schemas.updateFavoriteSchema), ctrl.updateFavoriteStatus);
router.patch('/:id/photo', isValidId, upload.single('photo'), ctrl.updateBouquetPhoto);
router.delete('/:id', isValidId, ctrl.deleteBouquet);

module.exports = router;