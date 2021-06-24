const express = require('express');
const multer = require('multer');
const upload = multer()

module.exports = function(app, apiRoot) {
    const core = apiRoot + "/filemetadata";

    app.use('/public', express.static(process.cwd() + '/File_Metadata/public'));
	app.get(core, function (req, res) {
		res.sendFile(process.cwd() + '/File_Metadata/views/index.html');
	});

    app.post(core + '/fileanalyse', upload.single('upfile'), (req, res)=>{
        res.json({
            name: req.file.originalname,
            type: req.file.mimetype,
            size: req.file.size
        });
    });
};
