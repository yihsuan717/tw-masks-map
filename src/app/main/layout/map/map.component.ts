import { Component, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, Inject } from '@angular/core';

import * as L from 'leaflet';
import { DOCUMENT } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { OpenWeatherInfo } from 'src/app/models/data';
import { WeatherService } from 'src/app/services/weather.service';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnChanges, AfterViewInit {

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

  @ViewChild('map', { static: true }) protected mapDivRef: ElementRef;
  protected mapDiv: HTMLDivElement;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private dataService: DataService,
    private weatherService: WeatherService
  ) {

    this.elem = document.documentElement;

    // default values
    this.baseLayer = null;
    this.currentWidth = 1920;
    this.currentHeight = 1080;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.snavOpened) {
      if (!changes.snavOpened.isFirstChange()) {
        this.updateMapSize();
        this.map.invalidateSize();
      }
    }
  }

  ngOnInit(): void {
    this.mapDiv = this.mapDivRef.nativeElement;

    this.initMap();
    this.renderMap();
    this.getMyLocation();
  }

  ngAfterViewInit(): void {
    this.map.invalidateSize();
  }

  protected initMap(): void {
    this.updateMapSize();
  }

  protected renderMap(): void {
    this.map = L.map(this.mapDiv, {
      zoomControl: false,
      trackResize: true,
      // boxZoom: true,
    }).setView([25.033611, 121.565], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {
      foo: 'bar', attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    }).addTo(this.map);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

  }

  protected showMarkers() {

  }

  @HostListener('window:resize', ['$event'])
  protected onResize(event: any): void {
    this.updateMapSize();
    this.map.invalidateSize();
  }

  /**
   * Update the current width/height occupied by the map
   */
  protected updateMapSize(): void {
    // update width/height settings as you see fit
    this.currentWidth = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
    this.currentHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  }

  public getMyLocation(): void {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {

        // 取得天氣資訊
        this.getWeather(position.coords.latitude, position.coords.longitude);

        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log(pos);

        // infoWindow.setPosition(pos);
        // infoWindow.setContent('Location found.');
        // infoWindow.open(map);
        // map.setCenter(pos);
      }, () => {
        // handleLocationError(true, infoWindow, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      // handleLocationError(false, infoWindow, map.getCenter());
    }
  }

  // handleLocationError(browserHasGeolocation, infoWindow, pos) {
  //   infoWindow.setPosition(pos);
  //   infoWindow.setContent(browserHasGeolocation ?
  //     'Error: The Geolocation service failed.' :
  //     'Error: Your browser doesn\'t support geolocation.');
  //   infoWindow.open(map);
  // }

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
