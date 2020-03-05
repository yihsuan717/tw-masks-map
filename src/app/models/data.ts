export interface PageData {
  data: Feature[];
  length: number;
}

export interface PharmaciesGeoJson {
  type: string;
  features: Feature[];
}

export interface Feature {
  type: string;
  properties: Properties;
  geometry: Geometry;
}


export interface Geometry {
  type: string;
  coordinates: number[];
}

export interface Properties {
  id: string;
  name: string;
  phone: string;
  address: string;
  mask_adult: number;
  mask_child: number;
  updated: string;
  available: string;
  note: number | string;
  custom_note: string;
  website: string;
  county: string;
  town: string;
  cunli: string;
  service_periods: string;
  service_note: number | string;
}

export interface City {
  CityName: string;
  CityEngName: string;
  AreaList: AreaList[];
}

export interface AreaList {
  ZipCode: string;
  AreaName: string;
  AreaEngName: string;
}

export interface OpenWeatherInfo {
  coord: Coord;
  weather: Weather[];
  base: string;
  main: Main;
  wind: Wind;
  rain: Rain;
  clouds: Clouds;
  dt: number;
  sys: Sys;
  id: number;
  name: string;
  cod: number;
}

interface Sys {
  message: number;
  country: string;
  sunrise: number;
  sunset: number;
}

interface Clouds {
  all: number;
}

interface Rain {
  '3h': number;
}

interface Wind {
  speed: number;
  deg: number;
}

interface Main {
  temp: number;
  pressure: number;
  humidity: number;
  temp_min: number;
  temp_max: number;
  sea_level: number;
  grnd_level: number;
}

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Coord {
  lon: number;
  lat: number;
}

export enum FILTERS_TYPE {
  FAVORITE = 1,
  DISTANCE = 2
}

export const FILTERS_ARR = [{
  id: FILTERS_TYPE.FAVORITE,
  name: '已收藏',
  icon: 'bookmark'
}, {
  id: FILTERS_TYPE.DISTANCE,
  name: '附近 2 公里內',
  icon: 'location_searching',
}];
