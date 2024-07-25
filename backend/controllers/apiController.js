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
    const { page = 0, limit = 10, name = '' } = req.query;

    try {
        const organizationModel = new Organization(req.models.organization.driver);
        const { organizations, total } = await organizationModel.getAll(parseInt(page), parseInt(limit), name);

        res.json({ organizations, total });
    } catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({ error: 'Error fetching organizations.' });
    }
};


exports.getAllPersonnes = async (req, res) => {
    const { page = 0, limit = 10, name = '' } = req.query;

    try {
       const { personnes, total } = await personne.getAll(parseInt(page), parseInt(limit), name);
        res.json({ personnes, total });
    } catch (error) {
        console.error('Error fetching personnes:', error);
        res.status(500).json({ error: 'Error fetching personnes.', details: error.message });
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
            await personne.delete(nodeId); 
        } else if (type === 'organization') {
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

exports.searchNodesByName = async (req, res) => {
    const { nodeName } = req.query; 
    try {
        const personnes = await personne.getByNom(nodeName);
        const organizations = await organization.getByNom(nodeName);
        res.json({ personnes, organizations });
    } catch (error) {
        console.error('Error searching nodes by name:', error);
        res.status(500).json({ error: 'Error searching nodes by name.', details: error.message });
    }
};
