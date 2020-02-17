export interface Data {
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
