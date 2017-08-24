import { UploadFS } from 'meteor/jalik:ufs';
import { PDFsStore } from '../collections/pdfs.collection';

export function upload(data: File): Promise<any> {
  return new Promise((resolve, reject) => {
    // pick from an object only: name, type and size
    const file = {
      name: data.name,
      type: data.type,
      size: data.size,
    };

    const upload = new UploadFS.Uploader({
      data,
      file,
      store: PDFsStore,
      onError: reject,
      onComplete: resolve
    });

    upload.start();
  });
}
