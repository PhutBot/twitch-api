const { Serializable } = require('helper-js');
const Model = require("./Model");


module.exports = class User extends Model {
    constructor(api, json) {
        super(api);
        Serializable.assign(this, json, 'id', String);
        Serializable.assign(this, json, 'login', String);
        Serializable.assign(this, json, 'display_name', String);
        Serializable.assign(this, json, 'type', String);
        Serializable.assign(this, json, 'broadcaster_type', String);
        Serializable.assign(this, json, 'description', String);
        Serializable.assign(this, json, 'profile_image_url', String);
        Serializable.assign(this, json, 'offline_image_url', String);
        Serializable.assign(this, json, 'view_count', Number);
        Serializable.assign(this, json, 'email', String);
        Serializable.assign(this, json, 'created_at', Date);
    }

    // get channel() {
    //     return this._api.user
    // }

    // get stream() {
    //     return this._api.user
    // }

    get id() {
        return this._id;
    }

    get login() {
        return this._login;
    }

    get name() {
        return this._display_name;
    }

    get creation_date() {
        return this._created_at;
    }
};
