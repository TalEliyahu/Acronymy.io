import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable, ObservableInput } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import * as Fuse from 'fuse.js';

@Injectable()
export class FuseService {
	data: any[] = [];
	options: any = {};
	fuse: any;

	constructor (private http: Http) {
		this.options = {
		  	shouldSort: true,
		  	threshold: 0.6,
		  	location: 0,
		  	distance: 100,
		  	maxPatternLength: 32,
		  	minMatchCharLength: 1,
		  	keys: [
		    	"title",
		    	"author.firstName"
			]
		};
	}

	init(): void {
		this.getDataFromJSON().subscribe(
			resp => {
				this.data = resp;
				this.fuse = new Fuse(resp, this.options);
			}, 
			error => {

			}
		);
	}

	getDataFromJSON(): Observable<any> {
		return this.http.get("./assets/data.json")
				.map((resp: any) => {
					return resp.json()
				})
				.catch((err): ObservableInput<any> => {
					return Observable.throw(err.json());
				})
	}

	searchAcronym(query) {
		var results = this.fuse.search(query);
		return results;
	}
}