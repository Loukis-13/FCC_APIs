require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('url_db.db');

app.use(bodyParser.urlencoded({ extended: false }));
const cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));

app.use('/public', express.static(process.cwd() + '/public'));
app.get('/api', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

const apiRoot = "/api";

require("./Timestamp_Microservice/timestamp.js")(app, apiRoot);
require("./Header_Parser_Microservice/headerparser.js")(app, apiRoot);
require("./URL_Shortener/urlshortener.js")(app, apiRoot, db);
require("./Exercise_Tracker/exercise_tracker.js")(app, apiRoot);
require("./File_Metadata/filemetadata.js")(app, apiRoot);

// Show endpoints
// for (let i of app._router.stack) if (i.route && i.route.path) console.log(i.route.stack[0].method.toUpperCase(), i.route.path)

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Your app is listening on port ' + port)
});
