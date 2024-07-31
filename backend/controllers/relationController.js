const neo4j = require('neo4j-driver');
const Relation = require('../models/Relation');

const uri = 'bolt://localhost:7687';
const user = 'neo4j';
const password = '123456789';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

const relation = new Relation(driver);

async function getAllRelations(req, res) {
    try {
        const relations = await relation.getAllRelations();
        res.json(relations);
    } catch (error) {
        console.error('Erreur lors de la récupération des relations:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des relations' });
    }
}

async function addRelation(req, res) {
    const { type, params } = req.body;

    console.log('Received request to add relation:', req.body);

    try {
        if (!type) {
            return res.status(400).json({ error: 'Missing relation type' });
        }

        if (!params) {
            return res.status(400).json({ error: 'Missing parameters' });
        }

        switch (type) {
            case 'TRAVAILLE':
                if (!params.person || !params.relatedOrganization || !params.position) {
                    return res.status(400).json({ error: 'Missing required fields for TRAVAILLE' });
                }
                break;
            case 'ETUDE':
                if (!params.person || !params.relatedOrganization || !params.domaine || !params.niveau) {
                    return res.status(400).json({ error: 'Missing required fields for ETUDE' });
                }
                break;
            case 'FAMILLE':
                if (!params.person || !params.relatedPerson || !params.type) {
                    return res.status(400).json({ error: 'Missing required fields for FAMILLE' });
                }
                break;
            case 'COLLABORATION':
                if (!params.organization || !params.relatedOrganization || !params.projet || !params.role) {
                    return res.status(400).json({ error: 'Missing required fields for COLLABORATION' });
                }
                break;
            case 'AMITIE':
                if (!params.person || !params.relatedPerson) {
                    return res.status(400).json({ error: 'Missing required fields for AMITIE' });
                }
                break;
            default:
                return res.status(400).json({ error: 'Unsupported relation type' });
        }

        await relation.createRelation({ type, params });
        res.json({ message: 'Relation créée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la création de la relation:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la relation' });
    }
}

async function getRelationById (req, res) {
    const { id } = req.params;
    try {
        const relationDetails = await relation.getById(id);
        if (!relationDetails) {
            return res.status(404).json({ error: 'Relation non trouvée.' });
        }
        res.json(relationDetails);
    } catch (error) {
        console.error('Erreur lors de la récupération de la relation:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la relation.' });
    }
};


async function updateRelation(req, res) {
    const { relationId } = req.params;
    const { type, ...updatedParams } = req.body;

    try {
        await relation.updateRelation(relationId, { type, ...updatedParams });
        res.json({ message: 'Relation mise à jour avec succès' }); 
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la relation:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la relation' });
    }
}
async function getAllRelationsBetweenNodes(req, res) {
    const { nodeName1, nodeName2 } = req.params;
   
    try {
        console.log('nodeName1:', nodeName1);  
        console.log('nodeName2:', nodeName2);  

        const paths = await relation.getAllShortedPath(nodeName1, nodeName2);
        res.json(paths);
    } catch (error) {
        console.error('Error fetching relations between nodes:', error);
        res.status(500).json({ error: 'Error fetching relations between nodes.', details: error.message });
    }
}

async function getAllPaths(req, res) {
    const { nodeName1, nodeName2 } = req.params;
    try {
        const paths = await relation.getAllPaths(nodeName1, nodeName2);
        res.json(paths);
    } catch (error) {
        console.error('Error fetching all paths:', error);
        res.status(500).json({ error: 'Error fetching all paths', details: error.message });
    }
}

const getAllPathsDFS = async (req, res) => {
    const { nodeName1, nodeName2 } = req.params;

    try {
        const paths = await relation.getAllPathsDFS(nodeName1, nodeName2);
        res.json(paths);
    } catch (error) {
        console.error('Error getting DFS paths:', error);
        res.status(500).send('Error getting DFS paths');
    }
};




async function deleteRelation(req, res) {
    const { relationId, type } = req.params;

    try {
        await relation.deleteRelation(relationId, type);
        res.json({ message: 'Relation supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la relation:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la relation' });
    }
}

module.exports = {
    getAllRelations,
    addRelation,
    updateRelation,
    deleteRelation,
    getRelationById,
    getAllRelationsBetweenNodes,
    getAllPathsDFS,
    getAllPaths
};
