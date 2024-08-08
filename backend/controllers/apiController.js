
const path = require('path');
const xlsx = require('xlsx');

const Organization = require('../models/Organization');
const Personne = require('../models/Personne');
const Relation = require('../models/Relation');
const neo4j = require('neo4j-driver');
const uri = 'bolt://localhost:7687';
const user = 'neo4j';
const password = '123456789';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const personne = new Personne(driver);
const organization = new Organization(driver);
const relation = new Relation(driver);


exports.getAllOrganizations = async (req, res) => {
    const { page = 0, limit = 10, name = '', city = '', address = '', industry = '' } = req.query;

    try {
        const organizationModel = new Organization(req.models.organization.driver);
        const { organizations, total } = await organizationModel.getAll(parseInt(page), parseInt(limit), name, city, address, industry);

        res.json({ organizations, total });
    } catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({ error: 'Error fetching organizations.' });
    }
};


exports.getAllPersonnes = async (req, res) => {
    const { page = 0, limit = 10, name = '', ville='',adresse= '',status='' } = req.query;

    try {
       const { personnes, total } = await personne.getAll(parseInt(page), parseInt(limit), name,ville,adresse,status);
        res.json({ personnes, total });
    } catch (error) {
        console.error('Error fetching personnes:', error);
        res.status(500).json({ error: 'Error fetching personnes.', details: error.message });
    }
};

exports.uploadFiles = async (req, res) => {
    try {
        const personFiles = req.files.personFiles || [];
        const organizationFiles = req.files.organizationFiles || [];
        const { relationType, relationDetails } = req.body;

        // Import Person Data
        for (const file of personFiles) {
            const filePath = path.resolve(file.path);
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);

            const hasAgeProperty = data.every(record => 'age' in record);
            if (!hasAgeProperty) {
                return res.status(400).send('File does not contain required "age" property.');
            }

            await personne.importFromExcel(filePath);

            // Create Relations for Persons
            await createRelationsForPersons(relationType, relationDetails, data);
        }

        // Import Organization Data
        for (const file of organizationFiles) {
            const filePath = path.resolve(file.path);
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);

            const hasIndustryProperty = data.every(record => 'industry' in record);
            if (!hasIndustryProperty) {
                return res.status(400).send('File does not contain required "industry" property.');
            }

            await organization.importOrganizationsFromExcel(filePath);

            // Create Relations for Organizations (if needed)
            await createRelationsForOrganizations(relationType, relationDetails, data);
        }

        res.status(200).send('Files uploaded and processed successfully.');
    } catch (error) {
        console.error('Error processing files:', error);
        res.status(500).send('Error processing files.');
    }
};
async function createRelationsForPersons(relationType, relationDetailsString, data) {
    const relationDetails = JSON.parse(relationDetailsString);
    for (const person of data) {

        if (relationType === 'TRAVAILLE') {
            if (relationDetails.relatedOrganization && relationDetails.position) {
                await relation.createRelation({
                    type: 'TRAVAILLE',
                    params: {
                        person: person.nom,
                        relatedOrganization: relationDetails.relatedOrganization,
                        position: relationDetails.position
                    }
                });
            } else {
                console.error(` error : person: ${person.nom}. Relation details: ${JSON.stringify(relationDetails)}`);
            }
        }if (relationType === 'ETUDE') {
            if (relationDetails.relatedOrganization && relationDetails.domaine && relationDetails.niveau) {
                await relation.createRelation({
                    type: 'ETUDE',
                    params: {
                        person: person.nom,
                        relatedOrganization: relationDetails.relatedOrganization,
                        domaine: relationDetails.domaine,
                        niveau: relationDetails.niveau
                    }
                });
            } else {
                console.error(` error : person: ${person.nom}. Relation details: ${JSON.stringify(relationDetails)}`);
            }
        } if (relationType === 'FAMILLE') {
            if (relationDetails.relatedPerson && relationDetails.type) {
                await relation.createRelation({
                    type: 'FAMILLE',
                    params: {
                        person: person.nom,
                        relatedPerson: relationDetails.relatedPerson,
                        type: relationDetails.type,
                       
                    }
                });
            } else {
                console.error(` error : person: ${person.nom}. Relation details: ${JSON.stringify(relationDetails)}`);
            }
        } if (relationType === 'AMITIE') {
            if (relationDetails.relatedPerson ) {
                await relation.createRelation({
                    type: 'AMITIE',
                    params: {
                        person: person.nom,
                        relatedPerson: relationDetails.relatedPerson,
                        
                       
                    }
                });
            } else {
                console.error(` error : person: ${person.nom}. Relation details: ${JSON.stringify(relationDetails)}`);
            }
        }
        
    }
}
async function createRelationsForOrganizations(relationType, relationDetailsString,data) {
    const relationDetails = JSON.parse(relationDetailsString);
    for (const org of data) {
        if (relationType === 'COLLABORATION') {
        if (relationDetails.relatedOrganization) {
            await relation.createRelation({
                type: 'COLLABORATION', 
                params: {
                    organization: org.nom, 
                    relatedOrganization: relationDetails.relatedOrganization,
                    projet: relationDetails.projet,
                    role:relationDetails.role
                }
            
            });
        }
        } else {
            console.error(` error : person: ${org.nom}. Relation details: ${JSON.stringify(relationDetails)}`);
        }
    }
}

exports.addPersonList = async (req, res) => {
    try {
        for (const file of req.files) {
            const filePath = path.resolve(file.path);
            console.log('Resolved file path:', filePath);

            // Read and validate the Excel file
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);

            // Check if 'age' property exists in the data
            const hasAgeProperty = data.every(record => 'age' in record);

            if (!hasAgeProperty) {
                console.error('File does not contain required "age" property.');
                return res.status(400).send('File does not contain required "age" property.');
            }

            // If valid, proceed with importing the file
            await personne.importFromExcel(filePath);
        }
        res.status(200).send('Import successful');
    } catch (error) {
        console.error('Import failed:', error);
        res.status(500).send('Import failed');
    }
};
exports.addOrgList = async (req, res) => {
    try {
        for (const file of req.files) {
            const filePath = path.resolve(file.path);
            console.log('Resolved file path:', filePath);

             // Read and validate the Excel file
             const workbook = xlsx.readFile(filePath);
             const sheetName = workbook.SheetNames[0];
             const sheet = workbook.Sheets[sheetName];
             const data = xlsx.utils.sheet_to_json(sheet);

             const hasIndustryProperty = data.every(record => 'industry' in record);
             if (!hasIndustryProperty) {
                console.error('File does not contain required "industry" property.');
                return res.status(400).send('File does not contain required "age" property.');
            }

            await organization.importOrganizationsFromExcel(filePath);
        }
        res.status(200).send('Import successful');
    } catch (error) {
        console.error('Import failed:', error);
        res.status(500).send('Import failed');
    }
};

exports.getAllNodes = async (req, res) => {
    try {
        const persons = await personne.getAllPersons(); 
        const organizations = await organization.getAllOrganizations(); 

        console.log('Persons:', persons); 
        console.log('Organizations:', organizations); 
        
        res.json({ persons, organizations });
    } catch (error) {
        console.error('Error fetching all nodes:', error);
        res.status(500).json({ error: 'Error fetching all nodes.' });
    }
};

exports.getAllTypeNodes = async (req, res) => {
    try {
        let nodes;
        if (req.params.type === 'personne') {
            nodes = await personne.getAll();
        } else if (req.params.type === 'organization') {
            nodes = await organization.getAll();
        } else {
            nodes = { personnes: [], organizations: [] };
        }
        res.json(nodes);
    } catch (error) {
        console.error('Error fetching Neo4j nodes:', error);
        res.status(500).json({ error: 'Error fetching Neo4j nodes.', details: error.message });
    }
};

exports.getNodeById = async (req, res) => {
    try {
        const { id, type } = req.params;
        let node = null;

        if (type === 'personne') {
            node = await personne.getById(id);
        } else if (type === 'organization') {
            node = await organization.getById(id);
        } else {
            return res.status(400).json({ error: 'Invalid node type' });
        }

        if (!node) {
            return res.status(404).json({ error: 'Node not found' });
        }
        const relations = await relation.getRelationsById(id);

        res.json({
            ...node,
            type: type === 'personne' ? 'Personne' : 'Organization',
            relations
        });
    } catch (error) {
        console.error('Error retrieving node:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

exports.addNode = async (req, res) => {
    const { type } = req.body;
    try {
        let newNode;
        if (type === 'personne') {
            const { nom, age, ville, status, email, telephone, adresse } = req.body;
            newNode = await personne.create(nom, age, ville, status, email, telephone, adresse);
        } else if (type === 'organization') {
            const { nom, industry, adresse, email, telephone, siteWeb, ville } = req.body;
            newNode = await organization.create(nom, industry, adresse, email, telephone, siteWeb, ville);
        } else {
            return res.status(400).json({ error: 'Invalid type specified.' });
        }
        res.status(201).json({ message: 'Node added successfully.', node: newNode });
    } catch (error) {
        console.error('Error adding node:', error);
        res.status(500).json({ error: 'Failed to add node.', details: error.message });
    }
};

exports.editNode = async (req, res) => {
    const nodeId = req.params.id;
    const { type } = req.body;
  
    try {
        let updatedNode;
        if (type === 'personne') {
            const { nom, age, ville, status, email, telephone, adresse } = req.body;
            updatedNode = await personne.update(nodeId, nom, age, ville, status, email, telephone, adresse);
        } else if (type === 'organization') {
            const { nom, industry, adresse, email, telephone, siteWeb, ville } = req.body;
            updatedNode = await organization.update(nodeId, nom, industry, adresse, email, telephone, siteWeb, ville);
        } else {
            return res.status(400).json({ error: 'Invalid type specified.' });
        }
        res.json({ message: 'Node updated successfully.', node: updatedNode });
    } catch (error) {
        console.error('Error updating node:', error);
        res.status(500).json({ error: 'Error updating node.', details: error.message });
    }
};

exports.deleteNode = async (req, res) => {
    const nodeId = req.params.id;
    const type = req.params.type.toLowerCase(); 

    try {
        if (type === 'personne') {
            await personne.deletePersRelationships(nodeId);
            await personne.delete(nodeId); 
        } else if (type === 'organization') {
            await organization.deleteOrgRelationships(nodeId);
            await organization.delete(nodeId); 
        } else {
            throw new Error('Type not supported');
        }

        res.json({ message: 'Node deleted successfully.' });
    } catch (error) {
        console.error('Error deleting node:', error);
        res.status(500).json({ error: 'Error deleting node.', details: error.message });
    }
};

exports.checkNodeRelationships = async (req, res) => {
    const { type, id } = req.params;

    try {
        let result;

        if (type === 'personne') {
            result = await personne.checkRelationships(id);
        } else if (type === 'organization') {
            result = await organization.checkRelationships(id);
        } else {
            return res.status(400).json({ error: 'Invalid type specified.' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error checking node relationships:', error);
        res.status(500).json({ error: 'Error checking node relationships.', details: error.message });
    }
};

exports.searchNodesByName = async (req, res) => {
    const { nodeName } = req.query;

    if (!nodeName) {
        return res.status(400).send('Node name is required');
    }

    try {
        const personResults = await personne.getByNom(nodeName);

        const organizationResults = await organization.getByNom(nodeName);

        const combinedResults = {
            nodes: [
                ...personResults.map(person => ({ type: 'Personne', ...person })),
                ...organizationResults.map(org => ({ type: 'Organization', ...org }))
            ]
        };

        res.json(combinedResults);
    } catch (error) {
        console.error('Error searching nodes by name:', error);
        res.status(500).send('Error searching nodes');
    }

};
