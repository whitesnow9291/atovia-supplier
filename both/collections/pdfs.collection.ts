import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { UploadFS } from 'meteor/jalik:ufs';
import { PDF } from "../models/pdf.model";

export const PDFs = new MongoObservable.Collection<PDF>('pdfs');

function loggedIn(userId) {
  return !!userId;
}

export const PDFsStore = new UploadFS.store.Local({
  collection: PDFs.collection,
  name: 'pdfs',
  path: process.env.PWD + '/../uploads/pdfs',
  filter: new UploadFS.Filter({
    maxSize: 1024 * 5 * 1000, // 5MB,
    contentTypes: ['application/pdf']
  }),
  permissions: new UploadFS.StorePermissions({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
  })
});
