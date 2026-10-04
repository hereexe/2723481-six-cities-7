import {City} from './city.type.js';
import {Location} from './location.type.js';
import {User} from './user.type.js';

export enum HousingType {
  Apartment = 'apartment',
  House = 'house',
  Room = 'room',
  Hotel = 'hotel'
}

export enum Facility {
  Breakfast = 'Breakfast',
  AirConditioning = 'Air conditioning',
  LaptopFriendlyWorkspace = 'Laptop friendly workspace',
  BabySeat = 'Baby seat',
  Washer = 'Washer',
  Towels = 'Towels',
  Fridge = 'Fridge'
}

export type Offer = {
  title: string;
  description: string;
  postDate: Date;
  city: City;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: HousingType;
  rooms: number;
  guests: number;
  price: number;
  facilities: Facility[];
  author: User;
  commentsCount: number;
  location: Location;
};
