const express = require('express');
const router = express.Router();

const relationController = require('../controllers/relationController');



router.post('/add', relationController.addRelation);
router.post('/:id', relationController.getRelationDetails);
router.put('/update/:id', relationController.updateRelation);
router.put('/:id/changeType', relationController.changeRelationType);

router.delete('/delete/:relationId', relationController.deleteRelation);


router.get('/allBetween/:nodeUuid1/:nodeUuid2', relationController.getAllRelationsBetweenNodes);
router.get('/paths/:nodeUuid1/:nodeUuid2', relationController.getAllPaths);

router.get('/DFSpaths/:nodeName1/:nodeName2', relationController.getAllPathsDFS);
module.exports = router;
