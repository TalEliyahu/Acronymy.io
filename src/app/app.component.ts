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
  file: any; 
  progress: string = '';
  error: string = '';
  extension: string = '';

  constructor( private fuseService: FuseService ) {
  	this.fuseService.init();

  	this.searchAcronym.debounceTime(200).subscribe(()=> {
        this.results = this.fuseService.searchAcronym(this.query);
    });
  }

  search(): void {
  	this.searchAcronym.next();
  }

  fileUploaded(event): void {
    var file = event.srcElement.files[0];
    if(this.isValid(file)) {
      var reader = new FileReader();
      reader.onload = this.readFile;
      reader.onprogress = this.updateProgress;
      reader.onerror = this.onError;
      reader.readAsText(file);
    }
  }

  readFile(event): void {  
    var data:any = event.target;
    data = data.result;

    switch (this.extension) {
      case 'json':
        if (this.isValidJSON(data)) {

        } 
        break;
      case 'csv':
        
        break;
    }
  }

  updateProgress(event): void {
    if (event.lengthComputable) {
      var progress = Math.round((event.loaded / event.total) * 100); 
      this.progress = progress + '%';
    }
  }

  onError(event): void {

  }

  isValid(file): boolean {
    var valid = true;
    var validTypes = ['json', 'csv', 'xlxs'];
    var name = file.name;
    var ext = name.split('.');
    this.extension = ext[1];

    this.error = '';
    if (file.size > 20480) {
      this.error = 'File size is more than 20 MB';
      valid = false;
    } else if(validTypes.indexOf(this.extension) < 0) {
      this.error = 'File type not allowed';
      false;
    }

    return valid;
  }

  isValidJSON(data): boolean {
    try {
      JSON.parse(data);
    } catch(evt) {
      return false;
    }
    return true;
  }
}
