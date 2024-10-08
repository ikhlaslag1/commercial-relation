const neo4j = require('neo4j-driver');
const xlsx = require('xlsx');
class Relation {
    constructor(driver) {
        this.driver = driver;
        this.session = this.driver.session();
    }

async getAllRelations() {
    const newSession = this.driver.session(); 
    try {
        const result = await newSession.run(`
            MATCH (from)-[r]->(to)
            RETURN from.nom AS fromName, to.nom AS toName, type(r) AS type, r.date AS date
            ORDER BY r.id DESC
            LIMIT 5
        `);

        return result.records.map(record => ({
            from: record.get('fromName'),
            to: record.get('toName'),
            type: record.get('type'),
            date: record.get('date')
        }));
    } catch (error) {
        throw error;
    } finally {
        newSession.close(); 
    }
}


    async createRelation(relation) {
        const { type, params } = relation;
    
        try {
            let query = '';
            let queryParams = {};
    
            switch (type) {
                case 'TRAVAILLE':
                    query = `
                        MATCH (p:Personne {nom: $person}), (o:Organization {nom: $relatedOrganization})
                        CREATE (p)-[:TRAVAILLE {position: $position,date: date()}]->(o)
                    `;
                    queryParams = {
                        person: params.person,
                        relatedOrganization: params.relatedOrganization,
                        position: params.position
                    };
                    break;
                case 'ETUDE':
                    query = `
                        MATCH (p:Personne {nom: $person}), (o:Organization {nom: $relatedOrganization})
                        CREATE (p)-[:ETUDE {domaine: $domaine, niveau: $niveau,date: date()}]->(o)
                    `;
                    queryParams = {
                        person: params.person,
                        relatedOrganization: params.relatedOrganization,
                        domaine: params.domaine,
                        niveau: params.niveau
                    };
                    break;
                case 'FAMILLE':
                    query = `
                        MATCH (p1:Personne {nom: $person}), (p2:Personne {nom: $relatedPerson})
                        CREATE (p1)-[:FAMILLE {type: $type,date: date()}]->(p2)
                    `;
                    queryParams = {
                        person: params.person,
                        relatedPerson: params.relatedPerson,
                        type: params.type
                    };
                    break;
                case 'COLLABORATION':
                    query = `
                        MATCH (o1:Organization {nom: $organization}), (o2:Organization {nom: $relatedOrganization})
                        CREATE (o1)-[:COLLABORATION {projet: $projet, role: $role, date: date()}]->(o2)
                    `;
                    queryParams = {
                        organization: params.organization,
                        relatedOrganization: params.relatedOrganization,
                        projet: params.projet,
                        role: params.role
                    };
                    break;
                case 'AMITIE':
                    query = `
                        MATCH (p1:Personne {nom: $person}), (p2:Personne {nom: $relatedPerson})
                        CREATE (p1)-[:AMITIE {date: date()}]->(p2), (p2)-[:AMITIE {date: date()}]->(p1)
                    `;
                    queryParams = {
                        person: params.person,
                        relatedPerson: params.relatedPerson
                    };
                    break;
                default:
                    throw new Error(`Unsupported relation type: ${type}`);
            }
    
            console.log('Running query:', query);
            console.log('With parameters:', queryParams);
    
            const result = await this.session.run(query, queryParams);
            console.log('Query result:', result); 
    
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }
    async  getRelationCountsFromDB() {
        try {
            const queries = {
                personPerson: `
                    MATCH (p1:Personne)-[r]-(p2:Personne)
                    RETURN count(r) AS count
                `,
                organizationOrganization: `
                    MATCH (o1:Organization)-[r]-(o2:Organization)
                    RETURN count(r) AS count
                `,
                personOrganization: `
                    MATCH (p:Personne)-[r]-(o:Organization)
                    RETURN count(r) AS count
                `
            };
    
            const results = {};
            for (const [key, query] of Object.entries(queries)) {
                const result = await this.session.run(query);
                results[key] = result.records[0].get('count').toInt();
            }
    
            return results;
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;  
        }
    }
    
    
    async countRelations() {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                MATCH ()-[r]->() 
                RETURN type(r) AS relationType, count(r) AS count
            `);
            console.log('Query Result:', result.records); 
            
            const counts = result.records.map(record => ({
                relationType: record.get('relationType'),
                count: record.get('count').toNumber(),
            }));
            
            return counts;
        } catch (error) {
            console.error('Error counting relations:', error.message);
            throw error;
        } finally {
            await session.close();
        }
    }
    
    
      
    async updateRelation(id, updatedParams) {
        try {
          let query = '';
          let queryParams = {relationId: id };
          console.log('Update Params:', updatedParams);
          
          switch (updatedParams.type) {
            case 'TRAVAILLE':
              query = `
                MATCH (p:Personne)-[r:TRAVAILLE]->(o:Organization)
                WHERE id(r) = toInteger($relationId)
                SET r.position = $position
              `;
              queryParams.position = updatedParams.relationshipProperties.position; 
              break;
            case 'ETUDE':
              query = `
                MATCH (p:Personne)-[r:ETUDE]->(o:Organization)
                WHERE id(r) = toInteger($relationId)
                SET r.domaine = $domaine, r.niveau = $niveau
              `;
              queryParams.domaine = updatedParams.relationshipProperties.domaine;
              queryParams.niveau = updatedParams.relationshipProperties.niveau;
              break;
            case 'FAMILLE':
              query = `
                MATCH (p1:Personne)-[r:FAMILLE]->(p2:Personne)
                WHERE id(r) = toInteger($relationId)
                SET r.type = $type
              `;
              queryParams.type = updatedParams.relationshipProperties.type;
              break;
            case 'COLLABORATION':
              query = `
                MATCH (o1:Organization)-[r:COLLABORATION]->(o2:Organization)
                WHERE id(r) = toInteger($relationId)
                SET r.projet = $projet, r.role = $role
              `;
              queryParams.projet = updatedParams.relationshipProperties.projet;
              queryParams.role = updatedParams.relationshipProperties.role;
              break;
            case 'AMITIE':
              query = '';
              break;
            default:
              throw new Error(`Type de relation non pris en charge: ${updatedParams.type}`);
          }
      
          if (query) {
            
            await this.session.run(query, queryParams);
          }
        } catch (error) {
          throw error;
        }
      }
  async changeRelationType(id, newType, relationshipProperties) {
    try {
        const findOldRelationQuery = `
            MATCH ()-[r]->()
            WHERE id(r) = toInteger($relationId)
            RETURN r, startNode(r) AS startNode, endNode(r) AS endNode
        `;

        const result = await this.session.run(findOldRelationQuery, { relationId: id });

        if (result.records.length === 0) {
            throw new Error('Relation not found');
        }

        const oldRelation = result.records[0].get('r');
        const startNode = result.records[0].get('startNode');
        const endNode = result.records[0].get('endNode');
        const oldProperties = oldRelation.properties;

        let createNewRelationQuery = '';
        let newProperties = {};

        switch (newType) {
            case 'TRAVAILLE':
                createNewRelationQuery = `
                    MATCH (startNode), (endNode)
                    WHERE id(startNode) = toInteger($startNodeId) AND id(endNode) = toInteger($endNodeId)
                    CREATE (startNode)-[:TRAVAILLE {position: $position}]->(endNode)
                `;
                newProperties = {
                    position: relationshipProperties.position || oldProperties.position || ''
                };
                break;
            case 'ETUDE':
                createNewRelationQuery = `
                    MATCH (startNode), (endNode)
                    WHERE id(startNode) = toInteger($startNodeId) AND id(endNode) = toInteger($endNodeId)
                    CREATE (startNode)-[:ETUDE {domaine: $domaine, niveau: $niveau}]->(endNode)
                `;
                newProperties = {
                    domaine: relationshipProperties.domaine || oldProperties.domaine || '',
                    niveau: relationshipProperties.niveau || oldProperties.niveau || ''
                };
                break;
            case 'FAMILLE':
                createNewRelationQuery = `
                    MATCH (startNode), (endNode)
                    WHERE id(startNode) = toInteger($startNodeId) AND id(endNode) = toInteger($endNodeId)
                    CREATE (startNode)-[:FAMILLE {type: $type}]->(endNode)
                `;
                newProperties = {
                    type: relationshipProperties.type || oldProperties.type || ''
                };
                break;
            case 'COLLABORATION':
                createNewRelationQuery = `
                    MATCH (startNode), (endNode)
                    WHERE id(startNode) = toInteger($startNodeId) AND id(endNode) = toInteger($endNodeId)
                    CREATE (startNode)-[:COLLABORATION {projet: $projet, role: $role}]->(endNode)
                `;
                newProperties = {
                    projet: relationshipProperties.projet || oldProperties.projet || '',
                    role: relationshipProperties.role || oldProperties.role || ''
                };
                break;
            case 'AMITIE':
                createNewRelationQuery = `
                    MATCH (startNode), (endNode)
                    WHERE id(startNode) = toInteger($startNodeId) AND id(endNode) = toInteger($endNodeId)
                    CREATE (startNode)-[:AMITIE]->(endNode)
                `;
                break;
            default:
                throw new Error(`Unsupported new relation type: ${newType}`);
        }

        console.log('Creating new relation with query:', createNewRelationQuery);
        console.log('Parameters:', {
            startNodeId: startNode.identity.toInt(),
            endNodeId: endNode.identity.toInt(),
            ...newProperties
        });

        await this.session.run(createNewRelationQuery, {
            startNodeId: startNode.identity.toInt(),
            endNodeId: endNode.identity.toInt(),
            ...newProperties
        });

        const deleteOldRelationQuery = `
            MATCH ()-[r]->()
            WHERE id(r) = toInteger($relationId)
            DELETE r
        `;

        console.log('Deleting old relation with query:', deleteOldRelationQuery);
        console.log('Parameters:', { relationId: id });

        await this.session.run(deleteOldRelationQuery, { relationId: id });

        console.log('Relation type changed successfully');
    } catch (error) {
        console.error('Error changing relation type:', error);
        throw error;
    }
}

    async getRelationsById(nodeId) {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                MATCH (n)-[r]->(m)
                WHERE id(n) = toInteger($nodeId)
                RETURN type(r) AS relationType, id(r) AS relationId, id(m) AS relatedNodeId,n.nom as nodeName, m.nom AS relatedNodeName, r AS relationshipProperties
            `, { nodeId });
    
            const relations = result.records.map(record => ({
                relationType: record.get('relationType').toString(),
                relationId: record.get('relationId').toString(),
                relatedNodeId: record.get('relatedNodeId').toString(),
                nodeName: record.get('nodeName') ? record.get('nodeName').toString() : null,
                relatedNodeName: record.get('relatedNodeName') ? record.get('relatedNodeName').toString() : null,
                relationshipProperties: record.get('relationshipProperties').properties
            }));
    
            return relations.length > 0 ? relations : null;
        } finally {
            await session.close();
        }
    }
    
    async getRelationDetails(id) {
        const session = this.driver.session();
        try {
          const result = await session.run(`
            MATCH (n)-[r]->(m)
            WHERE id(r) = toInteger($id)
            RETURN type(r) AS relationType, id(r) AS relationId, id(m) AS relatedNodeId, n.nom AS nodeName, m.nom AS relatedNodeName, r AS relationshipProperties
          `, { id: parseInt(id, 10) });
    
          const relations = result.records.map(record => ({
            relationType: record.get('relationType').toString(),
            relationId: record.get('relationId').toString(),
            relatedNodeId: record.get('relatedNodeId').toString(),
            nodeName: record.get('nodeName') ? record.get('nodeName').toString() : null,
            relatedNodeName: record.get('relatedNodeName') ? record.get('relatedNodeName').toString() : null,
            relationshipProperties: record.get('relationshipProperties').properties
          }));
    
          return relations.length > 0 ? relations[0] : null;
        } finally {
          await session.close();
        }
      }
    async deleteRelation(relationId, type) {
        try {
            let query = '';
            let queryParams = { relationId };
    
            switch (type) {
                case 'TRAVAILLE':
                    query = `
                        MATCH ()-[r:TRAVAILLE]->()
                        WHERE id(r) = toInteger($relationId)
                        DELETE r
                    `;
                    break;
                case 'ETUDE':
                    query = `
                        MATCH ()-[r:ETUDE]->()
                        WHERE id(r) = toInteger($relationId)
                        DELETE r
                    `;
                    break;
                case 'FAMILLE':
                    query = `
                        MATCH ()-[r:FAMILLE]->()
                        WHERE id(r) = toInteger($relationId)
                        DELETE r
                    `;
                    break;
                case 'COLLABORATION':
                    query = `
                        MATCH ()-[r:COLLABORATION]->()
                        WHERE id(r) = toInteger($relationId)
                        DELETE r
                    `;
                    break;
                case 'AMITIE':
                    query = `
                        MATCH ()-[r:AMITIE]->()
                        WHERE id(r) = toInteger($relationId)
                        DELETE r
                    `;
                    break;
                default:
                    throw new Error(`Type de relation non pris en charge: ${type}`);
            }
    
            await this.session.run(query, queryParams);
        } catch (error) {
            throw error;
        }
    }

    async getAllShortedPath(nodeUuid1, nodeUuid2, relationshipTypes = []) {
        const session = this.driver.session();
        
        try {
             const relationshipCondition = relationshipTypes.length > 0
                ? `ALL(r IN relationships(p) WHERE type(r) IN $relationshipTypes)`
                : `true`; 
    
            const result = await session.run(
                `MATCH p=allShortestPaths((a)-[*]-(b))
                 WHERE a.uuid = $nodeUuid1 AND b.uuid = $nodeUuid2
                 AND ${relationshipCondition}
                 RETURN p`,
                { nodeUuid1, nodeUuid2, relationshipTypes }
            );
    
            return result.records.map(record => {
                const path = record.get('p');
                return {
                    nodes: path.segments.map(segment => ({
                        start: segment.start.properties,
                        end: segment.end.properties
                    })),
                    relationships: path.segments.map(segment => ({
                        type: segment.relationship.type,
                        properties: segment.relationship.properties
                    }))
                };
            });
        } finally {
            await session.close();
        }
    }
    
    async getAllPaths(nodeUuid1, nodeUuid2, relationshipTypes = []) {
        const session = this.driver.session();
    
        try {
            const relationshipCondition = relationshipTypes.length > 0
                ? `ALL(r IN relationships(p) WHERE type(r) IN $relationshipTypes)`
                : `true`;
    
            const result = await session.run(
                `MATCH p=((a)-[*]-(b))
                 WHERE a.uuid = $nodeUuid1 AND b.uuid = $nodeUuid2
                 AND ${relationshipCondition} 
                 RETURN p
                 LIMIT 1000`,
                { nodeUuid1, nodeUuid2, relationshipTypes }
            );
    
            return result.records.map(record => {
                const path = record.get('p');
                return {
                    nodes: path.segments.map(segment => ({
                        start: segment.start.properties,
                        end: segment.end.properties
                    })),
                    relationships: path.segments.map(segment => ({
                        type: segment.relationship.type,
                        properties: segment.relationship.properties
                    }))
                };
            });
        } catch (error) {
            console.error('Error fetching all paths:', error);
            throw error;
        } finally {
            await session.close();
        }
    }
    
    
    async getFilteredRelations (types) {
        const session = this.driver.session();
        try {
            const result = await session.run(
                `
                MATCH p=(start)-[r]->(end)
                WHERE ALL(rel IN relationships(p) WHERE rel.type IN $types)
                RETURN p
                `,
                { types }
            );
    
            const paths = result.records.map(record => {
                return record.get('p'); // Transformer le résultat selon vos besoins
            });
    
            return paths;
        } catch (error) {
            console.error('Erreur lors de la récupération des relations filtrées:', error);
            throw error;
        } finally {
            await session.close();
        }
    };
    

}

module.exports = Relation;
