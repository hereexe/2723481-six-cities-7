import {Facility, HousingType, Offer} from '../types/offer.type.js';
import {UserType} from '../types/user.type.js';

const LIST_SEPARATOR = ';';
const EXPECTED_FIELD_COUNT = 23;

export function createOffer(line: string): Offer {
  const fields = line.split('\t');

  if (fields.length !== EXPECTED_FIELD_COUNT) {
    throw new Error(`Ожидалось полей: ${EXPECTED_FIELD_COUNT}, получено: ${fields.length}`);
  }

  const [
    title,
    description,
    postDate,
    cityName,
    cityLatitude,
    cityLongitude,
    previewImage,
    images,
    isPremium,
    isFavorite,
    rating,
    housingType,
    rooms,
    guests,
    price,
    facilities,
    authorName,
    authorEmail,
    authorAvatar,
    authorPassword,
    authorType,
    latitude,
    longitude
  ] = fields;

  return {
    title,
    description,
    postDate: new Date(postDate),
    city: {
      name: cityName,
      location: {
        latitude: Number(cityLatitude),
        longitude: Number(cityLongitude)
      }
    },
    previewImage,
    images: images.split(LIST_SEPARATOR),
    isPremium: isPremium === 'true',
    isFavorite: isFavorite === 'true',
    rating: Number(rating),
    type: housingType as HousingType,
    rooms: Number(rooms),
    guests: Number(guests),
    price: Number(price),
    facilities: facilities.split(LIST_SEPARATOR) as Facility[],
    author: {
      name: authorName,
      email: authorEmail,
      avatarPath: authorAvatar || undefined,
      password: authorPassword,
      type: authorType as UserType
    },
    commentsCount: 0,
    location: {
      latitude: Number(latitude),
      longitude: Number(longitude)
    }
  };
}
