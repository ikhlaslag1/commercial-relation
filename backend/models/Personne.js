const neo4j = require('neo4j-driver');
const { v4: uuidv4 } = require('uuid');

class Personne {
    constructor(driver) {
        this.driver = driver;
    }

    formatDate(dateString) {
        if (!dateString) return null;
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    async getAll(page = 0, limit = 10, name = '', ville = '', adresse = '', status = '') {
        const session = this.driver.session();
        const offset = page * limit;
    
        let query = `
            MATCH (p:Personne)
            WHERE ($name = '' OR toLower(p.nom) CONTAINS toLower($name))
              AND ($ville = '' OR toLower(p.ville) CONTAINS toLower($ville))
              AND ($adresse = '' OR toLower(p.adresse) CONTAINS toLower($adresse))
              AND ($status = '' OR toLower(p.status) CONTAINS toLower($status))
            RETURN id(p) as id, p.nom as nom, p.age as age, p.ville as ville, p.status as status, 
                   p.email as email, p.telephone as telephone, p.adresse as adresse, 
                   p.createdAt as createdAt, p.updatedAt as updatedAt, p.uuid as uuid
            SKIP $offset LIMIT $limit
        `;
    
        try {
            const result = await session.run(query, {
                name,
                ville,
                adresse,
                status,
                offset: neo4j.int(offset),
                limit: neo4j.int(limit)
            });
    
            const personnes = result.records.map(record => ({
                id: record.get('id').toString(),
                nom: record.get('nom') ? record.get('nom').toString() : null,
                age: record.get('age') ? record.get('age').toString() : null,
                ville: record.get('ville') ? record.get('ville').toString() : null,
                status: record.get('status') ? record.get('status').toString() : null,
                email: record.get('email') ? record.get('email').toString() : null,
                telephone: record.get('telephone') ? record.get('telephone').toString() : null,
                adresse: record.get('adresse') ? record.get('adresse').toString() : null,
                createdAt: this.formatDate(record.get('createdAt') ? record.get('createdAt').toString() : null),
                updatedAt: this.formatDate(record.get('updatedAt') ? record.get('updatedAt').toString() : null),
                uuid: record.get('uuid') ? record.get('uuid').toString() : null
            }));
    
            const countResult = await session.run(`
                MATCH (p:Personne)
                WHERE ($name = '' OR toLower(p.nom) CONTAINS toLower($name))
                  AND ($ville = '' OR toLower(p.ville) CONTAINS toLower($ville))
                  AND ($adresse = '' OR toLower(p.adresse) CONTAINS toLower($adresse))
                  AND ($status = '' OR toLower(p.status) CONTAINS toLower($status))
                RETURN count(p) as total
            `, { name, ville, adresse, status });
    
            const total = countResult.records[0].get('total').toNumber();
    
            return { personnes, total };
        } catch (error) {
            console.error('Error fetching personnes:', error);
            throw new Error('Error fetching personnes');
        } finally {
            await session.close();
        }
    }
    
    async getAllPersons() {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                MATCH (p:Personne)
                RETURN id(p) as id, p.nom as nom, p.uuid as uuid
            `);
    
            return result.records.map(record => ({
                id: record.get('id').toString(), 
                nom: record.get('nom') ? record.get('nom').toString() : null,
                uuid: record.get('uuid') ? record.get('uuid').toString() : null
            }));
        } finally {
            await session.close();
        }
    }
    
    async create(nom, age, ville, status, email, telephone, adresse) {
        const session = this.driver.session();
        const currentTime = new Date().toISOString();
        const uuid = uuidv4(); // Générer un UUID
        try {
            const result = await session.run(`
                CREATE (p:Personne {uuid: $uuid, nom: $nom, age: $age, ville: $ville, status: $status, email: $email, telephone: $telephone, adresse: $adresse, createdAt: $currentTime, updatedAt: $currentTime})
                RETURN id(p) as id
            `, { uuid, nom, age, ville, status, email, telephone, adresse, currentTime });
            return result.records[0].get('id').toString();
        } finally {
            await session.close();
        }
    }

    async update(id, nom, age, ville, status, email, telephone, adresse) {
        const session = this.driver.session();
        const currentTime = new Date().toISOString();
        try {
            const result = await session.run(`
                MATCH (n:Personne)
                WHERE id(n) = toInteger($id)
                SET n.nom = $nom, n.age = $age, n.ville = $ville, n.status = $status, n.email = $email, n.telephone = $telephone, n.adresse = $adresse, n.updatedAt = $currentTime
                RETURN id(n) as id
            `, { id, nom, age, ville, status, email, telephone, adresse, currentTime });
        
            if (result.records.length > 0) {
                return result.records[0].get('id').toString();
            } else {
                throw new Error('Node not found or not updated.');
            }
        } finally {
            await session.close();
        }
    }

    async getByNom(nom) {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                MATCH (p:Personne)
                WHERE toLower(p.nom) CONTAINS toLower($nom)
                RETURN id(p) as id, p.nom as nom, p.age as age, p.ville as ville, p.status as status, p.email as email, p.telephone as telephone, p.adresse as adresse, 
                       p.createdAt as createdAt, p.updatedAt as updatedAt, p.uuid as uuid
            `, { nom });
            
            return result.records.map(record => ({
                id: record.get('id').toString(),
                nom: record.get('nom').toString(),
                age: record.get('age').toString(),
                ville: record.get('ville').toString(),
                status: record.get('status').toString(),
                email: record.get('email') ? record.get('email').toString() : null,
                telephone: record.get('telephone') ? record.get('telephone').toString() : null,
                adresse: record.get('adresse') ? record.get('adresse').toString() : null,
                createdAt: this.formatDate(record.get('createdAt') ? record.get('createdAt').toString() : null),
                updatedAt: this.formatDate(record.get('updatedAt') ? record.get('updatedAt').toString() : null),
                uuid: record.get('uuid') ? record.get('uuid').toString() : null
            }));
        } finally {
            await session.close();
        }
    }
    
    

    async getById(id) {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                MATCH (p:Personne)
                WHERE id(p) = toInteger($id)
                RETURN id(p) as id, p.nom as nom, p.age as age, p.ville as ville, p.status as status, p.email as email, p.telephone as telephone, p.adresse as adresse,
                       p.createdAt as createdAt, p.updatedAt as updatedAt, p.uuid as uuid
            `, { id });
            return result.records.map(record => ({
                id: record.get('id').toString(),
                nom: record.get('nom') ? record.get('nom').toString() : null,
                age: record.get('age') ? record.get('age').toString() : null,
                ville: record.get('ville') ? record.get('ville').toString() : null,
                status: record.get('status') ? record.get('status').toString() : null,
                email: record.get('email') ? record.get('email').toString() : null,
                telephone: record.get('telephone') ? record.get('telephone').toString() : null,
                adresse: record.get('adresse') ? record.get('adresse').toString() : null,
                createdAt: this.formatDate(record.get('createdAt') ? record.get('createdAt').toString() : null),
                updatedAt: this.formatDate(record.get('updatedAt') ? record.get('updatedAt').toString() : null),
                uuid: record.get('uuid') ? record.get('uuid').toString() : null
            }))[0];
        } finally {
            await session.close();
        }
    }

    async delete(id) {
        const session = this.driver.session();
        try {
            await this.deletePersRelationships(id); 
            await session.run(`
                MATCH (n:Personne)
                WHERE id(n) = toInteger($id)
                DELETE n
            `, { id: neo4j.int(id) }); 
        } finally {
            await session.close();
        }
    }

    async deletePersRelationships (nodeId)  {
        const session = this.driver.session();
        const query = `
            MATCH (p:Personne)-[r]-(other)
            WHERE id(p) = toInteger($nodeId)
            DELETE r
        `;
        try {
            await session.run(query, { nodeId });
        } finally {
            await session.close();
        }
    }

    async checkRelationships(id) {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                MATCH (p:Personne)
                WHERE id(p) = toInteger($id)
                OPTIONAL MATCH (p)-[r]->(others)  
                OPTIONAL MATCH (p)<-[r]-(others)  
                RETURN count(r) AS relationshipsCount
            `, { id });

            const relationshipsCount = result.records[0].get('relationshipsCount').toNumber();

            return {
                hasRelationships: relationshipsCount > 0
            };
        } finally {
            await session.close();
        }
    }
}

module.exports = Personne;
