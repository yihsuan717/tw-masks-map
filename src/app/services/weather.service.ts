import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OpenWeatherInfo } from '../models/data';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private httpClient: HttpClient) { }

  getWeatherInfo(lat, lon) {
    const API_KEY = 'd1766b5b432d2a021354850e1f756fed';
    return this.httpClient.get<OpenWeatherInfo>(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=zh_tw&units=metric`
    );
  }
}
