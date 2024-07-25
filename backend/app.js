const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const neo4j = require('neo4j-driver');
const Personne = require('./models/Personne');
const Organization = require('./models/Organization');
const app = express();
const port = process.env.PORT || 5000;

const uri = 'bolt://localhost:7687';
const user = 'neo4j';
const password = '123456789';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const personne = new Personne(driver);
const organization = new Organization(driver);

app.use((req, res, next) => {
    req.models = {
        personne,
        organization
    };
    next();
});
app.use(express.json());
app.use(cors());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const indexRouter = require('./routes/index');
const nodeRouter = require('./routes/nodeRoutes');
const relationsRouter = require('./routes/relationRoutes');

app.use('/', indexRouter);
app.use('/nodes', nodeRouter);
app.use('/relations', relationsRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
