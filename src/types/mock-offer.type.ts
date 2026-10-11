import {City} from './city.type.js';
import {Location} from './location.type.js';
import {Facility, HousingType} from './offer.type.js';
import {User} from './user.type.js';

export type MockOffer = {
  title: string;
  description: string;
  city: City;
  previewImage: string;
  images: string[];
  type: HousingType;
  facilities: Facility[];
  author: User;
  location: Location;
};
