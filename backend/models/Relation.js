const neo4j = require('neo4j-driver');

class Relation {
    constructor(driver) {
        this.driver = driver;
        this.session = this.driver.session();
    }

    async getAllRelations() {
        try {
            const result = await this.session.run(`
                MATCH ()-[r]->()
                RETURN type(r) as type, r
            `);

            return result.records.map(record => ({
                type: record.get('type'),
                details: record.get('r').properties
            }));
        } catch (error) {
            throw error;
        } finally {
            await this.session.close();
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
                        CREATE (p)-[:TRAVAILLE {position: $position}]->(o)
                    `;
                    queryParams = {
                        person: params.person,
                        relatedOrganization: params.relatedOrganization,
                        position: params.position
                    };
                    break;
                case 'ETUDE':
                    query = `
                        MATCH (p:Personne {nom: $person}), (o:Organization {nom: $organization})
                        CREATE (p)-[:ETUDE {domaine: $domaine, niveau: $niveau}]->(o)
                    `;
                    queryParams = {
                        person: params.person,
                        organization: params.relatedOrganization,
                        domaine: params.domaine,
                        niveau: params.niveau
                    };
                    break;
                case 'FAMILLE':
                    query = `
                        MATCH (p1:Personne {nom: $person}), (p2:Personne {nom: $relatedPerson})
                        CREATE (p1)-[:FAMILLE {type: $type}]->(p2)
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
                        CREATE (o1)-[:COLLABORATION {projet: $projet, role: $role}]->(o2)
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
                        CREATE (p1)-[:AMITIE]->(p2), (p2)-[:AMITIE]->(p1)
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
    
            await this.session.run(query, queryParams);
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
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
              queryParams.position = updatedParams.relationshipProperties.position; // Ensure this matches the query
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
              query = ''; // Handle 'AMITIE' if needed
              break;
            default:
              throw new Error(`Type de relation non pris en charge: ${updatedParams.type}`);
          }
      
          if (query) {
            // Ensure `relationId` and other parameters are included
            await this.session.run(query, queryParams);
          }
        } catch (error) {
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

    async getAllShortedPath(nodeName1, nodeName2) {
        const session = this.driver.session();
        try {
    
            const result = await session.run(
                `MATCH p=allShortestPaths((a)-[*]-(b))
                 WHERE a.nom = $nodeName1 AND b.nom = $nodeName2
                 RETURN p`,
                { nodeName1, nodeName2 }
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
    async getAllPaths(nodeName1, nodeName2) {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                MATCH path = (a)-[*]-(b)  
                WHERE a.nom = $nodeName1 AND b.nom = $nodeName2
                RETURN path
            `, { nodeName1, nodeName2 });
    
            return result.records.map(record => {
                const path = record.get('path');
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
    
    async getAllPathsDFS (nodeName1, nodeName2) {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                WITH $nodeName1 AS nodeName1, $nodeName2 AS nodeName2
                MATCH (n1 {nom: nodeName1}), (n2 {nom: nodeName2})
                WITH id(n1) AS nodeId1, id(n2) AS nodeId2
                CALL gds.dfs.stream('myGraph', {
                    sourceNode: nodeId1,
                    targetNodes: [nodeId2]
                })
                YIELD path
                RETURN path
            `, { nodeName1, nodeName2 });
    
            return result.records.map(record => {
                const path = record.get('path');
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
    

}

module.exports = Relation;
