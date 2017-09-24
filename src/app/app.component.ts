import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { FuseService } from './services/fuse';
import { XlsxToJsonService } from './services/xls';
import { PapaParseService } from 'ngx-papaparse';

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

  constructor( private fuseService: FuseService, private http: Http,  private csvParser: PapaParseService, private xlsParser: XlsxToJsonService ) {

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
        .subscribe(resp => {
          console.log("API response", resp);
          console.log("i am here");
        })

      // var context = this;
      // var reader = new FileReader();
      // reader.onload = function (event) {
      //   context.readFile(event, context);
      // };
      // reader.onprogress = this.updateProgress;
      // reader.onerror = this.onError;
      // reader.readAsBinaryString(file);

    }
  }

  // readFile(event, context): void {  
  //   var data:any = event.target;
  //   data = data.result;

  //   var json_data = null;

  //   switch (context.extension) {
  //     case 'json':
  //       if (this.isValidJSON(data)) {
  //         json_data = JSON.parse(data);
  //       } 
  //       break;
  //     case 'csv':
  //         this.csvParser.parse(data, {
  //           header: true,
  //           skipEmptyLines: true,
  //           fastMode: true,
  //           complete: (results, file) => {
  //             console.log('parsed', results, file);
  //             // console.log(JSON.stringify(results.data));
  //           },
  //           error: (error, file) => {
  //             console.log(error, file);
  //             alert (error);
  //           }
  //         })
  //       break;
  //     case 'xlsx':
  //       this.xlsParser.processFileToJson({}, this.file).subscribe(data => {
  //         console.log("xls data", data);
  //       })
  //       break;
  //   }

  //   console.log(json_data);
  // }

  // updateProgress(event): void {
  //   if (event.lengthComputable) {
  //     var progress = Math.round((event.loaded / event.total) * 100); 
  //     this.progress = progress + '%';
  //   }
  // }

  // onError(event): void {
  //   console.log(event);
  //   alert(event);
  // }
  
  // isValidJSON(data): boolean {
  //   try {
  //     JSON.parse(data);
  //   } catch(evt) {
  //     return false;
  //   }
  //   return true;
  // }

  isValid(file): boolean {
    var valid = true;
    var validTypes = ['json', 'csv', 'xlsx'];
    var name = file.name;
    var ext = name.split('.');
    this.extension = ext[1];

    this.error = '';
    if (file.size > 20971520) {
      this.error = 'File size is more than 20 MB';
      valid = false;
    } else if(validTypes.indexOf(this.extension) < 0) {
      this.error = 'File type not allowed';
      false;
    }

    return valid;
  }

  toggleFilters(): void {
    this.show_filters = !this.show_filters;
  }

  getCategories(): void {
    for (var i = 0; i< this.files.length; i++) {
      var category = this.files[i].split(".");
      category = category.slice(0, -1);
      this.categories.push(category);
    }
  }
}
