const express = require('express');
const router = express.Router();

const relationController = require('../controllers/relationController');


router.get('/latest', relationController.getAllRelations);
router.post('/add', relationController.addRelation);
router.post('/:id', relationController.getRelationDetails);
router.put('/update/:id', relationController.updateRelation);
router.put('/:id/changeType', relationController.changeRelationType);
router.get('/count', relationController.countRelations);
router.get('/relation-counts', relationController.getRelationCounts);
router.delete('/delete/:relationId', relationController.deleteRelation);


router.post('/allBetween/:nodeUuid1/:nodeUuid2', relationController.getAllRelationsBetweenNodes);
router.post('/paths/:nodeUuid1/:nodeUuid2', relationController.getAllPaths);
router.post('/filter', relationController.getFilteredRelations);
module.exports = router;
