const neo4j = require('neo4j-driver');

class Personne {
    constructor(driver) {
        this.driver = driver;
    }

    async getAll(page = 0, limit = 10, name = '') {
        const session = this.driver.session();
        const offset = page * limit;
        let query = `
            MATCH (p:Personne)
            WHERE p.nom CONTAINS $name
            RETURN id(p) as id, p.nom as nom, p.age as age, p.ville as ville, p.status as status, p.email as email, p.telephone as telephone, p.adresse as adresse
            SKIP $offset LIMIT $limit
        `;
        try {
            const result = await session.run(query, {
                name,
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
                adresse: record.get('adresse') ? record.get('adresse').toString() : null
            }));
    
            const countResult = await session.run(`
                MATCH (p:Personne)
                WHERE p.nom CONTAINS $name
                RETURN count(p) as total
            `, { name });
    
            const total = countResult.records[0].get('total').toNumber();
    
            return { personnes, total };
        } finally {
            await session.close();
        }
    }
    async getAllPersons() {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                MATCH (p:Personne)
                RETURN id(p) as id, p.nom as nom
            `);
    
            return result.records.map(record => ({
                id: record.get('id').toString(), 
                nom: record.get('nom') ? record.get('nom').toString() : null
              
            }));
        } finally {
            await session.close();
        }
    }
    
    
    
    async create(nom, age, ville, status, email, telephone, adresse) {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                CREATE (p:Personne {nom: $nom, age: $age, ville: $ville, status: $status, email: $email, telephone: $telephone, adresse: $adresse})
                RETURN id(p) as id
            `, { nom, age, ville, status, email, telephone, adresse });
            return result.records[0].get('id').toString();
        } finally {
            await session.close();
        }
    }

    async update(id, nom, age, ville, status, email, telephone, adresse) {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                MATCH (n:Personne)
                WHERE id(n) = toInteger($id)
                SET n.nom = $nom, n.age = $age, n.ville = $ville, n.status = $status, n.email = $email, n.telephone = $telephone, n.adresse = $adresse
                RETURN id(n) as id
            `, { id, nom, age, ville, status, email, telephone, adresse });
        
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
                MATCH (p:Personne {nom: $nom})
                OPTIONAL MATCH (p)-[r]->(relatedNode)
                RETURN id(p) as id, p.nom as nom, p.age as age, p.ville as ville, p.status as status,
                       collect({type: type(r), properties: properties(relatedNode)}) as relations
            `, { nom });
            return result.records.map(record => ({
                id: record.get('id').toString(),
                nom: record.get('nom').toString(),
                age: record.get('age').toString(),
                ville: record.get('ville').toString(),
                status: record.get('status').toString(),
                relations: record.get('relations').map(rel => ({
                    type: rel.type,
                    properties: rel.properties
                }))
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
                RETURN id(p) as id, p.nom as nom, p.age as age, p.ville as ville, p.status as status, p.email as email, p.telephone as telephone, p.adresse as adresse
            `, { id });
            return result.records.map(record => ({
                id: record.get('id').toString(),
                nom: record.get('nom') ? record.get('nom').toString() : null,
                age: record.get('age') ? record.get('age').toString() : null,
                ville: record.get('ville') ? record.get('ville').toString() : null,
                status: record.get('status') ? record.get('status').toString() : null,
                email: record.get('email') ? record.get('email').toString() : null,
                telephone: record.get('telephone') ? record.get('telephone').toString() : null,
                adresse: record.get('adresse') ? record.get('adresse').toString() : null
            }))[0];
        } finally {
            await session.close();
        }
    }

    async delete(id) {
        const session = this.driver.session();
        try {
            await session.run(`
                MATCH (n:Personne)
                WHERE id(n) = toInteger($id)
                DELETE n
            `, { id: neo4j.int(id) }); 
        } finally {
            await session.close();
        }
    }
}

module.exports = Personne;
