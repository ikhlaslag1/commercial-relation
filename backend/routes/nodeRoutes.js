const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Existing routes
router.get('/org', apiController.getAllOrganizations);
router.get('/pers', apiController.getAllPersonnes);
router.get('/all', apiController.getAllNodes);
router.get('/:type', apiController.getAllTypeNodes);
router.get('/:type/:id', apiController.getNodeById);
router.post('/add', apiController.addNode);
router.post('/addPrsList', upload.array('files'), apiController.addPersonList); 
router.post('/addOrgList', upload.array('files'), apiController.addOrgList);
router.put('/edit/:id', apiController.editNode);
router.delete('/delete/:type/:id', apiController.deleteNode);
router.get('/checkRelationships/:type/:id', apiController.checkNodeRelationships);
router.post('/search', apiController.searchNodesByName);

router.post('/upload', upload.fields([
    { name: 'personFiles', maxCount: 2 },
    { name: 'organizationFiles', maxCount: 2 }
]), apiController.uploadFiles);

module.exports = router;
