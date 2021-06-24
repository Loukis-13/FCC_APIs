const dns = require('dns');
const url = require('url'); 

const express = require('express');



module.exports = function(app, apiRoot, db) {
    const core = apiRoot + "/urlshortener";

    app.use('/public', express.static(process.cwd() + '/URL_Shortener/public'));
	app.get(core, function (req, res) {
		res.sendFile(process.cwd() + '/URL_Shortener/views/index.html');
	});

    app.post(core + '/shorturl', function(req, res) {
        if (!req.body.url || req.body.url === "") req.body.url="https://loukis-13.github.io/"
    
        dns.lookup(url.parse(req.body.url).hostname, (err, address, family) => {
            if (!address) {
                res.json({error: 'invalid url'});
            }
            else {
                db.get("SELECT url, rowid id FROM sites WHERE url=?", req.body.url, (err, row)=>{
                    if (row) res.json({ original_url: row.url, short_url: row.id });
                    else {
                        db.run("INSERT INTO sites VALUES (?)", req.body.url, (err, row) => {
                            db.get("SELECT url, rowid id FROM sites WHERE url=?", req.body.url, (err, row)=>{
                                res.json({ original_url: row.url, short_url: row.id });
                            });
                        });
                    };
                });
            };
        });
    });
      
    app.get(core + '/shorturl/:short', function(req, res) {
        db.get("SELECT url FROM sites WHERE rowid=?", req.params.short, (err, row)=>{
            if (row) res.redirect(row.url);
            else res.json({error:	"No short URL found for the given input"});
        });
    });
}