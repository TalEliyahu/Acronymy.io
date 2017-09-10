import { Component } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { FuseService } from './services/fuse';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
	query: string = "";
  results: any[] = [];
  searchAcronym = new Subject<string>();

  constructor( private fuseService: FuseService ) {
  	this.fuseService.init();

  	this.searchAcronym.debounceTime(200).subscribe(()=> {
        this.results = this.fuseService.searchAcronym(this.query);
    });
  }

  search(): void {
  	this.searchAcronym.next();
  }

  fileChange(event): void {
  	
  }
}
