const express = require('express');
const path = require("path");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const csv = require('csvtojson');
var excel2json = require('convert-excel-to-json');

var upload_dir = './uploads';
var save_dir = './src/json';
var root_dir = path.dirname(require.main.filename);

var upload = multer({dest: upload_dir});

router.get('/json/:file', (req, res) => {
	var file = req.params.file;
	res.sendFile(path.join(__dirname, "../../", save_dir+"/"+file));
})

router.get('/files', (req, res) => {
	fs.readdir(save_dir, (error, files) => {
		if(error) {
			res.status(200).send({'success': false});
		} else {
			res.status(200).send({'success': true, 'files': files});
		}
	})
})

router.post('/upload', upload.single('file'), (req, res) => {
	console.log(req.file);
	readFile(req.file).then( function (data) {
		writeFile(req.file, data).then( () => {
			deleteUploadedFile(req.file);
			res.status(200).send({success : true});
		}).catch((error) => {
			res.status(200).send({success: false});
		});
	}, function (error) {
		res.status(200).send({success: false});
	})
})

module.exports = router;

function deleteUploadedFile(file) {
	fs.unlink(file.path);
}

function writeFile(file, data) {
	return new Promise((resolve, reject) => {
		var path = save_dir+"/"+getFileName(file.originalname)+".json";
		fs.writeFile(path, data, function (error) {
			if (error) {
				console.log("write error", error);
				reject(error);
			}
			resolve();
		})
	})
}

function readFile(file) {
	return new Promise((resolve, reject) => {
		var ext = getFileExtension(file.originalname);
		switch (ext) {
			case 'json':
				parseJSON(file.path, resolve, reject);
				break;
			case 'csv':
				parseCSV(file.path, resolve, reject);
				break;
			case 'xlsx':
				parseXLSX(file.path, resolve, reject);
				break;
		}
	})
}

function getFileExtension(filename) {
	var ext = filename.split(".");
	ext = ext[ext.length-1];
	return ext;
}

function getFileName(filename) {
	var name = filename.split(".");
	name = name.slice(0, -1);
	return name;
}

function parseJSON(path, resolve, reject) {
	fs.readFile(path, 'utf8', function (error, result) {
		if (error) {
			console.log('JSON error', error)
			reject();
		}
		resolve(result);
		// return result;
	})
}

function parseCSV(path, resolve, reject) {
	var data = [];
	csv().fromFile(path)
		.on('json', (result) => {
			data.push(result);
		})
		.on('done', (error) => {
			if (error) {
				reject(error)
				console.log('CSV error', error);
			}
			resolve(JSON.stringify(data))
		})
}

function parseXLSX(path, resolve, reject) {
	var result = excel2json({
		sourceFile: path,
		header: { rows: 1 },
		columnToKey: {
			'A': '{{A1}}',
			'B': '{{B1}}',
			'C': '{{C1}}',
			'D': '{{D1}}',
			'E': '{{E1}}',
			'F': '{{F1}}'
		}
	})

	if (result) {
		var data = [];
		for (var key in result) {
			data = data.concat(result[key]);
		}
		result = data;
	}

	resolve(JSON.stringify(result));
}