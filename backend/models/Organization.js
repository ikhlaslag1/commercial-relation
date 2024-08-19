const neo4j = require('neo4j-driver');
const xlsx = require('xlsx');
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

    async withSession(callback) {
        const session = this.driver.session();
        try {
            return await callback(session);
        } finally {
            await session.close();
        }
    }

    async getAll(page = 0, limit = 10, name = '', ville = '', adresse = '', industry = '') {
        return this.withSession(async session => {
            const offset = page * limit;
            const query = `
                MATCH (o:Organization)
                WHERE 
                    ($name = '' OR toLower(o.nom) CONTAINS toLower($name)) AND
                    ($ville = '' OR toLower(o.ville) CONTAINS toLower($ville)) AND
                    ($adresse = '' OR toLower(o.adresse) CONTAINS toLower($adresse)) AND
                    ($industry = '' OR toLower(o.industry) CONTAINS toLower($industry))
                RETURN id(o) as id, o.nom as nom, o.ville as ville, o.adresse as adresse, o.email as email, o.industry as industry, o.telephone as telephone, o.siteWeb as siteWeb,
                       o.createdAt as createdAt, o.updatedAt as updatedAt, o.uuid as uuid
                SKIP $offset LIMIT $limit
            `;
    
            const result = await session.run(query, {
                name,
                ville,
                adresse,
                industry,
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
                WHERE 
                    ($name = '' OR toLower(o.nom) CONTAINS toLower($name)) AND
                    ($ville = '' OR toLower(o.ville) CONTAINS toLower($ville)) AND
                    ($adresse = '' OR toLower(o.adresse) CONTAINS toLower($adresse)) AND
                    ($industry = '' OR toLower(o.industry) CONTAINS toLower($industry))
                RETURN count(o) as total
            `, { name, ville, adresse, industry });
    
            const total = countResult.records[0].get('total').toNumber();
    
            return { organizations, total };
        });
    }

    async getAllOrganizations() {
        return this.withSession(async session => {
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
        });
    }

    async create(nom, industry, adresse, email, telephone, siteWeb, ville) {
        return this.withSession(async session => {
            const currentTime = new Date().toISOString();
            const uuid = uuidv4(); 
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
        });
    }

    async importOrganizationsFromExcel(filePath) {
        return this.withSession(async session => {
            // Read the Excel file
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);
            const currentTime = new Date().toISOString();
            // Loop through each record in the Excel data
            for (const record of data) {
                const {
                    nom,
                    industry,
                    adresse,
                    email,
                    telephone,
                    siteWeb,
                    ville,
                    createdAt,
                    updatedAt,
                } = record;
    
                const uuid = uuidv4();
                const formattedCreatedAt = this.formatDate(createdAt || currentTime);
                const formattedUpdatedAt = this.formatDate(updatedAt || currentTime);

                // Create or update Organization node based on email
                await session.run(`
                    MERGE (o:Organization {email: $email})
                    SET o.uuid = $uuid,
                        o.nom = $nom,
                        o.industry = $industry,
                        o.adresse = $adresse,
                        o.telephone = $telephone,
                        o.siteWeb = $siteWeb,
                        o.ville = $ville,
                        o.createdAt = $createdAt,
                        o.updatedAt = $updatedAt
                `, {
                    uuid,
                    nom,
                    industry,
                    adresse,
                    email,
                    telephone,
                    siteWeb,
                    ville,
                    createdAt: formattedCreatedAt,
                    updatedAt: formattedUpdatedAt
                });
            }
    
            console.log('Data import complete.');
        });
    }
    

    async update(id, nom, industry, adresse, email, telephone, siteWeb, ville) {
        return this.withSession(async session => {
            const currentTime = new Date().toISOString();
            await session.run(`
                MATCH (o:Organization) WHERE id(o) = $id
                SET o.nom = $nom, 
                    o.industry = $industry, 
                    o.adresse = $adresse, 
                    o.email = $email, 
                    o.telephone = $telephone, 
                    o.siteWeb = $siteWeb, 
                    o.ville = $ville,
                    o.updatedAt = $currentTime
            `, { id: neo4j.int(id), nom, industry, adresse, email, telephone, siteWeb, ville, currentTime });
        });
    }

    async getByNom(nom) {
        return this.withSession(async session => {
            const result = await session.run(`
                MATCH (o:Organization) WHERE toLower(o.nom) CONTAINS toLower($nom)
                RETURN id(o) as id, o.nom as nom, o.ville as ville, o.adresse as adresse, o.email as email, o.industry as industry, o.telephone as telephone, o.siteWeb as siteWeb,
                  o.createdAt as createdAt, o.updatedAt as updatedAt, o.uuid as uuid
            `, { nom });
    
            return result.records.map(record => ({
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
        });
    }

    async getById(id) {
        return this.withSession(async session => {
            const result = await session.run(`
                MATCH (o:Organization) WHERE id(o) = $id
                RETURN id(o) as id, o.nom as nom, o.ville as ville, o.adresse as adresse, o.email as email, o.industry as industry, o.telephone as telephone, o.siteWeb as siteWeb
            `, { id: neo4j.int(id) });
    
            const record = result.records[0];
            if (record) {
                return {
                    id: record.get('id').toString(),
                    nom: record.get('nom') ? record.get('nom').toString() : null,
                    ville: record.get('ville') ? record.get('ville').toString() : null,
                    adresse: record.get('adresse') ? record.get('adresse').toString() : null,
                    industry: record.get('industry') ? record.get('industry').toString() : null,
                    email: record.get('email') ? record.get('email').toString() : null,
                    telephone: record.get('telephone') ? record.get('telephone').toString() : null,
                    siteWeb: record.get('siteWeb') ? record.get('siteWeb').toString() : null
                };
            }
            return null;
        });
    }

    async delete(id) {
        return this.withSession(async session => {
            await this.deleteOrgRelationships(id);
            await session.run(`
                MATCH (o:Organization) WHERE id(o) = $id
                DELETE o
            `, { id: neo4j.int(id) });
        });
    }

    async deleteOrgRelationships(nodeId) {
        return this.withSession(async session => {
            await session.run(`
                MATCH (o:Organization)-[r]-()
                WHERE id(o) = $nodeId
                DELETE r
            `, { nodeId: neo4j.int(nodeId) });
        });
    }

    async checkRelationships(id) {
        return this.withSession(async session => {
            const result = await session.run(`
                MATCH (o:Organization)-[r]-()
                WHERE id(o) = $id
                RETURN COUNT(r) AS count
            `, { id: neo4j.int(id) });
    
            return result.records[0].get('count').toNumber() > 0;
        });
    }
}

module.exports = Organization;
