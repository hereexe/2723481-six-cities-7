import {MockOffer} from '../types/mock-offer.type.js';
import {Facility, Offer} from '../types/offer.type.js';
import {getRandomBoolean, getRandomFloat, getRandomInteger, getRandomItem, getRandomItems} from './random.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAYS_AGO = 7;

const Rating = {Min: 1, Max: 5} as const;
const Rooms = {Min: 1, Max: 8} as const;
const Guests = {Min: 1, Max: 10} as const;
const Price = {Min: 100, Max: 100000} as const;

export function generateOffer(templates: MockOffer[]): Offer {
  const template = getRandomItem(templates);

  return {
    ...template,
    postDate: new Date(Date.now() - getRandomInteger(0, MAX_DAYS_AGO * DAY_MS)),
    images: getRandomItems(template.images, template.images.length),
    isPremium: getRandomBoolean(),
    isFavorite: getRandomBoolean(),
    rating: getRandomFloat(Rating.Min, Rating.Max),
    rooms: getRandomInteger(Rooms.Min, Rooms.Max),
    guests: getRandomInteger(Guests.Min, Guests.Max),
    price: getRandomInteger(Price.Min, Price.Max),
    facilities: getRandomItems(Object.values(Facility)),
    commentsCount: 0
  };
}
