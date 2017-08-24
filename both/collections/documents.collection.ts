import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { UploadFS } from 'meteor/jalik:ufs';
import { Document } from "../models/document.model";

export const Documents = new MongoObservable.Collection<Document>('documents');

function loggedIn(userId) {
  return !!userId;
}

export const DocumentsStore = new UploadFS.store.Local({
  collection: Documents.collection,
  name: 'documents',
  path: process.env.PWD + '/../uploads/documents',
  filter: new UploadFS.Filter({
    maxSize: 1024 * 5 * 1000, // 5MB,
    contentTypes: ['application/pdf', 'application/msword', 'image/*']
  }),
  permissions: new UploadFS.StorePermissions({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
  })
});
