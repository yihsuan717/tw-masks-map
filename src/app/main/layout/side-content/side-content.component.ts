import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { City, Feature } from 'src/app/models/data';

@Component({
  selector: 'side-content',
  templateUrl: './side-content.component.html',
  styleUrls: ['./side-content.component.scss']
})
export class SideContentComponent implements OnInit {

  searchForm: FormGroup;

  getTwCity$: Observable<City[]>;
  pharmacys$: Observable<Feature[]>;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) {
    this.searchForm = this.formBuilder.group({
      search: '',
    });

    this.getTwCity$ = this.dataService.getTwCity$;
    this.pharmacys$ = this.dataService.pharmacys$;
  }


  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.dataService.loadPharmacyData();
    this.dataService.loadCity();
  }

}
