const express = require('express');

module.exports = function(app, apiRoot) {
    const core = apiRoot + "/headerparser";

    app.use('/public', express.static(process.cwd() + '/Header_Parser_Microservice/public'));
	app.get(core, function (req, res) {
		res.sendFile(process.cwd() + '/Header_Parser_Microservice/views/index.html');
	});

    app.get(core + "/whoami", function (req, res) {
        res.json({
            ipaddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            language:  req.headers["accept-language"],
            software:  req.headers["user-agent"]
        });
    });
}
