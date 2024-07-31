const express = require('express');
const router = express.Router();
const relationController = require('../controllers/relationController');


router.get('/', relationController.getAllRelations);
router.post('/add', relationController.addRelation);
router.post('/:id', relationController.getRelationDetails);
router.put('/update/:id', relationController.updateRelation);
router.delete('/delete/:relationId', relationController.deleteRelation);


router.get('/allBetween/:nodeName1/:nodeName2', relationController.getAllRelationsBetweenNodes);
router.get('/paths/:nodeName1/:nodeName2', relationController.getAllPaths);
router.get('/DFSpaths/:nodeName1/:nodeName2', relationController.getAllPathsDFS);
module.exports = router;
