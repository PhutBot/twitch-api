const { Serializable } = require('helper-js');
const Model = require("./Model");


module.exports = class Channel extends Model {
    constructor(api, json) {
        super(api);
        Serializable.assign(this, json, 'broadcaster_id', String);
        Serializable.assign(this, json, 'broadcaster_login', String);
        Serializable.assign(this, json, 'broadcaster_name', String);
        Serializable.assign(this, json, 'broadcaster_language', String);
        Serializable.assign(this, json, 'game_id', String);
        Serializable.assign(this, json, 'game_name', String);
        Serializable.assign(this, json, 'title', String);
        Serializable.assign(this, json, 'delay', Number);
    }

    // get user() {
    //     return this._api.user
    // }

    // get stream() {
    //     return this._api.user
    // }

    get last_game_id() {
        return this._game_id;
    }

    get last_game_name() {
        return this._game_name;
    }

    get stream_delay() {
        return this._delay;
    }
};
