const express = require('express');
const path = require("path");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const csv = require('csvtojson');
var excel2json = require('convert-excel-to-json');
var decompressZip = require('decompress-zip');
var FileAPI = require('file-api');
var File = FileAPI.File;

var upload_dir = './uploads';
var save_dir = './src/json';
var root_dir = path.dirname(require.main.filename);

var upload = multer({dest: upload_dir});

// get a json file 
router.get('/json/:file', (req, res) => {
	var file = req.params.file;
	res.sendFile(path.join(__dirname, "../../", save_dir+"/"+file));
})

// get list of all files available for search 
router.get('/files', (req, res) => {
	fs.readdir(save_dir, (error, files) => {
		if(error) {
			res.status(200).send({'success': false});
		} else {
			res.status(200).send({'success': true, 'files': files});
		}
	})
})

// upload a new file 
router.post('/upload', upload.single('file'), (req, res) => {
	console.log(req.file);
	getFiles().then(files => {
		readFile(req.file).then( function (result) {
			var data = result.data;

			if (req.file.mimetype == "application/zip") {
				getNewlyUploads(files).then(new_files => {
					res.status(200).send({success : true, files: new_files});
				});
			} else {
				writeFile(req.file, data).then( () => {
					deleteUploadedFile(req.file);
					getNewlyUploads(files).then(new_files => {
						res.status(200).send({success : true, files: new_files});
					});
				}).catch((error) => {
					res.status(200).send({success: false});
				});
			}
		}, function (error) {
			res.status(200).send({success: false});
		})
	});
})

module.exports = router;

//delete uploaded file
function deleteUploadedFile(file) {
	fs.unlink(file.path, function(error) {
		if(error){  
			console.log(error);
		}
	});
}

// write data on file
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

// read file and return data
function readFile(file, zip) {
	return new Promise((resolve, reject) => {
		var ext = getFileExtension(file.originalname);
		switch (ext) {
			case 'json':
				parseJSON(file, resolve, reject);
				break;
			case 'csv':
				parseCSV(file, resolve, reject);
				break;
			case 'xlsx':
				parseXLSX(file, resolve, reject);
				break;
			case 'zip':
				parseZip(file, resolve, reject);
		}
	})
}

// get file extension
function getFileExtension(filename) {
	var ext = filename.split(".");
	ext = ext[ext.length-1];
	return ext;
}

// get file name
function getFileName(filename) {
	var name = filename.split(".");
	name = name.slice(0, -1);
	return name;
}

// parse json file data 
function parseJSON(file, resolve, reject) {
	var path = file.path;

	fs.readFile(path, 'utf8', function (error, result) {
		if (error) {
			console.log('JSON error', error)
			reject();
		}
		resolve({"file": file, "data": result});
		// return result;
	})
}

// parse csv file data
function parseCSV(file, resolve, reject) {
	var path = file.path;

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
			resolve({"file": file, "data": JSON.stringify(data)});
		})
}

// parse xlsx file data
function parseXLSX(file, resolve, reject) {
	var path = file.path;

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

	resolve({"file": file, "data": JSON.stringify(result)});
}

// parse zip file data
function parseZip(file, resolve, reject) {
	var path = file.path;

	var unzipper = new decompressZip(path);

	unzipper.on("error", (error) => {
		console.log("zip error", error);
	})

	unzipper.on("extract", (uploaded_files) => {
		var count = 0;
		for(var i=0; i<uploaded_files.length; i++) {
			var up_file = uploaded_files[i].deflated;
			up_file = up_file.split("/");
			up_file = up_file[up_file.length-1];

			var file_path = upload_dir+"/"+uploaded_files[i].deflated;
			var new_file = new File(file_path);
			new_file.originalname = up_file;

			readFile(new_file).then( function (result) {
				var file1 = result.file;
				var data = result.data;

				writeFile(file1, data).then(() => {
					deleteUploadedFile(file1);
					count++;
					if (count == uploaded_files.length) {
						deleteUploadedFile(file);
						resolve({});
					}
				}, error => {
					count++;

					if (count == uploaded_files.length) {
						reject();
					}
				})
			})
		}
	})

	unzipper.extract({
		path: upload_dir,
		filter: function (file) {
			var valid_ext = ["json", "csv", "xlsx"];
			var ext = getFileExtension(file.filename);
			return valid_ext.indexOf(ext) > -1;
		}
	})
} 

// get files list in directory
function getFiles() {
	return new Promise((resolve, rejct) => {
		fs.readdir(save_dir, (error, files) => {
			if (error) {
				reject();
			} else {
				resolve(files);
			}
		})
	})
}


// get files that are newly uploaded
function getNewlyUploads(old_files) {
	return new Promise((resolve, reject) => {
		getFiles().then(all_files => {
			var new_files = all_files.filter((file) => {
				return old_files.indexOf(file) < 0;
			})
			resolve(new_files);
		})
	})
}