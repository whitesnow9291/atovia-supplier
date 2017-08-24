import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Images, ImagesStore } from "../../both/collections/images.collection";
import { Image } from "../../both/models/image.model";
import { isLoggedIn, userIsInRole } from "../imports/services/auth";

Meteor.methods({
  /* delete image by id */
    "images.delete": (imageId: string) => {
        userIsInRole(["supplier"]);

        let fs = require('fs');
        /* remove original image */
        let image = Images.collection.findOne({_id: imageId});
        if (typeof image == "undefined" || !image._id) {
            throw new Meteor.Error(`Invalid image-id "${imageId}"`);
        }
        let imagePath = process.env.PWD + '/../uploads/images/' + image._id + '.' + image.extension;
        fs.unlink(imagePath, (res) => {
            //console.log("unlink.img:", res);
        });
        /* reset data in collections */
        Images.collection.remove({_id: image._id});

        return true;
    }
})
