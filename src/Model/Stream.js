const { Serializable } = require('helper-js');
const Model = require("./Model");


module.exports = class Stream extends Model {
    constructor(api, json) {
        super(api);
        Serializable.assign(this, json, 'id', String);
        Serializable.assign(this, json, 'user_id', String);
        Serializable.assign(this, json, 'user_login', String);
        Serializable.assign(this, json, 'user_name', String);
        Serializable.assign(this, json, 'game_id', String);
        Serializable.assign(this, json, 'game_name', String);
        Serializable.assign(this, json, 'type', String);
        Serializable.assign(this, json, 'title', String);
        Serializable.assign(this, json, 'viewer_count', Number);
        Serializable.assign(this, json, 'started_at', Date);
        Serializable.assign(this, json, 'language', String);
        Serializable.assign(this, json, 'thumbnail_url', String);
        Serializable.assignArray(this, json, 'tag_ids', String);
        Serializable.assign(this, json, 'is_mature', Boolean);
    }

    // get channel() {
    //     return this._api.user
    // }

    // get user() {
    //     return this._api.user
    // }

    get id() {
        return this._id;
    }

    get game_id() {
        return this._game_id;
    }

    get game_name() {
        return this._game_name;
    }

    get title() {
        return this._title;
    }

    get viewer_count() {
        return this._viewer_count;
    }

    get creation_date() {
        return this._started_at;
    }

    get is_mature() {
        return this._is_mature;
    }
};
