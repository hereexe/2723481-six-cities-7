import 'reflect-metadata';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import mongoose from 'mongoose';
import {container} from '../dist/container.js';
import {Component} from '../dist/shared/types/component.enum.js';
import {createOffer} from '../dist/helpers/create-offer.js';
import {CommentModel} from '../dist/shared/modules/comment/comment.entity.js';
import {OfferModel} from '../dist/shared/modules/offer/offer.entity.js';

test('services keep ratings, favorites, lists and related documents consistent', {
  skip: !process.env.TEST_MONGO_URI && 'Задайте TEST_MONGO_URI для интеграционной проверки MongoDB.',
  timeout: 30000,
}, async () => {
  const databaseName = `six_cities_services_${process.pid}_${Date.now()}`;
  const uri = new URL(process.env.TEST_MONGO_URI);
  uri.pathname = `/${databaseName}`;
  const database = container.get(Component.DatabaseClient);
  const users = container.get(Component.UserService);
  const offers = container.get(Component.OfferService);
  const comments = container.get(Component.CommentService);
  const source = createOffer((await readFile(new URL('../mocks/test.tsv', import.meta.url), 'utf8')).trim().split(/\r?\n/)[0]);

  try {
    await database.connect(uri.toString());
    const author = await users.create(source.author, 'test-salt');
    const another = await users.create({...source.author, email: 'another@example.com'}, 'test-salt');
    const offer = await offers.create({...source, author: author._id, rating: 5, commentsCount: 100});
    assert.equal(offer.rating, 0);
    assert.equal(offer.commentsCount, 0);
    assert.equal((await offers.findById(offer.id)).isFavorite, false);
    assert.equal((await users.updateById(author.id, {avatarPath: 'avatar.png'})).avatarPath, 'avatar.png');

    for (let index = 0; index < 2; index++) {
      assert.equal((await offers.setFavorite(offer.id, author.id, {isFavorite: true})).isFavorite, true);
    }
    assert.equal((await users.findById(author.id)).favoriteOffers.length, 1);
    assert.equal((await offers.findFavorites(author.id)).length, 1);
    assert.deepEqual(await offers.findFavorites(another.id), []);
    assert.equal((await offers.findById(offer.id, another.id)).isFavorite, false);
    assert.equal((await offers.find(60, author.id))[0].isFavorite, true);
    assert.equal((await offers.setFavorite(offer.id, author.id, {isFavorite: false})).isFavorite, false);
    assert.equal((await offers.setFavorite(offer.id, author.id, {isFavorite: false})).isFavorite, false);
    assert.deepEqual(await offers.findFavorites(author.id), []);

    for (const rating of [1, 2, 2]) {
      const comment = await comments.create({text: 'Comment', rating, author: author._id, offer: offer._id});
      assert.ok(comment.postDate instanceof Date);
      assert.equal((await comment.populate('author')).author.email, author.email);
    }
    assert.equal((await offers.findById(offer.id)).rating, 1.7);
    assert.equal((await offers.findById(offer.id)).commentsCount, 3);
    await Promise.all(Array.from({length: 51}, () => comments.create({
      text: 'Parallel comment', rating: 5, author: another._id, offer: offer._id,
    })));
    const updated = await offers.findById(offer.id);
    assert.equal(updated.rating, 4.8);
    assert.equal(updated.commentsCount, 54);
    assert.equal(updated.ratingTotal, undefined);
    const latestComments = await comments.findByOfferId(offer.id);
    assert.equal(latestComments.length, 50);
    assert.ok(latestComments.every((comment, index) => !index || latestComments[index - 1].postDate >= comment.postDate));
    assert.equal((await offers.updateById(offer.id, {title: 'Updated title'})).title, 'Updated title');
    assert.equal((await offers.findById(offer.id)).rating, 4.8);

    await Promise.all(Array.from({length: 64}, (_, index) => offers.create({
      ...source, author: author._id, isPremium: true, postDate: new Date(2020, 0, index + 1),
    })));
    const list = await offers.find();
    assert.equal(list.length, 60);
    assert.equal((await offers.find(2)).length, 2);
    assert.ok(list.every((entry, index) => !index || list[index - 1].postDate >= entry.postDate));
    const premium = await offers.findPremiumByCity(source.city.name);
    assert.equal(premium.length, 3);
    assert.ok(premium.every((entry) => entry.isPremium && entry.city.name === source.city.name));
    assert.deepEqual(await offers.findPremiumByCity('Unknown'), []);

    const missing = new mongoose.Types.ObjectId();
    await assert.rejects(comments.create({text: 'Missing offer', rating: 1, author: author._id, offer: missing}));
    assert.equal(await offers.setFavorite(missing.toString(), author.id, {isFavorite: true}), null);
    assert.equal(await offers.updateById(missing.toString(), {title: 'Missing'}), null);
    await offers.setFavorite(offer.id, author.id, {isFavorite: true});
    await offers.setFavorite(offer.id, another.id, {isFavorite: true});
    await offers.deleteById(offer.id);
    assert.equal(await offers.findById(offer.id), null);
    assert.equal(await CommentModel.countDocuments({offer: offer._id}), 0);
    assert.deepEqual((await users.findById(author.id)).favoriteOffers, []);
    assert.deepEqual((await users.findById(another.id)).favoriteOffers, []);
    assert.equal(await OfferModel.countDocuments(), 64);
    assert.equal(await offers.deleteById(offer.id), null);
  } finally {
    if (mongoose.connection.name === databaseName) {
      await mongoose.connection.dropDatabase();
    }
    await database.disconnect();
  }
});
