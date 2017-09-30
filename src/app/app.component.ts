import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { FuseService } from './services/fuse';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
	query: string = "";
  results: any[] = [];
  searchAcronym = new Subject<string>();
  file: any; 
  progress: string = '';
  error: string = '';
  extension: string = '';
  show_filters: boolean = false;
  files: any[] = [];
  categories: any[] = [];

  constructor( private fuseService: FuseService, private http: Http ) {

  }

  ngOnInit() {
    this.searchAcronym.debounceTime(200).subscribe(()=> {
        this.results = this.fuseService.searchAcronym(this.query);
    });

    this.http.get('/api/files').subscribe((resp: any) => {
      resp = JSON.parse(resp.text());
      if (resp.success) {
        this.files = resp.files;
      }
      this.fuseService.init(this.files);
      this.getCategories();
    }, (error) => {
      console.log(error);
      this.fuseService.init(this.files);
    })
  }

  search(): void {
  	this.searchAcronym.next();
  }

  fileUploaded(event): void {
    var file:any = event.srcElement.files[0];
    this.file = file;

    console.log("file selected", file);

    var form_data = new FormData();
    form_data.append('file', file, file.name);

    if(this.isValid(file)) {
      this.http.post('/api/upload', form_data)
        .subscribe((resp:any) => {
          resp = resp.json();
          
          var fileInput:any = document.getElementById("file-input");
          fileInput.value = "";

          if(resp.success && resp.files && resp.files.length) {
            this.fuseService.addNewFiles(resp.files);
            this.files = this.files.concat(resp.files);
            this.getCategories();
          }
          console.log("API response", resp);
          console.log("i am here");
        })
    }
  }

  isValid(file): boolean {
    var valid = true;
    var validTypes = ['json', 'csv', 'xlsx', 'zip'];
    var name = file.name;
    var ext = name.split('.');
    this.extension = ext[1];

    this.error = '';
    if (file.size > 20971520) {
      this.error = 'File size is more than 20 MB';
      valid = false;
    } else if(validTypes.indexOf(this.extension) < 0) {
      this.error = 'File type not allowed';
      valid = false;
    }

    return valid;
  }

  toggleFilters(): void {
    this.show_filters = !this.show_filters;
  }

  getCategories(): void {
    this.categories = [];
    for (var i = 0; i< this.files.length; i++) {
      var name = this.files[i].split(".");
      name = name.slice(0, -1);

      this.categories.push({
        "name": name,
        "selected": true,
        "file": this.files[i]
      });
    }
  }

  toggleCategorySelection(index): void {
    this.categories[index].selected = !this.categories[index].selected;
    this.fuseService.toggleFileInclusion(this.categories[index].file);
  }
}
