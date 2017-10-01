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
    var body:any = document.getElementsByTagName('body')[0];
    body.classList = "";

    var loader:any = document.getElementsByClassName('loader')[0];
    loader.classList = "";
  }

  ngOnInit() {
    // observable to handle search on query with 200 delay
    this.searchAcronym.debounceTime(200).subscribe(()=> {
        this.results = this.fuseService.searchAcronym(this.query);
    });

    // get list of all files available for search
    this.http.get('/api/files').subscribe((resp: any) => {
      resp = JSON.parse(resp.text());
      if (resp.success) {
        this.files = resp.files;
      }

      // initialize the fuse api with the avialble files
      this.fuseService.init(this.files);

      // get categories by splitting the extension from file names
      this.getCategories();
      this.query = "STE";
      this.search();
    }, (error) => {
      console.log(error);
      this.fuseService.init(this.files);
    })
  }

  search(): void {
    // function call on changing query every time
  	this.searchAcronym.next();
  }

  fileUploaded(event): void {
    // function call whenever a new file is uploaded
    var file:any = event.srcElement.files[0];
    this.file = file;

    console.log("file selected", file);

    var form_data = new FormData();
    form_data.append('file', file, file.name);

    // check if file is valid to upload
    if(this.isValid(file)) {
      // send file to api to uplaod
      this.http.post('/api/upload', form_data)
        .subscribe((resp:any) => {
          resp = resp.json();
          
          var fileInput:any = document.getElementById("file-input");
          fileInput.value = "";

          this.file = {};

          // on successful upload update fuse api with the new file and also update categories
          // to include new file in categories list immediately

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
    // function checks if file is valid by splitting the extension
    // also checks if size is less than 20 MB
    // else show error

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
    // toggle advance filters option
    this.show_filters = !this.show_filters;
  }

  getCategories(): void {
    // get list of categories by splitting extension from file name

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
    // function call on select/unselect category
    // also include/exclude the category from fuse api search

    this.categories[index].selected = !this.categories[index].selected;
    this.fuseService.toggleFileInclusion(this.categories[index].file);
  }
}
