import { Component, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, Inject, OnDestroy } from '@angular/core';

import * as L from 'leaflet';
import { latLng, tileLayer } from 'leaflet';
import 'leaflet.markercluster';

import { DOCUMENT } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { OpenWeatherInfo, PharmaciesGeoJson } from 'src/app/models/data';
import { WeatherService } from 'src/app/services/weather.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input() snavOpened = true;
  @Input() isMobile = false;

  math = Math;
  public weatherInfo: OpenWeatherInfo;
  public weatherFetching = false;

  protected elem;

  public currentWidth: number; // current map width based on window width
  public currentHeight: number; // current map height based on window height

  protected baseLayer: any; // Map Base layer
  protected map; // Map reference (currently leaflet)
  protected group: L.MarkerClusterGroup;
  protected markersByIdMap: object;
  protected layersByIdMap: object;
  protected myPin: L.Icon;
  protected pharmacyPin: L.Icon;
  protected myMarker: L.Marker;

  subscriptions: Subscription = new Subscription();

  @ViewChild('map', { static: true }) protected mapDivRef: ElementRef;
  protected mapDiv: HTMLDivElement;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private dataService: DataService,
    private weatherService: WeatherService
  ) {
    this.elem = document.documentElement;

    this.group = L.markerClusterGroup({
      chunkedLoading: true,
      chunkProgress: (processed, total, elapsed) => {
        if (elapsed > 1000) {
          // if it takes more than a second to load, display the progress bar:
          // progress.style.display = 'block';
          // progressBar.style.width = Math.round(processed / total * 100) + '%';
          console.log('chunk still loading');
        }
        if (processed === total) {
          // all markers processed - hide the progress bar:
          // progress.style.display = 'none';
        }
      }
    });
    this.markersByIdMap = {};
    this.layersByIdMap = {};
    this.myPin = L.icon({
      iconUrl: `./assets/icons/svg/circle.svg`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -10]
    });
    this.pharmacyPin = L.icon({
      iconUrl: `./assets/icons/svg/pharmacy_pin.svg`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -24]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.snavOpened) {
      if (!changes.snavOpened.isFirstChange()) {
        // this.updateMapSize();
        // this.map.invalidateSize();
      }
    }
  }

  ngOnInit(): void {
    this.mapDiv = this.mapDivRef.nativeElement;
    // this.initMap();
    this.renderMap();

    this.subscriptions.add(this.dataService.allpharmacysData$.subscribe(
      geoJson => {
        console.log('map geoJson: ', geoJson);
        if (geoJson) {
          this.setMarkerClusterGroup(geoJson);
        }
      }
    ));

    this.subscriptions.add(this.dataService.pharmacyId$.subscribe(
      id => {
        console.log('nav pharmacy: ', id);
        if (id && this.markersByIdMap[id]) {
          this.map.flyTo(this.markersByIdMap[id].getLatLng(), 19, {
            animate: true,
            duration: 1
          });
          if (this.layersByIdMap[id]) {
            // console.log('hasLayer: ', this.group.hasLayer(this.layersByIdMap[id]));
            setTimeout(() => {
              this.group.zoomToShowLayer(this.layersByIdMap[id], () => {
                console.log('zoomToShowLayer done');
                // this.map.openPopup(this.layersByIdMap[id].getPopup());
              });
            }, 1500);
          }
        }
      }
    ));
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected renderMap(): void {
    this.map = L.map(this.mapDiv, {
      zoomControl: false,
      trackResize: true,
      // boxZoom: true,
      center: latLng(25.033611, 121.565),
      zoom: 12,
      layers: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          minZoom: 4,
          maxZoom: 19,
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, <a href="https://data.gov.tw/dataset/116285" target="_blank">資料來源:衛生福利部</a>'
        })
      ]
    });
    // this.map.setView(latLng(25.033611, 121.565), 12);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);
  }

  protected setMarkerClusterGroup(geoJson: any) {

    const geoJsonLayer = L.geoJSON(geoJson, {
      pointToLayer: (feature, latlng) => {
        const marker = L.marker(latlng, { icon: this.pharmacyPin });
        this.markersByIdMap[feature.properties.id] = marker;
        return marker;
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(this.pharmacyPopup(feature));
        this.layersByIdMap[feature.properties.id] = layer;
        // this.popupsByIdMap[feature.properties.id] = layer.getPopup();
      }
    });
    console.log(this.map.hasLayer(this.group));
    if (this.map.hasLayer(this.group)) {
      this.group.clearLayers();
      this.group.addLayer(geoJsonLayer);
      this.map.removeLayer(this.group);
      this.map.addLayer(this.group);
    } else {
      this.group.addLayer(geoJsonLayer);
      this.map.addLayer(this.group);

      this.getMyLocation();
    }
    this.map.fitBounds(this.group.getBounds());
  }

  pharmacyPopup(info) {
    return `
      <div class="pharmacyPopup">
        <h1 class="pharmacyPopup__title">
          <i class="material-icons-two-tone">local_pharmacy</i>
          ${ info?.properties?.name}
        </h1>
        <div class="pharmacyPopup-divider"></div>
        <div class="pharmacyPopup__info">
          <div class="pharmacyPopup__detail">
            <i class="material-icons-outlined">location_on</i>
            ${ info?.properties?.address || '-'}
          </div>
          <div class="pharmacyPopup__detail">
            <i class="material-icons-outlined">phone</i>
            ${ info?.properties?.phone || '-'}
          </div>
          <div class="pharmacyPopup__detail">
            <i class="material-icons-outlined">event_note</i>
            ${ info?.properties?.note || '-'}
          </div>
          <div class="pharmacyPopup__detail">
            <i class="material-icons-outlined">announcement</i>
            ${ info?.properties?.custom_note || '-'}
          </div>
          <div class="pharmacyPopup__detail">
            <i class="material-icons-outlined">update</i>
            ${ info?.properties?.updated || '-'}
          </div>
        </div>
        <div class="pharmacyPopup-divider"></div>
        <div class="pharmacyPopup__mask">
          <div class="${ info?.properties?.mask_adult === 0 ? 'none' : 'adults'}">
            <h4 class="mat-h3 m-0">成人口罩</h4>
            <div class="text">
              <span>${ info?.properties?.mask_adult}</span>片
            </div>
          </div>
          <div class="${ info?.properties?.mask_child === 0 ? 'none' : 'childs'}">
            <h4 class="mat-h3 m-0">兒童口罩</h4>
            <div class="text">
              <span>${ info?.properties?.mask_child}</span>片
            </div>
          </div>
        </div>
        <div class="pharmacyPopup-divider"></div>
        <div class="pharmacyPopup__action">
          <a href="https://www.google.com/maps/search/?api=1&query=${ info?.properties?.address}" class="google_map" target="_blank">
            <img src="./assets/icons/svg/google_map.svg" />
            Google 地圖查看
          </a>
        </div>
      </div>
    `;
  }

  @HostListener('window:resize', ['$event'])
  protected onResize(event: any): void {
    // this.updateMapSize();
    // this.map.invalidateSize();
  }

  /**
   * Update the current width/height occupied by the map
   */
  // protected updateMapSize(): void {
  //   // update width/height settings as you see fit
  //   this.currentWidth = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
  //   this.currentHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  // }

  public getMyLocation(): void {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {

        // 取得天氣資訊
        this.getWeather(position.coords.latitude, position.coords.longitude);
        const pos = latLng(
          position.coords.latitude,
          position.coords.longitude
        );
        console.log(pos);
        this.map.flyTo(pos, 16, {
          animate: true,
          duration: 1.5
        });
        if (this.myMarker) {
          this.map.removeLayer(this.myMarker);
        }
        this.myMarker = L.marker(latLng(position.coords.latitude, position.coords.longitude), { icon: this.myPin }).addTo(this.map);

      }, (error) => {
        console.error(error);
        this.handleLocationError(true);
      });
    } else {
      // Browser doesn't support Geolocation
      this.handleLocationError(false);
    }
  }

  private handleLocationError(browserHasGeolocation) {
  }

  getWeather(lat, lon) {
    this.weatherFetching = true;
    this.weatherService.getWeatherInfo(lat, lon).subscribe(
      info => {
        console.log('weather: ', info);
        this.weatherInfo = info;
        this.weatherFetching = false;
      }, error => {
        console.error(error);
        this.weatherFetching = false;
      }
    );
  }

  fullscreenToggle() {
    if (!this.isFullScreen()) {
      if (this.elem.requestFullscreen) {
        this.elem.requestFullscreen();
      } else if (this.elem.mozRequestFullScreen) {
        /* Firefox */
        this.elem.mozRequestFullScreen();
      } else if (this.elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.elem.webkitRequestFullscreen();
      } else if (this.elem.msRequestFullscreen) {
        /* IE/Edge */
        this.elem.msRequestFullscreen();
      }
    } else if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
      return;
    } else if (this.document.mozCancelFullScreen) {
      /* Firefox */
      this.document.mozCancelFullScreen();
      return;
    } else if (this.document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      this.document.webkitExitFullscreen();
      return;
    } else if (this.document.msExitFullscreen) {
      /* IE/Edge */
      this.document.msExitFullscreen();
      return;
    }
  }

  isFullScreen(): boolean {
    return !!(this.document.fullscreenElement || this.document.mozFullScreenElement || this.document.webkitFullscreenElement || this.document.msFullscreenElement);
  }
}
