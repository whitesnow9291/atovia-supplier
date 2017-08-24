declare module "meteor/jalik:ufs" {
  interface Uploader {
    start: () => void;
  }

  interface UploadFS {
    Uploader: (options: any) => Uploader;
  }

  export var UploadFS;
}

declare module "meteor/alanning:roles" {
  export module Roles {
    function userIsInRole(id?: any,value?: any): boolean;
    function addUsersToRoles(id?: any,value?: any): boolean;
  }
}

interface JQuery {
    datepicker(options: any): any;
}
