const neo4j = require('neo4j-driver');

class Organization {
    constructor(driver) {
        this.driver = driver;
    }

    async getAll(page = 0, limit = 10, name = '') {
        const session = this.driver.session();
        const offset = page * limit;
        let query = `
            MATCH (o:Organization)
            WHERE o.nom CONTAINS $name
            RETURN id(o) as id, o.nom as nom, o.ville as ville, o.adresse as adresse, o.email as email
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
                email: record.get('email') ? record.get('email').toString() : null
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
                RETURN id(o) as id, o.nom as nom, o.ville as ville, o.adresse as adresse, o.email as email
            `);

            return result.records.map(record => ({
                id: record.get('id').toString(),
                nom: record.get('nom') ? record.get('nom').toString() : null,
                ville: record.get('ville') ? record.get('ville').toString() : null,
                adresse: record.get('adresse') ? record.get('adresse').toString() : null,
                email: record.get('email') ? record.get('email').toString() : null
            }));
        } finally {
            await session.close();
        }
    }
    async create(nom, industry, adresse, email, telephone, siteWeb, ville) {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                CREATE (o:Organization {
                    nom: $nom, 
                    industry: $industry, 
                    adresse: $adresse, 
                    email: $email, 
                    telephone: $telephone, 
                    siteWeb: $siteWeb, 
                    ville: $ville
                })
                RETURN id(o) as id
            `, { nom, industry, adresse, email, telephone, siteWeb, ville });
    
            return result.records[0].get('id').toString();
        } finally {
            await session.close();
        }
    }
    

    async update(id, nom, industry, adresse, email, telephone, siteWeb, ville) {
        const session = this.driver.session();
        try {
            await session.run(`
                MATCH (o:Organization)
                WHERE id(o) = toInteger($id)
                SET o.nom = $nom, o.industry = $industry, o.adresse = $adresse, o.email = $email, o.telephone = $telephone, o.siteWeb = $siteWeb, o.ville = $ville
                RETURN o
            `, { id, nom, industry, adresse, email, telephone, siteWeb, ville });
        } finally {
            await session.close();
        }
    }
    
    

    async getByNom(nom) {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                MATCH (o:Organization {name: $nom})
                OPTIONAL MATCH (o)-[r]->(relatedNode)
                RETURN id(o) as id, o.name as name, o.industry as industry,
                       collect({type: type(r), properties: properties(relatedNode)}) as relations
            `, { nom });
            return result.records.map(record => ({
                id: record.get('id').toString(),
                nom: record.get('name').toString(),
                industry: record.get('industry').toString(),
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
                MATCH (o:Organization)
                WHERE id(o) = toInteger($id)
                RETURN id(o) as id, o.nom as nom, o.industry as industry, o.adresse as adresse, o.email as email, o.telephone as telephone, o.siteWeb as siteWeb, o.ville as ville
            `, { id });
            return result.records.map(record => ({
                id: record.get('id').toString(),
                nom: record.get('nom') ? record.get('nom').toString() : null,
                industry: record.get('industry') ? record.get('industry').toString() : null,
                adresse: record.get('adresse') ? record.get('adresse').toString() : null,
                email: record.get('email') ? record.get('email').toString() : null,
                telephone: record.get('telephone') ? record.get('telephone').toString() : null,
                siteWeb: record.get('siteWeb') ? record.get('siteWeb').toString() : null,
                ville: record.get('ville') ? record.get('ville').toString() : null
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
                WHERE id(o) = $id
                DELETE o
            `, { id: neo4j.int(id) });
        } finally {
            await session.close();
        }
    }
}

module.exports = Organization;
