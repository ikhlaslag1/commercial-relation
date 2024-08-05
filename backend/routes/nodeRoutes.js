const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/org', apiController.getAllOrganizations);
router.get('/pers', apiController.getAllPersonnes);
router.get('/all', apiController.getAllNodes);
router.get('/:type', apiController.getAllTypeNodes);
router.get('/:type/:id', apiController.getNodeById);
router.post('/add', apiController.addNode);
router.put('/edit/:id', apiController.editNode);
router.delete('/delete/:type/:id', apiController.deleteNode);
router.get('/checkRelationships/:type/:id', apiController.checkNodeRelationships);
router.post('/search', apiController.searchNodesByName);

module.exports = router;
