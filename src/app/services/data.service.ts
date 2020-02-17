import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { City, Feature, Data } from '../models/data';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  getTwCityBs: BehaviorSubject<City[]> = new BehaviorSubject([]);
  getTwCity$: Observable<City[]> = this.getTwCityBs.asObservable();

  pharmacysBs: BehaviorSubject<Feature[]> = new BehaviorSubject([]);
  pharmacys$: Observable<Feature[]> = this.pharmacysBs.asObservable();


  constructor(private httpClient: HttpClient) { }

  loadPharmacyData() {
    this.httpClient.get<Data>(
      `https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json`
    ).subscribe(
      res => {
        console.log(res);
        this.pharmacysBs.next(res && res.features && res.features.length ? res.features : []);
      }
    );
  }

  loadCity() {
    this.httpClient.get<City[]>(
      `assets/json/tw-city.json`
    ).subscribe(
      res => {
        this.getTwCityBs.next(res);
      }
    );
  }
}
