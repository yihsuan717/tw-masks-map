import { latLng } from 'leaflet';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Feature, PageData, PharmaciesGeoJson } from '../models/data';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private pharmaciesGeoJsonUrl = 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json';
  private fakePharmaciesGeoJsonUrl = 'assets/json/points.json';

  // getTwCityBs: BehaviorSubject<City[]> = new BehaviorSubject([]);
  // getTwCity$: Observable<City[]> = this.getTwCityBs.asObservable();

  private loadingBS: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loading$: Observable<boolean> = this.loadingBS.asObservable();

  private pharmacyIdBs: BehaviorSubject<string> = new BehaviorSubject(null);
  public pharmacyId$: Observable<string> = this.pharmacyIdBs.asObservable();

  protected allPharmacysData: Array<any | Feature> = [];
  public allpharmacysDataLength: number = this.allPharmacysData.length;
  private allpharmacysDataBs: BehaviorSubject<PharmaciesGeoJson> = new BehaviorSubject(null);
  public allpharmacysData$: Observable<PharmaciesGeoJson> = this.allpharmacysDataBs.asObservable();


  constructor(private httpClient: HttpClient) { }


  loadPharmaciesGeoJson() {
    this.loadingBS.next(true);
    this.httpClient.get<PharmaciesGeoJson>(
      this.pharmaciesGeoJsonUrl,
    ).pipe(tap(geoJson => {
      console.log('PharmaciesGeoJson: ', geoJson);
      this.allPharmacysData = geoJson && geoJson.features && geoJson.features ? geoJson.features : [];
      this.allpharmacysDataBs.next(geoJson);
    })).subscribe(
      done => {
        this.loadingBS.next(false);
      }, error => this.loadingBS.next(false)
    );
  }

  setPharmacyId(id) {
    this.pharmacyIdBs.next(id);
    console.log('set PharmacyId: ', id);
  }










  // loadPharmacys(index, size) {
  //   return this.httpClient.get<GeoJson>(
  //     `https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json`
  //   ).pipe(
  //     map(res => {
  //       const length = res && res.features ? res.features.length : 0;
  //       const startIndex = index * size;
  //       const endIndex = startIndex < length ?
  //         Math.min(startIndex + size, length) :
  //         startIndex + size;
  //       console.log(startIndex, endIndex);
  //       return {
  //         data: length !== 0 ? res.features.slice(startIndex, endIndex) : [],
  //         length
  //       } as PageData;
  //     }),
  //     tap(res => {
  //       console.log(res, index, size);
  //       this.pharmacysDataBs.next(res);
  //     })
  //   );
  // }

  // loadCitys() {
  //   return this.httpClient.get<City[]>(
  //     `assets/json/tw-city.json`
  //   ).pipe(
  //     tap(res => {
  //       console.log(res);
  //       this.getTwCityBs.next(res);
  //     })
  //   );
  // }

}
