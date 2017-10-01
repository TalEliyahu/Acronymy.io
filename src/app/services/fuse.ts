import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable, ObservableInput } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import * as Fuse from 'fuse.js';

@Injectable()
export class FuseService {
	files: any[] = [];
	included_files: any[] = [];
	data: any[] = [];
	options: any = {};
	fuse: any;
	dir_path: string = "/api/json/";

	constructor (private http: Http) {
		// initialize fuse api options

		this.options = {
		  	shouldSort: true,
		  	threshold: 0,
		  	location: 0,
		  	distance: 100,
		  	maxPatternLength: 32,
		  	keys: [
		    	"key",
		    	"Key"
			]
		};
	}

	init(files: any[]): void {
		// set the files availabel for search
		this.files = files;
		this.included_files = files;
	}

	addNewFiles(files: any[]): void {
		// call whenever new file(s) are added to search
		if (files && files.length) {
			this.files = this.files.concat(files);
			this.included_files = this.included_files.concat(files);
		}
	}

	getDataFromJSON(file): Observable<any> {
		// get data from json for a specified file
		return this.http.get(this.dir_path+file)
				.map((resp: any) => {
					return resp.json()
				})
				.catch((err): ObservableInput<any> => {
					return Observable.throw(err);
				})
	}

	searchAcronym(query) {
		// search acronymn from all files included in search and create a result set to display
		var results = [];
		var categories = [];
		for ( var i = 0; i < this.included_files.length; i++) {
			var category = this.getCategory(this.included_files[i]);
			categories.push(category);

			this.getDataFromJSON(this.included_files[i]).subscribe((resp) => {
				this.fuse = new Fuse(resp, this.options);
				
				var result:any = {};
				result.category = '';
				result.result = this.fuse.search(query);

				results.push(result);
			})
		}

		console.log(results);
		return results;
	}

	getCategory(file): string {
      var category = file.split(".");
      category = category.slice(0, -1);
      return category[0];
  	}

  	toggleFileInclusion(file): void {
  		// include/exclude file if user select/unselect any category
  		var present = this.included_files.indexOf(file) > -1;
  		if (present) {
  			this.included_files = this.included_files.filter((next_file) => {
  				return next_file != file;
  			})
  		} else {
  			this.included_files.push(file);
  		}
  	}
}