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
                if (!params.person || !params.organization || !params.domaine || !params.niveau) {
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
async function countRelations(req, res) {
    try {
        const counts = await relation.countRelations();
        return res.status(200).json({ success: true, data: counts });
    } catch (error) {
        console.error('Error counting relations:', error.message);
        console.error('Stack trace:', error.stack);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
}


async function getRelationById (req, res) {
    const { id } = req.params;
    try {
        const relationDetails = await relation.getRelationsById(id);
        if (!relationDetails) {
            return res.status(404).json({ error: 'Relation non trouvée.' });
        }
        res.json(relationDetails);
    } catch (error) {
        console.error('Erreur lors de la récupération de la relation:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la relation.' });
    }
};

const getRelationDetails = async (req, res) => {
    const { id } = req.params;
    try {
      const relationDetails = await relation.getRelationDetails(id);
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
    const { id } = req.params;
    const { type, ...updatedParams } = req.body;

    console.log('Type:', type); 
    console.log('Updated Params:', updatedParams);

    try {
        await relation.updateRelation(id, { type, ...updatedParams });
        res.json({ message: 'Relation mise à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la relation:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la relation' });
    }
}
async function changeRelationType(req, res) {
    const { id } = req.params;
    const { newType, relationshipProperties } = req.body;

    try {
        if (!newType) {
            return res.status(400).json({ error: 'Missing new relation type' });
        }

        await relation.changeRelationType(id, newType, relationshipProperties);
        res.json({ message: 'Relation type changed successfully' });
    } catch (error) {
        console.error('Erreur lors du changement du type de relation:', error);
        res.status(500).json({ error: 'Erreur lors du changement du type de relation' });
    }
}

async function getAllRelationsBetweenNodes(req, res) {
    const { nodeUuid1, nodeUuid2 } = req.params;
    const { relationshipTypes } = req.body; 

    try {
        console.log('nodeUuid1:', nodeUuid1);
        console.log('nodeUuid2:', nodeUuid2);
        console.log('relationshipTypes:', relationshipTypes);

        const paths = await relation.getAllShortedPath(nodeUuid1, nodeUuid2, relationshipTypes || []);

        res.json(paths);
    } catch (error) {
        console.error('Error fetching relations between nodes:', error);
        res.status(500).json({ error: 'Error fetching relations between nodes.', details: error.message });
    }
}


async function getAllPaths(req, res) {
    const { nodeUuid1, nodeUuid2 } = req.params;
    const { relationshipTypes } = req.body; 

    try {
        console.log('nodeUuid1:', nodeUuid1);
        console.log('nodeUuid2:', nodeUuid2);
        console.log('relationshipTypes:', relationshipTypes);

        const paths = await relation.getAllPaths(nodeUuid1, nodeUuid2, relationshipTypes || []);
        res.json(paths);
    } catch (error) {
        console.error('Error fetching all paths:', error);
        res.status(500).json({ error: 'Error fetching all paths', details: error.message });
    }
}


const getRelationCounts = async (req, res) => {
    try {
        const counts = await relation.getRelationCountsFromDB(); 
        res.status(200).json(counts); 
    } catch (error) {
        console.error('Error in getRelationCounts controller:', error);
        res.status(500).json({ error: 'Internal Server Error' }); 
    }
};
const deleteRelation= async(req, res)=> {
    const { relationId } = req.params; 
    const { type } = req.query; 
  
    try {
      await relation.deleteRelation(relationId, type);
      res.json({ message: 'Relation supprimée avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression de la relation:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression de la relation' });
    }
  }
  
  const getFilteredRelations = async (req, res) => {
    const { types } = req.body;

    try {
        const filteredRelations = await relation.getFilteredRelations(types);
        res.json(filteredRelations);
    } catch (error) {
        console.error('Erreur lors de la récupération des relations filtrées:', error);
        res.status(500).send('Erreur du serveur');
    }
};
module.exports = {
    getAllRelations,
    addRelation,
    updateRelation,
    deleteRelation,
    getRelationById,
    getAllRelationsBetweenNodes,
    getAllPaths,
    getRelationDetails,
    changeRelationType,
    countRelations,
    getRelationCounts,
    getFilteredRelations
   
    
};
