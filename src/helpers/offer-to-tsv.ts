import {Offer} from '../types/offer.type.js';

const LIST_SEPARATOR = ';';

export function offerToTsv(offer: Offer): string {
  return [
    offer.title,
    offer.description,
    offer.postDate.toISOString(),
    offer.city.name,
    offer.city.location.latitude,
    offer.city.location.longitude,
    offer.previewImage,
    offer.images.join(LIST_SEPARATOR),
    offer.isPremium,
    offer.isFavorite,
    offer.rating,
    offer.type,
    offer.rooms,
    offer.guests,
    offer.price,
    offer.facilities.join(LIST_SEPARATOR),
    offer.author.name,
    offer.author.email,
    offer.author.avatarPath ?? '',
    offer.author.password,
    offer.author.type,
    offer.location.latitude,
    offer.location.longitude
  ].join('\t');
}
