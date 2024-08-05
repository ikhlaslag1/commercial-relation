const neo4j = require('neo4j-driver');
const { v4: uuidv4 } = require('uuid');

class Organization {
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

    async getAll(page = 0, limit = 10, name = '') {
        const session = this.driver.session();
        const offset = page * limit;
        let query = `
            MATCH (o:Organization)
            WHERE o.nom CONTAINS $name
            RETURN id(o) as id, o.nom as nom, o.ville as ville, o.adresse as adresse, o.email as email, o.industry as industry, o.telephone as telephone, o.siteWeb as siteWeb,
                   o.createdAt as createdAt, o.updatedAt as updatedAt, o.uuid as uuid
            SKIP $offset LIMIT $limit
        `;
        try {
            const result = await session.run(query, {
                name,
                offset: neo4j.int(offset),
                limit: neo4j.int(limit)
            });

            const organizations = result.records.map(record => ({
                id: record.get('id').toString(),
                nom: record.get('nom') ? record.get('nom').toString() : null,
                ville: record.get('ville') ? record.get('ville').toString() : null,
                adresse: record.get('adresse') ? record.get('adresse').toString() : null,
                industry: record.get('industry') ? record.get('industry').toString() : null,
                email: record.get('email') ? record.get('email').toString() : null,
                telephone: record.get('telephone') ? record.get('telephone').toString() : null,
                siteWeb: record.get('siteWeb') ? record.get('siteWeb').toString() : null,
                createdAt: this.formatDate(record.get('createdAt') ? record.get('createdAt').toString() : null),
                updatedAt: this.formatDate(record.get('updatedAt') ? record.get('updatedAt').toString() : null),
                uuid: record.get('uuid') ? record.get('uuid').toString() : null
            }));

            const countResult = await session.run(`
                MATCH (o:Organization)
                WHERE o.nom CONTAINS $name
                RETURN count(o) as total
            `, { name });

            const total = countResult.records[0].get('total').toNumber();

            return { organizations, total };
        } finally {
            await session.close();
        }
    }

    async getAllOrganizations() {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                MATCH (o:Organization)
                RETURN id(o) as id, o.nom as nom, o.ville as ville, o.adresse as adresse, o.email as email, o.uuid as uuid
            `);

            return result.records.map(record => ({
                id: record.get('id').toString(),
                nom: record.get('nom') ? record.get('nom').toString() : null,
                ville: record.get('ville') ? record.get('ville').toString() : null,
                adresse: record.get('adresse') ? record.get('adresse').toString() : null,
                email: record.get('email') ? record.get('email').toString() : null,
                uuid: record.get('uuid') ? record.get('uuid').toString() : null
            }));
        } finally {
            await session.close();
        }
    }

    async create(nom, industry, adresse, email, telephone, siteWeb, ville) {
        const session = this.driver.session();
        const currentTime = new Date().toISOString();
        const uuid = uuidv4(); // Générer un UUID
        try {
            const result = await session.run(`
                CREATE (o:Organization {
                    uuid: $uuid,
                    nom: $nom, 
                    industry: $industry, 
                    adresse: $adresse, 
                    email: $email, 
                    telephone: $telephone, 
                    siteWeb: $siteWeb, 
                    ville: $ville,
                    createdAt: $currentTime, updatedAt: $currentTime
                })
                RETURN id(o) as id
            `, { uuid, nom, industry, adresse, email, telephone, siteWeb, ville, currentTime });
    
            return result.records[0].get('id').toString();
        } finally {
            await session.close();
        }
    }

    async update(id, nom, industry, adresse, email, telephone, siteWeb, ville) {
        const session = this.driver.session();
        const currentTime = new Date().toISOString();
        try {
            await session.run(`
                MATCH (o:Organization)
                WHERE id(o) = toInteger($id)
                SET o.nom = $nom, o.industry = $industry, o.adresse = $adresse, o.email = $email, o.telephone = $telephone, o.siteWeb = $siteWeb, o.ville = $ville, o.updatedAt = $currentTime
                RETURN o
            `, { id, nom, industry, adresse, email, telephone, siteWeb, ville, currentTime });
        } finally {
            await session.close();
        }
    }

    async getByNom(nom) {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                MATCH (o:Organization)
                WHERE toLower(o.nom) CONTAINS toLower($nom)
                RETURN id(o) as id, o.nom as nom, o.ville as ville, o.adresse as adresse, o.email as email, o.industry as industry, o.telephone as telephone, o.siteWeb as siteWeb,
                       o.createdAt as createdAt, o.updatedAt as updatedAt, o.uuid as uuid
            `, { nom });
            
            return result.records.map(record => ({
                id: record.get('id') ? record.get('id').toString() : null,
                nom: record.get('nom') ? record.get('nom').toString() : null,
                ville: record.get('ville') ? record.get('ville').toString() : null,
                adresse: record.get('adresse') ? record.get('adresse').toString() : null,
                industry: record.get('industry') ? record.get('industry').toString() : null,
                email: record.get('email') ? record.get('email').toString() : null,
                telephone: record.get('telephone') ? record.get('telephone').toString() : null,
                siteWeb: record.get('siteWeb') ? record.get('siteWeb').toString() : null,
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
                MATCH (o:Organization)
                WHERE id(o) = toInteger($id)
                RETURN id(o) as id, o.nom as nom, o.industry as industry, o.adresse as adresse, o.email as email, o.telephone as telephone, o.siteWeb as siteWeb, o.ville as ville,
                       o.createdAt as createdAt, o.updatedAt as updatedAt, o.uuid as uuid
            `, { id });
            return result.records.map(record => ({
                id: record.get('id').toString(),
                nom: record.get('nom') ? record.get('nom').toString() : null,
                industry: record.get('industry') ? record.get('industry').toString() : null,
                adresse: record.get('adresse') ? record.get('adresse').toString() : null,
                email: record.get('email') ? record.get('email').toString() : null,
                telephone: record.get('telephone') ? record.get('telephone').toString() : null,
                siteWeb: record.get('siteWeb') ? record.get('siteWeb').toString() : null,
                ville: record.get('ville') ? record.get('ville').toString() : null,
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
            await session.run(`
                MATCH (o:Organization)
                WHERE id(o) = toInteger($id)
                DELETE o
            `, { id: neo4j.int(id) });
        } finally {
            await session.close();
        }
    }

    async deleteOrgRelationships(nodeId) {
        const session = this.driver.session();
        const query = `
            MATCH (p:Organization)-[r]-(others)
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
                MATCH (o:Organization)
                WHERE id(o) = toInteger($id)
                OPTIONAL MATCH (o)-[r]->(others)  
                OPTIONAL MATCH (o)<-[r]-(others)  
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

module.exports = Organization;
