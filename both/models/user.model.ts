import { Meteor } from 'meteor/meteor';

export interface User extends Meteor.User {
    username: string;
    emails: [
        {
            address: string;
            verified: boolean;
        }
    ];
    profile: {
        firstName: string;
        lastName: string;
        fullName: string;
        contact: string;
        image: {
          id: string;
          url: string;
          name: string;
        };
        address: {
          address1: string;
          address2: string;
          suburb: string;
          state: string;
          country: string;
          postCode: string;
        };
        supplier: {
          companyName: string;
          ownerName: string;
          agentIdentity: {
            id: string;
            url: string;
            name: string;
            verified: boolean;
          };
          agentCertificate: {
            id: string;
            url: string;
            name: string;
            verified: boolean;
          };
        };
    };
    active: boolean,
    deleted: boolean;
}
