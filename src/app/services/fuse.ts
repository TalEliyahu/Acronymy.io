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

		// this.categories = [ "data", "data1", "data2", "current-full" ];
	}

	init(files: any[]): void {
		this.files = files;
		this.included_files = files;
		// this.getDataFromJSON().subscribe(
		// 	resp => {
		// 		this.data = resp;
		// 		this.fuse = new Fuse(resp, this.options);
		// 	}, 
		// 	error => {

		// 	}
		// );
	}

	addNewFiles(files: any[]): void {
		if (files && files.length) {
			this.files = this.files.concat(files);
			this.included_files = this.included_files.concat(files);
		}
	}

	getDataFromJSON(file): Observable<any> {
		return this.http.get(this.dir_path+file)
				.map((resp: any) => {
					return resp.json()
				})
				.catch((err): ObservableInput<any> => {
					return Observable.throw(err);
				})
	}

	searchAcronym(query) {
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