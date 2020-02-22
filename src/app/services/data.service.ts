import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { City, Feature, GeoJson, OpenWeatherInfo, PageData } from '../models/data';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  getTwCityBs: BehaviorSubject<City[]> = new BehaviorSubject([]);
  getTwCity$: Observable<City[]> = this.getTwCityBs.asObservable();

  pharmacysDataBs: BehaviorSubject<PageData> = new BehaviorSubject({} as PageData);
  pharmacysData$: Observable<PageData> = this.pharmacysDataBs.asObservable();

  loadingBS: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loading$: Observable<PageData> = this.pharmacysDataBs.asObservable();


  constructor(private httpClient: HttpClient) { }


  loadPharmaciesGeoJson() {
    return this.httpClient.get<GeoJson>(
      `https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json`
    ).pipe(tap(res => {
      // this.pharmacysDataBs.next(res);
    }));
  }



  loadPharmacys(index, size) {
    return this.httpClient.get<GeoJson>(
      `https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json`
    ).pipe(
      map(res => {
        const length = res && res.features ? res.features.length : 0;
        const startIndex = index * size;
        const endIndex = startIndex < length ?
          Math.min(startIndex + size, length) :
          startIndex + size;
        console.log(startIndex, endIndex);
        return {
          data: length !== 0 ? res.features.slice(startIndex, endIndex) : [],
          length
        } as PageData;
      }),
      tap(res => {
        console.log(res, index, size);
        this.pharmacysDataBs.next(res);
      })
    );
  }

  loadCitys() {
    return this.httpClient.get<City[]>(
      `assets/json/tw-city.json`
    ).pipe(
      tap(res => {
        console.log(res);
        this.getTwCityBs.next(res);
      })
    );
  }

}
