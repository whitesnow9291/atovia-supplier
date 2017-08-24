import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { UploadFS } from 'meteor/jalik:ufs';
import { Image } from "../models/image.model";

export const Images = new MongoObservable.Collection<Image>('images');

function loggedIn(userId) {
  return !!userId;
}

export const ImagesStore = new UploadFS.store.Local({
  collection: Images.collection,
  name: 'images',
  path: process.env.PWD + '/../uploads/images',
  filter: new UploadFS.Filter({
    contentTypes: ['image/*']
  }),
  /*copyTo: [
    ThumbsStore
  ],*/
  /*transformWrite(from, to, fileId, file) {
    // Resize to 1280x800
    const gm = require('gm');

    gm(from, file.name)
      .resize(1280, 800)
      .gravity('Center')
      .extent(1280, 800)
      .quality(100)
      .stream()
      .pipe(to);
  },*/
  permissions: new UploadFS.StorePermissions({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
  })
});
