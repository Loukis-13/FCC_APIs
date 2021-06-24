const express = require('express');

module.exports = (app, apiRoot) => {
	const core = apiRoot + "/timestamp";

	app.use('/public', express.static(process.cwd() + '/Timestamp_Microservice/public'));
	app.get(core, function (req, res) {
		res.sendFile(process.cwd() + '/Timestamp_Microservice/views/index.html');
	});

	app.get(core + "/now", function (req, res) {
		time = new Date;
		res.json({unix: time.getTime(), utc: time.toUTCString()});
	});

	app.get(core + "/:date", function (req, res) {
		if ( req.params['date'].match(/^\d+$/) ) {
			time = new Date;
			time.setTime(parseInt(req.params['date']));
		}
		else if ( req.params['date'].match(/\d{4}/) ) {
			time = new Date(req.params['date']);
		}
		else {
			res.json({error: "Invalid Date"});
		}

		res.json({unix: time.getTime(), utc: time.toUTCString()});
	});
};

